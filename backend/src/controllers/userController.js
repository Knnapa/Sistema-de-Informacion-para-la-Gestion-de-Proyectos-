const bcrypt = require('bcryptjs');
const { User, ActionLog } = require('../models');

function registrarAccion(req, accion, detalle) {
  // No bloquea la respuesta si el log falla; solo lo registra en consola.
  ActionLog.create({ usuario_id: req.user.id, accion, detalle }).catch((err) =>
    console.error('No se pudo registrar el log de accion:', err.message)
  );
}

// GET /api/usuarios  (solo Administrador)
async function listar(req, res) {
  const usuarios = await User.findAll({
    attributes: ['id', 'nombre', 'correo', 'rol', 'activo', 'createdAt'],
    order: [['createdAt', 'DESC']],
  });
  res.json(usuarios);
}

// POST /api/usuarios  (solo Administrador) - RF-01, RF-02
async function crear(req, res) {
  const { nombre, correo, password, rol } = req.body;

  if (!nombre || !correo || !password || !rol) {
    return res.status(400).json({ error: 'nombre, correo, password y rol son obligatorios.' });
  }
  if (!User.ROLES.includes(rol)) {
    return res.status(400).json({ error: `Rol invalido. Usa uno de: ${User.ROLES.join(', ')}` });
  }

  const existente = await User.findOne({ where: { correo } });
  if (existente) {
    return res.status(409).json({ error: 'Ya existe un usuario con ese correo.' });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const usuario = await User.create({ nombre, correo, passwordHash, rol });

  registrarAccion(req, 'crear_usuario', `Creo el usuario ${correo} con rol ${rol}`);

  res.status(201).json({
    id: usuario.id,
    nombre: usuario.nombre,
    correo: usuario.correo,
    rol: usuario.rol,
    activo: usuario.activo,
  });
}

// PUT /api/usuarios/:id  (solo Administrador) - RF-01, RF-02
async function actualizar(req, res) {
  const { id } = req.params;
  const { nombre, rol, activo } = req.body;

  const usuario = await User.findByPk(id);
  if (!usuario) return res.status(404).json({ error: 'Usuario no encontrado.' });

  if (rol && !User.ROLES.includes(rol)) {
    return res.status(400).json({ error: `Rol invalido. Usa uno de: ${User.ROLES.join(', ')}` });
  }

  if (nombre !== undefined) usuario.nombre = nombre;
  if (rol !== undefined) usuario.rol = rol;
  if (activo !== undefined) usuario.activo = activo;
  await usuario.save();

  registrarAccion(req, 'editar_usuario', `Edito el usuario ${usuario.correo}`);

  res.json({
    id: usuario.id,
    nombre: usuario.nombre,
    correo: usuario.correo,
    rol: usuario.rol,
    activo: usuario.activo,
  });
}

// PUT /api/usuarios/:id/desactivar  (solo Administrador) - RF-01
async function desactivar(req, res) {
  const { id } = req.params;
  const usuario = await User.findByPk(id);
  if (!usuario) return res.status(404).json({ error: 'Usuario no encontrado.' });

  usuario.activo = false;
  await usuario.save();

  registrarAccion(req, 'desactivar_usuario', `Desactivo el usuario ${usuario.correo}`);

  res.json({ mensaje: 'Usuario desactivado.' });
}

// PUT /api/usuarios/:id/reset-password  (solo Administrador) - RF-04
async function resetPassword(req, res) {
  const { id } = req.params;
  const { nuevaPassword } = req.body;

  if (!nuevaPassword || nuevaPassword.length < 8) {
    return res.status(400).json({ error: 'La nueva contrasena debe tener al menos 8 caracteres.' });
  }

  const usuario = await User.findByPk(id);
  if (!usuario) return res.status(404).json({ error: 'Usuario no encontrado.' });

  usuario.passwordHash = await bcrypt.hash(nuevaPassword, 10);
  await usuario.save();

  registrarAccion(req, 'reset_password', `Restablecio la contrasena de ${usuario.correo}`);

  res.json({ mensaje: 'Contrasena restablecida.' });
}

module.exports = { listar, crear, actualizar, desactivar, resetPassword };
