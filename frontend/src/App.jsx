import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import AppLayout from './components/layout/AppLayout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Usuarios from './pages/Usuarios';
import Proyectos from './pages/Proyectos';
import ProyectoDetalle from './pages/ProyectoDetalle';
import Participantes from './pages/Participantes';
import Reportes from './pages/Reportes';
import Indicadores from './pages/Indicadores';
import Induccion from './pages/Induccion';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />

          {/* Todo lo autenticado comparte la barra lateral + barra superior
              de AppLayout; cada pantalla se renderiza dentro via <Outlet/>. */}
          <Route
            element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/" element={<Dashboard />} />
            <Route
              path="/usuarios"
              element={
                <ProtectedRoute allowedRoles={['administrador']}>
                  <Usuarios />
                </ProtectedRoute>
              }
            />
            {/* Proyectos es visible para los 4 roles (RF-07); crear/editar/
                eliminar se oculta en la UI y se bloquea en el backend segun
                el rol, no hace falta otro ProtectedRoute aqui. */}
            <Route path="/proyectos" element={<Proyectos />} />
            <Route path="/proyectos/:id" element={<ProyectoDetalle />} />
            <Route
              path="/participantes"
              element={
                <ProtectedRoute allowedRoles={['administrador', 'lider']}>
                  <Participantes />
                </ProtectedRoute>
              }
            />
            <Route
              path="/reportes"
              element={
                <ProtectedRoute allowedRoles={['administrador', 'lider']}>
                  <Reportes />
                </ProtectedRoute>
              }
            />
            <Route
              path="/indicadores"
              element={
                <ProtectedRoute allowedRoles={['administrador', 'lider']}>
                  <Indicadores />
                </ProtectedRoute>
              }
            />
            {/* Induccion es visible para los 4 roles, igual que Proyectos;
                subir/editar/eliminar se oculta en la UI y se bloquea en el
                backend segun el rol (solo Administrador). */}
            <Route path="/induccion" element={<Induccion />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
