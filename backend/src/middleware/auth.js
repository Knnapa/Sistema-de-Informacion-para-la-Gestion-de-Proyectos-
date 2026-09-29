// Verifica el JWT enviado en el header Authorization: Bearer <token>
// y adjunta el usuario autenticado a req.user (RF-03: controlar el acceso segun rol).
const { verificarToken } = require('../utils/jwt');

function requireAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const [tipo, token] = header.split(' ');

  if (tipo !== 'Bearer' || !token) {
    return res.status(401).json({ error: 'No autenticado. Falta el token.' });
  }

  try {
    const payload = verificarToken(token);
    req.user = payload; // { id, rol, nombre }
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Token invalido o expirado.' });
  }
}

module.exports = requireAuth;
