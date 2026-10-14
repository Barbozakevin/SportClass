// Validaciones del servidor (se repiten las del frontend: nunca confiar solo en el cliente)
const { domainToUnicode } = require("node:url");

const CATEGORIAS = ["Principiante", "Intermedio", "Avanzado", "Infantil"];
const HORAS_POR_FRANJA = {
  Mañana: ["06:00", "07:00", "08:00", "09:00", "10:00", "11:00"],
  Tarde: ["12:00", "13:00", "14:00", "15:00", "16:00", "17:00"],
  Noche: ["18:00", "19:00", "20:00", "21:00"],
};
const CLASES = [
  "Yoga",
  "Pilates",
  "Spinning",
  "Natación",
  "Fútbol",
  "Baloncesto",
  "Zumba",
  "Crossfit",
];

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const FECHA_REGEX = /^\d{4}-\d{2}-\d{2}$/;

function textoDespuesDeCom(email) {
  const separador = email.lastIndexOf("@");
  if (separador < 0) return false;

  const dominio = email.slice(separador + 1);
  const dominioUnicode = domainToUnicode(dominio);
  return (
    /\.com[\s\S]/i.test(dominio) ||
    /\.com[\s\S]/i.test(dominioUnicode)
  );
}

function hoyISO() {
  const d = new Date();
  const mes = String(d.getMonth() + 1).padStart(2, "0");
  const dia = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${mes}-${dia}`;
}

function fechaValida(texto) {
  if (!FECHA_REGEX.test(texto)) return false;
  const [y, m, d] = texto.split("-").map(Number);
  const fecha = new Date(y, m - 1, d);
  return (
    fecha.getFullYear() === y &&
    fecha.getMonth() === m - 1 &&
    fecha.getDate() === d
  );
}

/**
 * Valida el cuerpo de una reserva.
 * Devuelve { errores: {campo: mensaje}, datos: {...limpios} }
 */
function validarReserva(body) {
  const errores = {};
  const b = body && typeof body === "object" ? body : {};

  const texto = (v) => (typeof v === "string" ? v.trim() : "");

  const nombre = texto(b.nombre);
  const email = typeof b.email === "string" ? b.email.toLowerCase() : "";
  const clase = texto(b.clase);
  const categoria = texto(b.categoria);
  const fecha = texto(b.fecha);
  const horario = texto(b.horario);
  const hora = texto(b.hora);
  const descripcion = texto(b.descripcion);

  if (!nombre) errores.nombre = "El nombre es obligatorio.";
  else if (nombre.length < 3)
    errores.nombre = "El nombre debe tener al menos 3 caracteres.";
  else if (nombre.length > 80)
    errores.nombre = "El nombre no puede superar 80 caracteres.";

  if (!email) errores.email = "El email es obligatorio.";
  else if (textoDespuesDeCom(email))
    errores.email =
      "Corrige el correo: no agregues letras ni otros caracteres después de .com.";
  else if (!EMAIL_REGEX.test(email) || /[\r\n]/.test(email))
    errores.email = "Ingresa un correo electrónico válido.";

  if (!clase) errores.clase = "Debe elegir una clase.";
  else if (!CLASES.includes(clase)) errores.clase = "La clase no es válida.";

  if (!categoria) errores.categoria = "Debe elegir una categoría.";
  else if (!CATEGORIAS.includes(categoria))
    errores.categoria = "La categoría no es válida.";

  if (!horario) errores.horario = "Debe elegir un horario.";
  else if (!Object.hasOwn(HORAS_POR_FRANJA, horario))
    errores.horario = "El horario seleccionado no es válido.";

  if (!hora) errores.hora = "Debe elegir la hora de la clase.";
  else if (!HORAS_POR_FRANJA[horario]?.includes(hora))
    errores.hora = "La hora no corresponde al horario seleccionado.";

  if (!fecha) errores.fecha = "La fecha es obligatoria.";
  else if (!fechaValida(fecha))
    errores.fecha = "La fecha no es válida (use AAAA-MM-DD).";
  else if (fecha < hoyISO())
    errores.fecha = "La fecha no puede estar en el pasado.";

  if (!descripcion) errores.descripcion = "La descripción es obligatoria.";
  else if (descripcion.length < 5)
    errores.descripcion = "La descripción debe tener al menos 5 caracteres.";
  else if (descripcion.length > 300)
    errores.descripcion = "La descripción no puede superar 300 caracteres.";

  return {
    errores,
    datos: { nombre, email, clase, categoria, fecha, horario, hora, descripcion },
  };
}

module.exports = { validarReserva, CATEGORIAS, CLASES };
