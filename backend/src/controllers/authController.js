const bcrypt = require('bcryptjs');
const { User } = require('../models');
const { firmarToken } = require('../utils/jwt');

// POST /api/auth/login
async function login(req, res) {
  const { correo, password } = req.body;

  if (!correo || !password) {
    return res.status(400).json({ error: 'Correo y contrasena son obligatorios.' });
  }

  const usuario = await User.findOne({ where: { correo } });

  if (!usuario || !usuario.activo) {
    return res.status(401).json({ error: 'Credenciales invalidas o usuario inactivo.' });
  }

  const coincide = await bcrypt.compare(password, usuario.passwordHash);
  if (!coincide) {
    return res.status(401).json({ error: 'Credenciales invalidas.' });
  }

  const token = firmarToken(usuario);

  return res.json({
    token,
    usuario: {
      id: usuario.id,
      nombre: usuario.nombre,
      correo: usuario.correo,
      rol: usuario.rol,
    },
  });
}

module.exports = { login };
