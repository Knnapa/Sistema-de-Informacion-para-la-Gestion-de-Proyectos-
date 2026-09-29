import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Dashboard() {
  const { usuario, logout } = useAuth();

  return (
    <div style={{ maxWidth: 800, margin: '40px auto', fontFamily: 'sans-serif' }}>
      <h1>MIUDES</h1>
      <p>
        Sesion iniciada como <strong>{usuario.nombre}</strong> ({usuario.rol})
      </p>

      <ul>
        {usuario.rol === 'administrador' && (
          <li>
            <Link to="/usuarios">Administracion de usuarios</Link>
          </li>
        )}
        <li>Proyectos (siguiente modulo a construir)</li>
        <li>Participantes (siguiente modulo a construir)</li>
        <li>Reportes (siguiente modulo a construir)</li>
        <li>Indicadores (siguiente modulo a construir)</li>
        <li>Induccion (siguiente modulo a construir)</li>
      </ul>

      <button onClick={logout}>Cerrar sesion</button>
    </div>
  );
}
