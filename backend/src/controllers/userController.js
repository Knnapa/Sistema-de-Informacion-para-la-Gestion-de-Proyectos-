const bcrypt = require('bcryptjs');
const { User, ActionLog, Proyecto, ProyectoEquipo } = require('../models');

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

// GET /api/usuarios/logs  (solo Administrador) - RF-06
async function listarLogs(req, res) {
  const logs = await ActionLog.findAll({
    include: [{ model: User, as: 'usuario', attributes: ['id', 'nombre', 'correo'] }],
    order: [['createdAt', 'DESC']],
    limit: 100,
  });
  res.json(logs);
}

// GET /api/usuarios/:id/permisos  (solo Administrador)
// Para que no tenga el rol global de Administrador/Lider (que ya puede
// editar todo) ni Administrador quiera revisar/editar que permisos
// puntuales por proyecto tiene asignados este usuario. Devuelve SOLO sus
// asignaciones (ver/editar) -- el listado completo de proyectos ya lo trae
// el frontend aparte con GET /api/proyectos (ver Proyectos.jsx).
async function listarPermisos(req, res) {
  const { id } = req.params;
  const usuario = await User.findByPk(id);
  if (!usuario) return res.status(404).json({ error: 'Usuario no encontrado.' });

  const vinculos = await ProyectoEquipo.findAll({
    where: { usuario_id: id },
    include: [{ model: Proyecto, as: 'proyecto', attributes: ['id', 'nombre'] }],
  });
  res.json(
    vinculos.map((v) => ({
      proyectoId: v.proyecto_id,
      proyectoNombre: v.proyecto?.nombre || null,
      nivel: v.nivel,
    }))
  );
}

// PUT /api/usuarios/:id/permisos  (solo Administrador)
// Reemplaza TODAS las asignaciones de proyecto de este usuario por la
// lista enviada (igual que "equipoIds" en proyectoController.actualizar,
// pero visto desde el usuario en vez de desde el proyecto). Un proyecto que
// no venga en la lista queda sin acceso puntual para este usuario -- su rol
// global (si es Administrador/Lider) sigue aplicando igual.
async function actualizarPermisos(req, res) {
  const { id } = req.params;
  const { permisos } = req.body;

  const usuario = await User.findByPk(id);
  if (!usuario) return res.status(404).json({ error: 'Usuario no encontrado.' });

  if (!Array.isArray(permisos)) {
    return res.status(400).json({ error: 'permisos debe ser una lista.' });
  }
  for (const p of permisos) {
    if (!p || !p.proyectoId || !['ver', 'editar'].includes(p.nivel)) {
      return res.status(400).json({ error: 'Cada permiso necesita proyectoId y nivel ("ver" o "editar").' });
    }
  }

  await ProyectoEquipo.destroy({ where: { usuario_id: id } });
  if (permisos.length > 0) {
    await ProyectoEquipo.bulkCreate(
      permisos.map((p) => ({ proyecto_id: p.proyectoId, usuario_id: id, nivel: p.nivel }))
    );
  }

  registrarAccion(req, 'editar_permisos_proyectos', `Edito los permisos de proyectos de ${usuario.correo}`);

  res.json({ mensaje: 'Permisos actualizados.' });
}

module.exports = {
  listar,
  crear,
  actualizar,
  desactivar,
  resetPassword,
  listarLogs,
  listarPermisos,
  actualizarPermisos,
};
