// Validaciones del formulario (cliente). El servidor vuelve a validar todo.
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const HORAS_POR_FRANJA = {
  Mañana: ["06:00", "07:00", "08:00", "09:00", "10:00", "11:00"],
  Tarde: ["12:00", "13:00", "14:00", "15:00", "16:00", "17:00"],
  Noche: ["18:00", "19:00", "20:00", "21:00"],
};

function textoDespuesDeCom(email) {
  const separador = email.lastIndexOf("@");
  if (separador < 0) return false;
  const dominio = email.slice(separador + 1);
  return /\.com[\s\S]/i.test(dominio);
}

export function validarEmail(email) {
  if (textoDespuesDeCom(email)) {
    return "Corrige el correo: no agregues letras ni otros caracteres después de .com.";
  }

  if (!EMAIL_REGEX.test(email) || /[\r\n]/.test(email)) {
    return "Ingresa un correo electrónico válido.";
  }

  return "";
}

export function hoyISO() {
  const d = new Date();
  const mes = String(d.getMonth() + 1).padStart(2, "0");
  const dia = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${mes}-${dia}`;
}

export function fechaAISO(fecha) {
  const coincidencia = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(fecha);
  if (!coincidencia) return null;

  const [, diaTexto, mesTexto, anioTexto] = coincidencia;
  const dia = Number(diaTexto);
  const mes = Number(mesTexto);
  const anio = Number(anioTexto);
  const fechaUTC = new Date(Date.UTC(anio, mes - 1, dia));

  if (
    fechaUTC.getUTCFullYear() !== anio ||
    fechaUTC.getUTCMonth() !== mes - 1 ||
    fechaUTC.getUTCDate() !== dia
  ) {
    return null;
  }

  return `${anioTexto}-${mesTexto}-${diaTexto}`;
}

export function validarFormulario(valores) {
  const errores = {};
  const nombre = valores.nombre.trim();
  const email = valores.email;
  const descripcion = valores.descripcion.trim();
  const fechaISO = fechaAISO(valores.fecha);

  if (!nombre) errores.nombre = "El nombre es obligatorio.";
  else if (nombre.length < 3)
    errores.nombre = "El nombre debe tener al menos 3 caracteres.";
  else if (nombre.length > 80)
    errores.nombre = "El nombre no puede superar 80 caracteres.";

  if (!email) errores.email = "El email es obligatorio.";
  else {
    const errorEmail = validarEmail(email);
    if (errorEmail) errores.email = errorEmail;
  }

  if (!valores.clase) errores.clase = "Debe elegir una clase.";
  if (!valores.categoria) errores.categoria = "Debe elegir una categoría.";
  if (!valores.horario) errores.horario = "Debe elegir un horario.";
  else if (!Object.hasOwn(HORAS_POR_FRANJA, valores.horario))
    errores.horario = "El horario seleccionado no es válido.";

  if (!valores.hora) errores.hora = "Debe elegir la hora de la clase.";
  else if (!HORAS_POR_FRANJA[valores.horario]?.includes(valores.hora))
    errores.hora = "La hora no corresponde al horario seleccionado.";

  if (!valores.fecha) errores.fecha = "La fecha es obligatoria.";
  else if (!fechaISO)
    errores.fecha = "Ingrese una fecha válida con formato día/mes/año.";
  else if (fechaISO < hoyISO())
    errores.fecha = "La fecha no puede estar en el pasado.";

  if (!descripcion) errores.descripcion = "La descripción es obligatoria.";
  else if (descripcion.length < 5)
    errores.descripcion = "La descripción debe tener al menos 5 caracteres.";
  else if (descripcion.length > 300)
    errores.descripcion = "La descripción no puede superar 300 caracteres.";

  return errores;
}
