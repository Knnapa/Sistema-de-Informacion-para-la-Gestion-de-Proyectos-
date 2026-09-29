import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// allowedRoles vacio = solo exige estar autenticado, sin importar el rol.
export default function ProtectedRoute({ children, allowedRoles = [] }) {
  const { usuario } = useAuth();

  if (!usuario) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(usuario.rol)) {
    return <p>No tienes permisos para ver esta seccion.</p>;
  }

  return children;
}
