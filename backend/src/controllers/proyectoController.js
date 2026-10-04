const { sequelize, Proyecto, User, ProyectoEquipo, Participante, ParticipanteProyecto } = require('../models');
const { validarCampos } = require('../utils/formulario');
const { validarCronograma, validarArchivosAdjuntos } = require('../utils/proyectoExtras');

const ATTR_USUARIO = ['id', 'nombre', 'correo', 'rol'];
const INCLUDE_COMPLETO = [
  { model: User, as: 'creador', attributes: ['id', 'nombre'] },
  // through: ['nivel'] para poder mostrar en el equipo si cada quien puede
  // "ver" o "editar" ese proyecto (ver serializar).
  { model: User, as: 'equipo', attributes: ATTR_USUARIO, through: { attributes: ['nivel'] } },
];
// Para el detalle de un proyecto puntual ademas se trae la lista real de
// participantes vinculados (en el listado general basta con el conteo, ver
// contarParticipantesPorProyecto, para no traer de mas en una lista larga).
const INCLUDE_DETALLE = [
  ...INCLUDE_COMPLETO,
  {
    model: Participante,
    as: 'participantes',
    attributes: ['id', 'nombre', 'identificacion'],
    through: { attributes: [] },
  },
];

function serializar(proyecto, totalParticipantes = 0) {
  const equipo = proyecto.equipo || [];
  const participantes = proyecto.participantes || [];
  return {
    id: proyecto.id,
    nombre: proyecto.nombre,
    categoria: proyecto.categoria,
    descripcion: proyecto.descripcion,
    fechaInicio: proyecto.fechaInicio,
    fechaFin: proyecto.fechaFin,
    estado: proyecto.estado,
    estadoManual: proyecto.estadoManual,
    formulario: proyecto.formulario || [],
    cronograma: proyecto.cronograma || [],
    archivosAdjuntos: proyecto.archivosAdjuntos || [],
    creador: proyecto.creador ? { id: proyecto.creador.id, nombre: proyecto.creador.nombre } : null,
    equipo: equipo.map((u) => ({
      id: u.id,
      nombre: u.nombre,
      correo: u.correo,
      rol: u.rol,
      nivel: u.ProyectoEquipo?.nivel || null,
    })),
    participantes: participantes.map((p) => ({ id: p.id, nombre: p.nombre, identificacion: p.identificacion })),
    totalParticipantes,
    createdAt: proyecto.createdAt,
    updatedAt: proyecto.updatedAt,
  };
}

// Cuenta participantes vinculados por proyecto en una sola consulta
// (evita N+1 al listar varios proyectos a la vez).
async function contarParticipantesPorProyecto(proyectoIds) {
  if (proyectoIds.length === 0) return {};
  const filas = await ParticipanteProyecto.findAll({
    attributes: ['proyecto_id', [sequelize.fn('COUNT', sequelize.col('id')), 'total']],
    where: { proyecto_id: proyectoIds },
    group: ['proyecto_id'],
    raw: true,
  });
  const mapa = {};
  filas.forEach((f) => {
    mapa[f.proyecto_id] = Number(f.total);
  });
  return mapa;
}

// Estado automatico de un proyecto segun su fecha de fin: si ya paso,
// "finalizado"; si no tiene fecha de fin o todavia no llega, "activo".
function calcularEstadoAutomatico(fechaFin) {
  if (!fechaFin) return 'activo';
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  const fin = new Date(`${fechaFin}T00:00:00`);
  return fin < hoy ? 'finalizado' : 'activo';
}

// Si el proyecto esta en modo automatico (estadoManual=false, el valor por
// defecto), recalcula su estado a partir de fechaFin y lo guarda si cambio.
// Si alguien lo forzo manualmente (estadoManual=true), no se toca aqui.
async function sincronizarEstado(proyecto) {
  if (proyecto.estadoManual) return proyecto;
  const nuevo = calcularEstadoAutomatico(proyecto.fechaFin);
  if (proyecto.estado !== nuevo) {
    proyecto.estado = nuevo;
    await proyecto.save();
  }
  return proyecto;
}

// Administrador y Lider pueden editar cualquier proyecto, igual que hoy.
// Ademas, un usuario que haya sido asignado a ESE proyecto en particular
// con nivel 'editar' desde Administracion (ver userController.
// actualizarPermisos) tambien puede editarlo, sin que eso le de permisos
// sobre los demas proyectos ni cambie su rol global.
async function puedeEditarProyecto(user, proyectoId) {
  if (['administrador', 'lider'].includes(user.rol)) return true;
  const vinculo = await ProyectoEquipo.findOne({
    where: { proyecto_id: proyectoId, usuario_id: user.id, nivel: 'editar' },
  });
  return Boolean(vinculo);
}

// GET /api/proyectos  (cualquier usuario autenticado) - RF-07
async function listar(req, res) {
  const proyectos = await Proyecto.findAll({
    include: INCLUDE_COMPLETO,
    order: [['createdAt', 'DESC']],
  });
  // Mantiene "estado" al dia (ver sincronizarEstado) antes de mostrar la lista.
  await Promise.all(proyectos.map((p) => sincronizarEstado(p)));
  const conteos = await contarParticipantesPorProyecto(proyectos.map((p) => p.id));
  res.json(proyectos.map((p) => serializar(p, conteos[p.id] || 0)));
}

// GET /api/proyectos/:id  (cualquier usuario autenticado)
async function obtener(req, res) {
  const proyecto = await Proyecto.findByPk(req.params.id, { include: INCLUDE_DETALLE });
  if (!proyecto) return res.status(404).json({ error: 'Proyecto no encontrado.' });
  await sincronizarEstado(proyecto);
  const total = await ParticipanteProyecto.count({ where: { proyecto_id: proyecto.id } });
  res.json(serializar(proyecto, total));
}

// POST /api/proyectos  (Administrador y Lider) - RF-07, RF-08
async function crear(req, res) {
  const { nombre, categoria, descripcion, fechaInicio, fechaFin, formulario, cronograma, archivosAdjuntos } =
    req.body;

  if (!nombre || !categoria || !fechaInicio) {
    return res.status(400).json({ error: 'nombre, categoria y fechaInicio son obligatorios.' });
  }
  if (!Proyecto.CATEGORIAS.includes(categoria)) {
    return res.status(400).json({ error: `Categoria invalida. Usa una de: ${Proyecto.CATEGORIAS.join(', ')}` });
  }
  const formularioValidado = validarCampos(formulario);
  if (formularioValidado === null) {
    return res.status(400).json({ error: 'El formulario de recoleccion tiene un formato invalido.' });
  }
  const cronogramaValidado = validarCronograma(cronograma);
  if (cronogramaValidado === null) {
    return res.status(400).json({ error: 'El cronograma tiene un formato invalido.' });
  }
  const archivosValidados = validarArchivosAdjuntos(archivosAdjuntos);
  if (archivosValidados === null) {
    return res.status(400).json({ error: 'Los archivos adjuntos tienen un formato invalido.' });
  }

  const proyecto = await Proyecto.create({
    nombre,
    categoria,
    descripcion: descripcion || null,
    fechaInicio,
    fechaFin: fechaFin || null,
    formulario: formularioValidado,
    cronograma: cronogramaValidado,
    archivosAdjuntos: archivosValidados,
    creadoPor: req.user.id,
  });

  // Quien crea el proyecto queda automaticamente en su equipo.
  await ProyectoEquipo.create({ proyecto_id: proyecto.id, usuario_id: req.user.id });

  const completo = await Proyecto.findByPk(proyecto.id, { include: INCLUDE_DETALLE });
  res.status(201).json(serializar(completo));
}

// PUT /api/proyectos/:id  (Administrador, Lider, o quien tenga nivel
// 'editar' asignado en este proyecto puntual -- ver puedeEditarProyecto)
async function actualizar(req, res) {
  const proyecto = await Proyecto.findByPk(req.params.id);
  if (!proyecto) return res.status(404).json({ error: 'Proyecto no encontrado.' });

  if (!(await puedeEditarProyecto(req.user, proyecto.id))) {
    return res.status(403).json({ error: 'No tienes permisos para editar este proyecto.' });
  }

  const {
    nombre,
    categoria,
    descripcion,
    fechaInicio,
    fechaFin,
    estado,
    estadoManual,
    formulario,
    cronograma,
    archivosAdjuntos,
    equipoIds,
  } = req.body;

  if (categoria !== undefined && !Proyecto.CATEGORIAS.includes(categoria)) {
    return res.status(400).json({ error: `Categoria invalida. Usa una de: ${Proyecto.CATEGORIAS.join(', ')}` });
  }
  if (estado !== undefined && !Proyecto.ESTADOS.includes(estado)) {
    return res.status(400).json({ error: `Estado invalido. Usa uno de: ${Proyecto.ESTADOS.join(', ')}` });
  }
  if (estadoManual !== undefined && typeof estadoManual !== 'boolean') {
    return res.status(400).json({ error: 'estadoManual debe ser true o false.' });
  }

  let formularioValidado;
  if (formulario !== undefined) {
    formularioValidado = validarCampos(formulario);
    if (formularioValidado === null) {
      return res.status(400).json({ error: 'El formulario de recoleccion tiene un formato invalido.' });
    }
  }

  let cronogramaValidado;
  if (cronograma !== undefined) {
    cronogramaValidado = validarCronograma(cronograma);
    if (cronogramaValidado === null) {
      return res.status(400).json({ error: 'El cronograma tiene un formato invalido.' });
    }
  }

  let archivosValidados;
  if (archivosAdjuntos !== undefined) {
    archivosValidados = validarArchivosAdjuntos(archivosAdjuntos);
    if (archivosValidados === null) {
      return res.status(400).json({ error: 'Los archivos adjuntos tienen un formato invalido.' });
    }
  }

  if (nombre !== undefined) proyecto.nombre = nombre;
  if (categoria !== undefined) proyecto.categoria = categoria;
  if (descripcion !== undefined) proyecto.descripcion = descripcion;
  if (fechaInicio !== undefined) proyecto.fechaInicio = fechaInicio;
  if (fechaFin !== undefined) proyecto.fechaFin = fechaFin;

  // "estado": por defecto (estadoManual=false) se recalcula solo a partir
  // de fechaFin, ignorando cualquier "estado" que llegue en el body -- asi
  // nunca queda desactualizado. Solo si el formulario forzo el modo manual
  // (estadoManual=true) se respeta el valor elegido por quien edita.
  if (estadoManual !== undefined) proyecto.estadoManual = estadoManual;
  if (proyecto.estadoManual) {
    if (estado !== undefined) proyecto.estado = estado;
  } else {
    proyecto.estado = calcularEstadoAutomatico(proyecto.fechaFin);
  }

  if (formularioValidado !== undefined) proyecto.formulario = formularioValidado;
  if (cronogramaValidado !== undefined) proyecto.cronograma = cronogramaValidado;
  if (archivosValidados !== undefined) proyecto.archivosAdjuntos = archivosValidados;
  await proyecto.save();

  if (Array.isArray(equipoIds)) {
    // Reemplazar el equipo completo es una decision de permisos, no de
    // contenido del proyecto -- se deja solo para Administrador y Lider,
    // aunque quien edita este proyecto en particular tenga nivel 'editar'
    // (ver puedeEditarProyecto). Los permisos puntuales se gestionan desde
    // Administracion (ver userController.actualizarPermisos).
    if (!['administrador', 'lider'].includes(req.user.rol)) {
      return res.status(403).json({ error: 'No tienes permisos para modificar el equipo de este proyecto.' });
    }
    await ProyectoEquipo.destroy({ where: { proyecto_id: proyecto.id } });
    if (equipoIds.length > 0) {
      await ProyectoEquipo.bulkCreate(
        equipoIds.map((usuario_id) => ({ proyecto_id: proyecto.id, usuario_id }))
      );
    }
  }

  const completo = await Proyecto.findByPk(proyecto.id, { include: INCLUDE_DETALLE });
  const total = await ParticipanteProyecto.count({ where: { proyecto_id: completo.id } });
  res.json(serializar(completo, total));
}

// DELETE /api/proyectos/:id  (Administrador y Lider) - RF-07
async function eliminar(req, res) {
  const proyecto = await Proyecto.findByPk(req.params.id);
  if (!proyecto) return res.status(404).json({ error: 'Proyecto no encontrado.' });
  await proyecto.destroy();
  res.json({ mensaje: 'Proyecto eliminado.' });
}

// GET /api/proyectos/usuarios-disponibles  (Administrador y Lider)
// Lista liviana de usuarios activos para elegir el equipo de un proyecto,
// sin exponer el modulo completo de Administracion (que es solo-Admin).
async function usuariosDisponibles(req, res) {
  const usuarios = await User.findAll({
    where: { activo: true },
    attributes: ATTR_USUARIO,
    order: [['nombre', 'ASC']],
  });
  res.json(usuarios);
}

module.exports = { listar, obtener, crear, actualizar, eliminar, usuariosDisponibles };
