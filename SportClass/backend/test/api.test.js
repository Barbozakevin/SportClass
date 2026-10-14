// Prueba de extremo a extremo de la API (sin librerías extra: usa fetch de Node 18+).
// Ejecutar con:  npm test
const os = require("os");
const path = require("path");
const fs = require("fs");

// Usa un archivo de datos temporal para no ensuciar el real.
const archivoTemporal = path.join(
  fs.mkdtempSync(path.join(os.tmpdir(), "sportbook-")),
  "registros.json"
);
process.env.DATA_FILE = archivoTemporal;

const app = require("../server");
const assert = require("assert");

function fechaFutura(dias = 7) {
  const d = new Date();
  d.setDate(d.getDate() + dias);
  const mes = String(d.getMonth() + 1).padStart(2, "0");
  const dia = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${mes}-${dia}`;
}

const reservaValida = {
  nombre: "Ana Pérez",
  email: "ana@correo.com",
  clase: "Yoga",
  categoria: "Principiante",
  fecha: fechaFutura(),
  horario: "Mañana",
  hora: "08:00",
  descripcion: "Prefiero horario de mañana",
};

async function main() {
  const servidor = app.listen(0);
  const base = `http://localhost:${servidor.address().port}`;
  const post = (body) =>
    fetch(`${base}/registros`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  const put = (id, body) =>
    fetch(`${base}/registros/${encodeURIComponent(id)}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  const borrar = (id) =>
    fetch(`${base}/registros/${encodeURIComponent(id)}`, {
      method: "DELETE",
    });

  try {
    // 1. Lista vacía al inicio
    let res = await fetch(`${base}/registros`);
    assert.strictEqual(res.status, 200);
    assert.deepStrictEqual(await res.json(), []);
    console.log("OK  GET con lista vacía -> 200 []");

    // 2. Registro válido
    res = await post(reservaValida);
    assert.strictEqual(res.status, 201);
    const creado = await res.json();
    assert.ok(creado.id, "debe generar un id");
    assert.strictEqual(creado.nombre, "Ana Pérez");
    console.log("OK  POST válido -> 201 con id");

    // 3. Segundo registro: no se pierde el primero
    res = await post({ ...reservaValida, nombre: "Luis Mora", clase: "Spinning" });
    assert.strictEqual(res.status, 201);
    const segundo = await res.json();
    assert.notStrictEqual(segundo.id, creado.id);
    res = await fetch(`${base}/registros`);
    const lista = await res.json();
    assert.strictEqual(lista.length, 2);
    console.log("OK  Segundo POST conserva el anterior (2 registros)");

    // 4. Datos inválidos
    const invalidos = [
      [{}, "cuerpo vacío"],
      [{ ...reservaValida, email: "no-es-email" }, "email inválido"],
      [{ ...reservaValida, email: "ana@correo.comletras" }, "letras después de .com"],
      [{ ...reservaValida, email: "ana@correo.com!" }, "carácter después de .com"],
      [{ ...reservaValida, email: "ana@correo.com\n" }, "salto después de .com"],
      [{ ...reservaValida, email: "ana@correo.xn--com-9ma" }, "sufijo .com codificado"],
      [{ ...reservaValida, email: "ana@correo.comñ" }, "letra acentuada tras .com"],
      [{ ...reservaValida, horario: "Madrugada" }, "horario no permitido"],
      [{ ...reservaValida, horario: "Mañana", hora: "18:00" }, "hora fuera de franja"],
      [{ ...reservaValida, fecha: "2020-01-01" }, "fecha pasada"],
      [{ ...reservaValida, fecha: "2026-02-31" }, "fecha inexistente"],
      [{ ...reservaValida, nombre: "  " }, "nombre vacío"],
      [{ ...reservaValida, clase: "Ajedrez" }, "clase no permitida"],
      [{ ...reservaValida, categoria: "Experto" }, "categoría no permitida"],
    ];
    for (const [cuerpo, nombre] of invalidos) {
      res = await post(cuerpo);
      assert.strictEqual(res.status, 400, `debe rechazar: ${nombre}`);
      const error = await res.json();
      assert.ok(error.errores, "debe indicar los errores");
    }
    console.log(`OK  ${invalidos.length} casos inválidos -> 400`);

    // 5. Actualización valida los campos y conserva identidad y fecha de creación.
    const actualizacion = {
      ...reservaValida,
      nombre: "Ana Pérez Actualizada",
      fecha: fechaFutura(14),
    };
    res = await put(creado.id, actualizacion);
    assert.strictEqual(res.status, 200);
    const actualizado = await res.json();
    assert.strictEqual(actualizado.id, creado.id);
    assert.strictEqual(actualizado.creadoEn, creado.creadoEn);
    assert.strictEqual(actualizado.nombre, actualizacion.nombre);
    assert.strictEqual(actualizado.horario, "Mañana");
    assert.strictEqual(actualizado.hora, "08:00");

    res = await put(creado.id, {
      ...actualizacion,
      email: "ana@correo.comextra",
    });
    assert.strictEqual(res.status, 400);
    assert.match((await res.json()).errores.email, /después de \.com/);

    res = await put(creado.id, {
      ...actualizacion,
      email: "ana@correo.comletras",
    });
    assert.strictEqual(res.status, 400);
    assert.match((await res.json()).errores.email, /después de \.com/);

    res = await put(creado.id, {
      ...actualizacion,
      email: "ana@correo.xn--com-9ma",
    });
    assert.strictEqual(res.status, 400);
    assert.match((await res.json()).errores.email, /después de \.com/);

    res = await put("id-inexistente", reservaValida);
    assert.strictEqual(res.status, 404);
    console.log("OK  PUT actualiza, valida y devuelve 404 para id inexistente");

    // 6. Borrado elimina solo la reserva solicitada.
    res = await borrar(segundo.id);
    assert.strictEqual(res.status, 200);
    res = await borrar(segundo.id);
    assert.strictEqual(res.status, 404);
    res = await fetch(`${base}/registros`);
    const despuesDeBorrar = await res.json();
    assert.strictEqual(despuesDeBorrar.length, 1);
    assert.strictEqual(despuesDeBorrar[0].id, creado.id);
    console.log("OK  DELETE elimina y devuelve 404 si ya no existe");

    // 7. JSON mal formado no tumba el servidor
    res = await fetch(`${base}/registros`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: "{esto no es json",
    });
    assert.strictEqual(res.status, 400);
    res = await fetch(`${base}/registros`);
    assert.strictEqual(res.status, 200);
    console.log("OK  JSON mal formado -> 400 y el servidor sigue vivo");

    // 8. Persistencia: el archivo contiene los datos (sobrevive a reinicios)
    const enDisco = JSON.parse(fs.readFileSync(archivoTemporal, "utf8"));
    assert.strictEqual(enDisco.length, 1);
    assert.strictEqual(enDisco[0].nombre, actualizacion.nombre);
    console.log("OK  Persistencia de cambios en archivo JSON (1 registro en disco)");

    // 9. Archivo corrupto: error controlado, no caída
    fs.writeFileSync(archivoTemporal, "{{{ corrupto");
    res = await fetch(`${base}/registros`);
    assert.strictEqual(res.status, 500);
    console.log("OK  Archivo corrupto -> 500 controlado");

    console.log("\nTodas las pruebas pasaron.");
  } finally {
    servidor.close();
  }
}

main().catch((error) => {
  console.error("FALLÓ:", error.message);
  process.exit(1);
});
