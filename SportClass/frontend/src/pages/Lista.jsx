import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Mensaje from "../components/Mensaje.jsx";
import TarjetaRegistro from "../components/TarjetaRegistro.jsx";
import { eliminarRegistro, obtenerRegistros } from "../services/api.js";

export default function Lista() {
  const [registros, setRegistros] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [errorAccion, setErrorAccion] = useState("");
  const [eliminandoId, setEliminandoId] = useState(null);

  function cargar() {
    setCargando(true);
    setError("");
    obtenerRegistros()
      .then(setRegistros)
      .catch((e) => setError(e.message))
      .finally(() => setCargando(false));
  }

  // Cada vez que se abre /lista se vuelve a consultar la API (vista siempre actualizada).
  useEffect(cargar, []);

  async function borrar(registro) {
    const confirmado = window.confirm(
      `¿Seguro que quieres borrar la reserva de ${registro.nombre} para ${registro.clase}?`
    );
    if (!confirmado) return;

    setErrorAccion("");
    setEliminandoId(registro.id);
    try {
      await eliminarRegistro(registro.id);
      setRegistros((anteriores) =>
        anteriores.filter((reserva) => reserva.id !== registro.id)
      );
    } catch (e) {
      setErrorAccion(e.message);
    } finally {
      setEliminandoId(null);
    }
  }

  return (
    <section>
      <div className="encabezado-lista">
        <h1>Reservas registradas</h1>
        <Link to="/registro" className="boton">
          + Nueva reserva
        </Link>
      </div>

      {cargando && <Mensaje tipo="info">Cargando reservas…</Mensaje>}

      {error && (
        <Mensaje tipo="error">
          {error}{" "}
          <button className="enlace-boton" onClick={cargar}>
            Reintentar
          </button>
        </Mensaje>
      )}

      {errorAccion && <Mensaje tipo="error">{errorAccion}</Mensaje>}

      {!cargando && !error && registros.length === 0 && (
        <Mensaje tipo="info">
          Todavía no hay reservas. <Link to="/registro">Registre la primera</Link>.
        </Mensaje>
      )}

      {!cargando && !error && registros.length > 0 && (
        <>
          <p className="tenue">Total: {registros.length}</p>
          <div className="rejilla">
            {[...registros].reverse().map((r) => (
              <TarjetaRegistro
                key={r.id}
                registro={r}
                alEliminar={borrar}
                eliminando={eliminandoId === r.id}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
}
