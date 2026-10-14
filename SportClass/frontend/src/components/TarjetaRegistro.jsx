import { CalendarDays, Clock } from "lucide-react";
import { Link } from "react-router-dom";

function formatearFecha(iso) {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("es-EC", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default function TarjetaRegistro({ registro, alEliminar, eliminando }) {
  return (
    <article className="tarjeta">
      <header className="tarjeta-cabecera">
        <h3>{registro.clase}</h3>
        <span className="etiqueta">{registro.categoria}</span>
      </header>
      <p className="tarjeta-fecha">
        <CalendarDays aria-hidden="true" size={17} />
        {formatearFecha(registro.fecha)}
      </p>
      <p className="tarjeta-fecha tarjeta-horario">
        <Clock aria-hidden="true" size={17} />
        {registro.horario && registro.hora
          ? `${registro.horario} · ${registro.hora}`
          : "Horario y hora no registrados"}
      </p>
      <p className="tarjeta-participante">
        <strong>{registro.nombre}</strong>
        <br />
        <span className="tenue">{registro.email}</span>
      </p>
      <p className="tarjeta-descripcion">{registro.descripcion}</p>
      <div className="acciones-reserva">
        <Link
          to={`/registro/${encodeURIComponent(registro.id)}`}
          className="boton boton-editar"
        >
          Editar
        </Link>
        <button
          className="boton boton-peligro"
          type="button"
          onClick={() => alEliminar(registro)}
          disabled={eliminando}
        >
          {eliminando ? "Eliminando…" : "Borrar"}
        </button>
      </div>
    </article>
  );
}
