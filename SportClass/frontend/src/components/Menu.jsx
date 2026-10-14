import { NavLink } from "react-router-dom";

export default function Menu() {
  const clase = ({ isActive }) => (isActive ? "enlace activo" : "enlace");

  return (
    <header className="cabecera">
      <nav className="menu" aria-label="Navegación principal">
        <NavLink to="/" className="marca" aria-label="SportClass - Inicio">
          <img
            src="/images/sportclass-logo.png"
            alt="SportClass"
            className="logo"
          />
        </NavLink>
        <div className="enlaces">
          <NavLink to="/" end className={clase}>
            Inicio
          </NavLink>
          <NavLink to="/registro" className={clase}>
            Reservar
          </NavLink>
          <NavLink to="/lista" className={clase}>
            Reservas
          </NavLink>
        </div>
      </nav>
    </header>
  );
}
