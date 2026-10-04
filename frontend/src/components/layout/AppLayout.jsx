import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import './AppLayout.css';

// Envuelve todas las pantallas autenticadas: barra lateral + barra superior
// fijas, el contenido de cada ruta se renderiza en <Outlet/>.
export default function AppLayout() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="app-shell">
      <Sidebar collapsed={collapsed} />
      <div className="app-shell-main">
        <Topbar onToggleSidebar={() => setCollapsed((c) => !c)} />
        <main className="app-shell-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
