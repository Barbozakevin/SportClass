import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { CalendarDays, CircleCheck } from "lucide-react";
import Mensaje from "./Mensaje.jsx";
import {
  actualizarRegistro,
  crearRegistro,
  obtenerOpciones,
} from "../services/api.js";
import {
  fechaAISO,
  hoyISO,
  validarEmail,
  validarFormulario,
} from "../validaciones.js";

const VACIO = {
  nombre: "",
  email: "",
  clase: "",
  categoria: "",
  fecha: "",
  horario: "",
  hora: "",
  descripcion: "",
};

const HORARIOS = {
  Mañana: {
    rango: "06:00 a 11:00",
    horas: ["06:00", "07:00", "08:00", "09:00", "10:00", "11:00"],
  },
  Tarde: {
    rango: "12:00 a 17:00",
    horas: ["12:00", "13:00", "14:00", "15:00", "16:00", "17:00"],
  },
  Noche: {
    rango: "18:00 a 21:00",
    horas: ["18:00", "19:00", "20:00", "21:00"],
  },
};

// Campo reutilizable (definido fuera del formulario para no perder el foco al escribir).
function Campo({ nombre, etiqueta, error, children }) {
  return (
    <div className={`campo ${error ? "campo-error" : ""}`}>
      <label htmlFor={nombre}>{etiqueta}</label>
      {children}
      {error && (
        <small id={`${nombre}-error`} className="texto-error">
          {error}
        </small>
      )}
    </div>
  );
}

export default function FormularioReserva({ registro }) {
  const selectorFechaRef = useRef(null);
  // Estado del formulario
  const [valores, setValores] = useState(() =>
    registro
      ? {
          nombre: registro.nombre,
          email: registro.email,
          clase: registro.clase,
          categoria: registro.categoria,
          fecha: registro.fecha.split("-").reverse().join("/"),
          horario: registro.horario || "",
          hora: registro.hora || "",
          descripcion: registro.descripcion,
        }
      : VACIO
  );
  const [errores, setErrores] = useState(() =>
    registro ? { email: validarEmail(registro.email) || undefined } : {}
  );
  const [opciones, setOpciones] = useState({ clases: [], categorias: [] });

  // Estado de la petición
  const [enviando, setEnviando] = useState(false);
  const [exito, setExito] = useState(null); // registro creado
  const [errorGeneral, setErrorGeneral] = useState("");

  // Carga las clases y categorías desde la API al abrir el formulario.
  useEffect(() => {
    obtenerOpciones()
      .then(setOpciones)
      .catch((error) => setErrorGeneral(error.message));
  }, []);

  function manejarCambio(evento) {
    const { name, value } = evento.target;
    setValores((anteriores) => ({ ...anteriores, [name]: value }));
    if (name === "email") {
      setErrores((anteriores) => ({
        ...anteriores,
        email: value ? validarEmail(value) || undefined : undefined,
      }));
    } else if (errores[name]) {
      // Al corregir un campo se quita su error.
      setErrores((anteriores) => ({ ...anteriores, [name]: undefined }));
    }
    setExito(null);
  }

  function manejarSeleccionFecha(evento) {
    const [anio, mes, dia] = evento.target.value.split("-");
    setValores((anteriores) => ({
      ...anteriores,
      fecha: `${dia}/${mes}/${anio}`,
    }));
    if (errores.fecha) {
      setErrores((anteriores) => ({ ...anteriores, fecha: undefined }));
    }
    setExito(null);
  }

  function manejarSeleccionHorario(horario) {
    setValores((anteriores) => ({ ...anteriores, horario, hora: "" }));
    setErrores((anteriores) => ({
      ...anteriores,
      horario: undefined,
      hora: undefined,
    }));
    setExito(null);
  }

  function abrirSelectorFecha() {
    const selector = selectorFechaRef.current;
    if (!selector) return;

    if (typeof selector.showPicker === "function") {
      selector.showPicker();
    } else {
      selector.click();
    }
  }

  async function manejarEnvio(evento) {
    evento.preventDefault();
    setErrorGeneral("");
    setExito(null);

    // 1. Validación en el cliente: no se envían datos inválidos.
    const erroresCliente = validarFormulario(valores);
    if (Object.keys(erroresCliente).length > 0) {
      setErrores(erroresCliente);
      return;
    }

    // 2. POST a la API
    setEnviando(true);
    try {
      const datos = {
        ...valores,
        fecha: fechaAISO(valores.fecha),
      };
      const creado = registro
        ? await actualizarRegistro(registro.id, datos)
        : await crearRegistro(datos);
      setExito(creado);
      if (!registro) setValores(VACIO);
      setErrores({});
    } catch (error) {
      // Si el servidor rechazó campos concretos, se muestran junto al campo.
      if (error.errores && Object.keys(error.errores).length > 0) {
        setErrores(error.errores);
      }
      setErrorGeneral(error.message);
    } finally {
      setEnviando(false);
    }
  }

  return (
    <form className="formulario" onSubmit={manejarEnvio} noValidate>
      {exito && (
        <Mensaje tipo="exito">
          <CircleCheck aria-hidden="true" size={18} /> Reserva{" "}
          {registro ? "actualizada" : "registrada"} para{" "}
          <strong>{exito.nombre}</strong> en{" "}
          <strong>{exito.clase}</strong>.{" "}
          <Link to="/lista">Ver todas las reservas</Link>
        </Mensaje>
      )}
      {errorGeneral && <Mensaje tipo="error">{errorGeneral}</Mensaje>}

      <Campo nombre="nombre" error={errores.nombre} etiqueta="Nombre del participante">
        <input
          id="nombre"
          name="nombre"
          type="text"
          value={valores.nombre}
          onChange={manejarCambio}
          placeholder="Ej: Ana Pérez"
          autoComplete="name"
        />
      </Campo>

      <Campo nombre="email" error={errores.email} etiqueta="Email">
        <input
          id="email"
          name="email"
          type="text"
          inputMode="email"
          value={valores.email}
          onChange={manejarCambio}
          placeholder="ana@correo.com"
          autoComplete="email"
          aria-invalid={Boolean(errores.email)}
          aria-describedby={errores.email ? "email-error" : undefined}
        />
      </Campo>

      <div className="fila">
        <Campo nombre="clase" error={errores.clase} etiqueta="Clase">
          <select id="clase" name="clase" value={valores.clase} onChange={manejarCambio}>
            <option value="">Seleccione…</option>
            {opciones.clases.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </Campo>

        <Campo nombre="categoria" error={errores.categoria} etiqueta="Categoría">
          <select
            id="categoria"
            name="categoria"
            value={valores.categoria}
            onChange={manejarCambio}
          >
            <option value="">Seleccione…</option>
            {opciones.categorias.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </Campo>
      </div>

      <Campo nombre="fecha" error={errores.fecha} etiqueta="Fecha de la clase">
        <div className="fecha-control">
          <input
            id="fecha"
            name="fecha"
            type="text"
            inputMode="numeric"
            autoComplete="off"
            maxLength={10}
            value={valores.fecha}
            onChange={manejarCambio}
            placeholder="dd/mm/aaaa"
            aria-describedby="fecha-ayuda"
          />
          <button
            className="selector-fecha"
            type="button"
            onClick={abrirSelectorFecha}
          >
            <CalendarDays aria-hidden="true" size={18} /> Elegir fecha
          </button>
          <input
            ref={selectorFechaRef}
            className="date-picker-input"
            type="date"
            aria-label="Elegir fecha usando el calendario"
            min={hoyISO()}
            value={fechaAISO(valores.fecha) ?? ""}
            onChange={manejarSeleccionFecha}
            tabIndex={-1}
          />
        </div>
        <small id="fecha-ayuda" className="ayuda-campo">
          Escribe el día, el mes y el año; por ejemplo, 25/12/2026.
        </small>
      </Campo>

      <fieldset
        className={`campo campo-horario ${
          errores.horario || errores.hora ? "campo-error" : ""
        }`}
      >
        <legend>Horario</legend>
        <div className="opciones-horario" role="group" aria-label="Elige una franja horaria">
          {Object.entries(HORARIOS).map(([nombre, detalle]) => (
            <button
              key={nombre}
              className={`opcion-horario ${
                valores.horario === nombre ? "seleccionado" : ""
              }`}
              type="button"
              aria-pressed={valores.horario === nombre}
              onClick={() => manejarSeleccionHorario(nombre)}
            >
              <strong>{nombre}</strong>
              <span>{detalle.rango}</span>
            </button>
          ))}
        </div>
        {errores.horario && (
          <small id="horario-error" className="texto-error">
            {errores.horario}
          </small>
        )}
        <label htmlFor="hora">Hora de la clase</label>
        <select
          id="hora"
          name="hora"
          value={valores.hora}
          onChange={manejarCambio}
          disabled={!valores.horario}
          aria-invalid={Boolean(errores.hora)}
          aria-describedby={errores.hora ? "hora-error" : undefined}
        >
          <option value="">
            {valores.horario ? "Seleccione una hora" : "Elija primero un horario"}
          </option>
          {(HORARIOS[valores.horario]?.horas || []).map((hora) => (
            <option key={hora} value={hora}>
              {hora}
            </option>
          ))}
        </select>
        {errores.hora && (
          <small id="hora-error" className="texto-error">
            {errores.hora}
          </small>
        )}
      </fieldset>

      <Campo nombre="descripcion" error={errores.descripcion} etiqueta="Descripción / observaciones">
        <textarea
          id="descripcion"
          name="descripcion"
          rows="4"
          value={valores.descripcion}
          onChange={manejarCambio}
          placeholder="Ej: Prefiero horario de mañana"
        />
      </Campo>

      <button className="boton" type="submit" disabled={enviando}>
        {enviando
          ? registro
            ? "Guardando cambios…"
            : "Enviando…"
          : registro
            ? "Guardar cambios"
            : "Reservar clase"}
      </button>
    </form>
  );
}
