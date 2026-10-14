import { API_URL } from "../config.js";

// Error con la información que devuelve el servidor (mensaje y errores por campo).
export class ErrorApi extends Error {
  constructor(mensaje, { estado, errores } = {}) {
    super(mensaje);
    this.estado = estado;
    this.errores = errores || {};
  }
}

async function pedir(ruta, opciones) {
  let respuesta;
  try {
    respuesta = await fetch(`${API_URL}${ruta}`, opciones);
  } catch {
    // fetch solo falla por red: servidor apagado, URL incorrecta o CORS.
    throw new ErrorApi(
      "No se pudo conectar con el servidor. Verifique que el backend esté encendido."
    );
  }

  let cuerpo = null;
  try {
    cuerpo = await respuesta.json();
  } catch {
    // respuesta sin JSON
  }

  if (!respuesta.ok) {
    throw new ErrorApi(cuerpo?.mensaje || "Ocurrió un error en el servidor.", {
      estado: respuesta.status,
      errores: cuerpo?.errores,
    });
  }
  return cuerpo;
}

// GET /registros
export function obtenerRegistros() {
  return pedir("/registros");
}

// POST /registros
export function crearRegistro(datos) {
  return pedir("/registros", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(datos),
  });
}

// PUT /registros/:id
export function actualizarRegistro(id, datos) {
  return pedir(`/registros/${encodeURIComponent(id)}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(datos),
  });
}

// DELETE /registros/:id
export function eliminarRegistro(id) {
  return pedir(`/registros/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
}

// GET /opciones (clases y categorías para los select)
export function obtenerOpciones() {
  return pedir("/opciones");
}
