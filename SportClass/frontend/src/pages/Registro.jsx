import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import FormularioReserva from "../components/FormularioReserva.jsx";
import Mensaje from "../components/Mensaje.jsx";
import { obtenerRegistros } from "../services/api.js";

export default function Registro() {
  const { id } = useParams();
  const [registro, setRegistro] = useState(null);
  const [cargando, setCargando] = useState(Boolean(id));
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) {
      setRegistro(null);
      setCargando(false);
      setError("");
      return;
    }

    let activo = true;
    setCargando(true);
    setError("");
    obtenerRegistros()
      .then((registros) => {
        if (!activo) return;
        const encontrado = registros.find((reserva) => reserva.id === id);
        if (encontrado) setRegistro(encontrado);
        else setError("No se encontró la reserva que quieres editar.");
      })
      .catch((e) => {
        if (activo) setError(e.message);
      })
      .finally(() => {
        if (activo) setCargando(false);
      });

    return () => {
      activo = false;
    };
  }, [id]);

  return (
    <section>
      <h1>{id ? "Editar reserva" : "Nueva reserva"}</h1>
      <p className="tenue">
        {id
          ? "Actualiza los datos de la reserva. Se validarán antes de guardarlos."
          : "Complete los datos para solicitar su lugar en la clase."}
      </p>
      {cargando && <Mensaje tipo="info">Cargando reserva…</Mensaje>}
      {error && (
        <Mensaje tipo="error">
          {error} <Link to="/lista">Volver a las reservas</Link>
        </Mensaje>
      )}
      {!cargando && !error && <FormularioReserva registro={registro} />}
    </section>
  );
}
