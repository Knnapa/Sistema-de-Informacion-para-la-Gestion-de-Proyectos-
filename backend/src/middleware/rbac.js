// Middleware de control de acceso basado en roles (RBAC).
// Uso: requireRole('administrador') o requireRole('administrador', 'lider')
function requireRole(...rolesPermitidos) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'No autenticado.' });
    }
    if (!rolesPermitidos.includes(req.user.rol)) {
      return res.status(403).json({ error: 'No tienes permisos para esta accion.' });
    }
    next();
  };
}

module.exports = requireRole;
