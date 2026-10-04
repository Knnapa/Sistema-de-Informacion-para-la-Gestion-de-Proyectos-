import { useAuth } from '../../context/AuthContext';
import { rolLabel } from '../../config/roles';
import { IconPanelLeft } from '../icons/Icons';
import './Topbar.css';

export default function Topbar({ onToggleSidebar }) {
  const { usuario } = useAuth();

  return (
    <header className="topbar">
      <button type="button" className="topbar-toggle" onClick={onToggleSidebar} title="Mostrar/ocultar menú">
        <IconPanelLeft size={18} />
      </button>
      <div className="topbar-spacer" />
      <span className="topbar-role-badge">{rolLabel(usuario.rol)}</span>
    </header>
  );
}
