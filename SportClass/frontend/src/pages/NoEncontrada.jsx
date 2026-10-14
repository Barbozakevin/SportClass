import { Link } from "react-router-dom";

export default function NoEncontrada() {
  return (
    <section className="hero">
      <h1>Página no encontrada</h1>
      <p>La dirección que buscas no existe.</p>
      <Link to="/" className="boton">
        Volver al inicio
      </Link>
    </section>
  );
}
