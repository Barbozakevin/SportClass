// Lectura y escritura del archivo JSON que hace de "base de datos".
const fs = require("fs/promises");
const path = require("path");
const crypto = require("crypto");

const RUTA_DATOS =
  process.env.DATA_FILE || path.join(__dirname, "data", "registros.json");

// Cola simple para que dos escrituras simultáneas no se pisen entre sí.
let cola = Promise.resolve();

async function asegurarArchivo() {
  try {
    await fs.access(RUTA_DATOS);
  } catch {
    await fs.mkdir(path.dirname(RUTA_DATOS), { recursive: true });
    await fs.writeFile(RUTA_DATOS, "[]", "utf8");
  }
}

async function leerRegistros() {
  await asegurarArchivo();
  const contenido = await fs.readFile(RUTA_DATOS, "utf8");
  if (!contenido.trim()) return [];
  const datos = JSON.parse(contenido);
  if (!Array.isArray(datos)) {
    throw new Error("El archivo JSON no contiene una lista de registros.");
  }
  return datos;
}

async function escribirRegistros(registros) {
  // Se escribe en un archivo temporal y luego se renombra: evita dejar el JSON a medias.
  const temporal = `${RUTA_DATOS}.tmp`;
  await fs.writeFile(temporal, JSON.stringify(registros, null, 2), "utf8");
  await fs.rename(temporal, RUTA_DATOS);
}

function agregarRegistro(datos) {
  const tarea = cola.then(async () => {
    const registros = await leerRegistros();
    const nuevo = {
      id: crypto.randomUUID(),
      ...datos,
      creadoEn: new Date().toISOString(),
    };
    registros.push(nuevo);
    await escribirRegistros(registros);
    return nuevo;
  });
  // Si falla, la cola no debe quedar rota para las siguientes peticiones.
  cola = tarea.catch(() => {});
  return tarea;
}

function actualizarRegistro(id, datos) {
  const tarea = cola.then(async () => {
    const registros = await leerRegistros();
    const indice = registros.findIndex((registro) => registro.id === id);
    if (indice === -1) return null;

    const actualizado = {
      ...registros[indice],
      ...datos,
      id: registros[indice].id,
      creadoEn: registros[indice].creadoEn,
    };
    registros[indice] = actualizado;
    await escribirRegistros(registros);
    return actualizado;
  });
  cola = tarea.catch(() => {});
  return tarea;
}

function eliminarRegistro(id) {
  const tarea = cola.then(async () => {
    const registros = await leerRegistros();
    const restantes = registros.filter((registro) => registro.id !== id);
    if (restantes.length === registros.length) return false;

    await escribirRegistros(restantes);
    return true;
  });
  cola = tarea.catch(() => {});
  return tarea;
}

module.exports = {
  leerRegistros,
  agregarRegistro,
  actualizarRegistro,
  eliminarRegistro,
  asegurarArchivo,
  RUTA_DATOS,
};
