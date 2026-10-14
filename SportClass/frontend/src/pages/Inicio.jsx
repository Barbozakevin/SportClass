import { Link } from "react-router-dom";
import { Activity, ArrowRight, Check, Sparkles } from "lucide-react";

export default function Inicio() {
  return (
    <>
      <section className="hero">
        <div className="hero-contenido">
          <span className="hero-etiqueta">MUÉVETE A TU MANERA</span>
          <h1>Tu próxima clase deportiva empieza aquí</h1>
          <p>
            Encuentra tu espacio, elige una fecha y reserva tu lugar. En
            SportClass, organizarte para hacer lo que te gusta es más fácil.
          </p>
          <div className="acciones">
            <Link to="/registro" className="boton">
              Reservar una clase <ArrowRight aria-hidden="true" size={18} />
            </Link>
            <Link to="/lista" className="boton">
              Ver mis reservas <ArrowRight aria-hidden="true" size={18} />
            </Link>
          </div>
          <p className="hero-confianza">
            <Check aria-hidden="true" size={17} /> Fácil de reservar
            <Check aria-hidden="true" size={17} /> A tu ritmo
          </p>
        </div>
        <aside className="hero-tarjeta" aria-label="Tu actividad, tus objetivos">
          <div className="hero-icono" aria-hidden="true">
            <Activity size={34} strokeWidth={2.2} />
          </div>
          <span className="hero-tarjeta-etiqueta">HOY ES UN BUEN DÍA</span>
          <h2>Haz tiempo para ti</h2>
          <ul className="hero-pasos">
            <li><Check aria-hidden="true" size={16} /> Elige cuándo</li>
            <li><Check aria-hidden="true" size={16} /> Escoge tu clase</li>
            <li><Check aria-hidden="true" size={16} /> Disfruta el momento</li>
          </ul>
          <div className="hero-pildora">
            <Sparkles aria-hidden="true" size={15} /> Tu próxima aventura te espera
          </div>
        </aside>
      </section>
    </>
  );
}
