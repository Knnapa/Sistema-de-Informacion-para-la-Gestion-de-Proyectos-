const jwt = require('jsonwebtoken');

function firmarToken(usuario) {
  return jwt.sign(
    { id: usuario.id, rol: usuario.rol, nombre: usuario.nombre },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '8h' }
  );
}

function verificarToken(token) {
  return jwt.verify(token, process.env.JWT_SECRET);
}

module.exports = { firmarToken, verificarToken };
