import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { APP_NAME, APP_SUBTITLE } from '../../config/branding';
import { modulosVisiblesPara } from '../../config/modules';
import { rolLabel } from '../../config/roles';
import { IconGestionProyectos, IconLogOut } from '../icons/Icons';
import './Sidebar.css';

export default function Sidebar({ collapsed }) {
  const { usuario, logout } = useAuth();
  const modulos = modulosVisiblesPara(usuario.rol);

  return (
    <aside className={`sidebar${collapsed ? ' sidebar--collapsed' : ''}`}>
      <div className="sidebar-brand">
        <div className="sidebar-logo">
          <IconGestionProyectos size={20} />
        </div>
        {!collapsed && (
          <div className="sidebar-brand-text">
            <span className="sidebar-brand-name">{APP_NAME}</span>
            <span className="sidebar-brand-subtitle">{APP_SUBTITLE}</span>
          </div>
        )}
      </div>

      <nav className="sidebar-nav">
        {modulos.map((m) => {
          const Icon = m.icon;

          if (m.disponible === false) {
            return (
              <div key={m.id} className="sidebar-link sidebar-link--disabled" title="Modulo en construccion">
                <Icon />
                {!collapsed && (
                  <>
                    <span className="sidebar-link-label">{m.label}</span>
                    <span className="sidebar-soon">pronto</span>
                  </>
                )}
              </div>
            );
          }

          return (
            <NavLink
              key={m.id}
              to={m.path}
              end={m.path === '/'}
              className={({ isActive }) => `sidebar-link${isActive ? ' sidebar-link--active' : ''}`}
            >
              <Icon />
              {!collapsed && <span className="sidebar-link-label">{m.label}</span>}
            </NavLink>
          );
        })}
      </nav>

      <div className="sidebar-user">
        {!collapsed && (
          <div className="sidebar-user-info">
            <span className="sidebar-user-name">{usuario.nombre}</span>
            <span className="sidebar-user-role">{rolLabel(usuario.rol)}</span>
          </div>
        )}
        <button type="button" className="sidebar-logout" onClick={logout} title="Cerrar sesión">
          <IconLogOut />
          {!collapsed && <span>Cerrar sesión</span>}
        </button>
      </div>
    </aside>
  );
}
