const { Participante, Proyecto, ParticipanteProyecto } = require('../models');
const { validarCampos } = require('../utils/formulario');

const INCLUDE_PROYECTOS = [
  { model: Proyecto, as: 'proyectos', attributes: ['id', 'nombre'], through: { attributes: [] } },
];

function serializar(participante) {
  const proyectos = participante.proyectos || [];
  return {
    id: participante.id,
    nombre: participante.nombre,
    tipoDocumento: participante.tipoDocumento,
    identificacion: participante.identificacion,
    telefono: participante.telefono,
    tipoPoblacion: participante.tipoPoblacion,
    camposPersonalizados: participante.camposPersonalizados || [],
    proyectos: proyectos.map((p) => ({ id: p.id, nombre: p.nombre })),
    createdAt: participante.createdAt,
  };
}

// GET /api/participantes  (Administrador y Lider) - RF-10
async function listar(req, res) {
  const participantes = await Participante.findAll({
    include: INCLUDE_PROYECTOS,
    order: [['createdAt', 'DESC']],
  });
  res.json(participantes.map(serializar));
}

// GET /api/participantes/:id  (Administrador y Lider)
async function obtener(req, res) {
  const participante = await Participante.findByPk(req.params.id, { include: INCLUDE_PROYECTOS });
  if (!participante) return res.status(404).json({ error: 'Participante no encontrado.' });
  res.json(serializar(participante));
}

// POST /api/participantes  (Administrador y Lider) - RF-09, RF-10
// Registra un participante (o reutiliza uno existente por identificacion,
// ya que la misma persona puede pasar por varios proyectos) y lo vincula
// al proyecto indicado. camposPersonalizados solo se guarda si el
// participante es nuevo -- si ya existia, se edita aparte (PUT) para no
// pisar sus datos sin querer al vincularlo a otro proyecto.
async function crear(req, res) {
  const { proyectoId, nombre, tipoDocumento, identificacion, telefono, tipoPoblacion, camposPersonalizados } =
    req.body;

  if (!proyectoId || !nombre || !identificacion) {
    return res.status(400).json({ error: 'proyectoId, nombre e identificacion son obligatorios.' });
  }
  if (tipoDocumento && !Participante.TIPOS_DOCUMENTO.includes(tipoDocumento)) {
    return res
      .status(400)
      .json({ error: `Tipo de documento invalido. Usa uno de: ${Participante.TIPOS_DOCUMENTO.join(', ')}` });
  }
  if (tipoPoblacion && !Participante.TIPOS_POBLACION.includes(tipoPoblacion)) {
    return res
      .status(400)
      .json({ error: `Tipo de poblacion invalido. Usa uno de: ${Participante.TIPOS_POBLACION.join(', ')}` });
  }
  const camposValidados = validarCampos(camposPersonalizados);
  if (camposValidados === null) {
    return res.status(400).json({ error: 'Los campos personalizados tienen un formato invalido.' });
  }

  const proyecto = await Proyecto.findByPk(proyectoId);
  if (!proyecto) return res.status(404).json({ error: 'Proyecto no encontrado.' });

  let participante = await Participante.findOne({ where: { identificacion } });
  if (!participante) {
    participante = await Participante.create({
      nombre,
      tipoDocumento: tipoDocumento || 'CC',
      identificacion,
      telefono: telefono || null,
      tipoPoblacion: tipoPoblacion || null,
      camposPersonalizados: camposValidados,
      creadoPor: req.user.id,
    });
  }

  const yaVinculado = await ParticipanteProyecto.findOne({
    where: { participante_id: participante.id, proyecto_id: proyecto.id },
  });
  if (yaVinculado) {
    return res.status(409).json({ error: 'Este participante ya esta vinculado a ese proyecto.' });
  }

  await ParticipanteProyecto.create({
    participante_id: participante.id,
    proyecto_id: proyecto.id,
  });

  const completo = await Participante.findByPk(participante.id, { include: INCLUDE_PROYECTOS });
  res.status(201).json(serializar(completo));
}

// PUT /api/participantes/:id  (Administrador y Lider)
// Edita los datos fijos del participante y/o sus campos personalizados
// (agregar, quitar o cambiar nombre/contenido/archivo).
async function actualizar(req, res) {
  const participante = await Participante.findByPk(req.params.id);
  if (!participante) return res.status(404).json({ error: 'Participante no encontrado.' });

  const { nombre, tipoDocumento, identificacion, telefono, tipoPoblacion, camposPersonalizados } = req.body;

  if (tipoDocumento !== undefined && !Participante.TIPOS_DOCUMENTO.includes(tipoDocumento)) {
    return res
      .status(400)
      .json({ error: `Tipo de documento invalido. Usa uno de: ${Participante.TIPOS_DOCUMENTO.join(', ')}` });
  }
  if (tipoPoblacion !== undefined && tipoPoblacion && !Participante.TIPOS_POBLACION.includes(tipoPoblacion)) {
    return res
      .status(400)
      .json({ error: `Tipo de poblacion invalido. Usa uno de: ${Participante.TIPOS_POBLACION.join(', ')}` });
  }

  let camposValidados;
  if (camposPersonalizados !== undefined) {
    camposValidados = validarCampos(camposPersonalizados);
    if (camposValidados === null) {
      return res.status(400).json({ error: 'Los campos personalizados tienen un formato invalido.' });
    }
  }

  if (nombre !== undefined) participante.nombre = nombre;
  if (tipoDocumento !== undefined) participante.tipoDocumento = tipoDocumento;
  if (identificacion !== undefined) participante.identificacion = identificacion;
  if (telefono !== undefined) participante.telefono = telefono || null;
  if (tipoPoblacion !== undefined) participante.tipoPoblacion = tipoPoblacion || null;
  if (camposValidados !== undefined) participante.camposPersonalizados = camposValidados;
  await participante.save();

  const completo = await Participante.findByPk(participante.id, { include: INCLUDE_PROYECTOS });
  res.json(serializar(completo));
}

// POST /api/participantes/:id/vincular  (Administrador y Lider) - RF-10
// Vincula un participante YA EXISTENTE (encontrado por busqueda) a otro proyecto.
async function vincular(req, res) {
  const participante = await Participante.findByPk(req.params.id);
  if (!participante) return res.status(404).json({ error: 'Participante no encontrado.' });

  const { proyectoId } = req.body;
  if (!proyectoId) return res.status(400).json({ error: 'proyectoId es obligatorio.' });

  const proyecto = await Proyecto.findByPk(proyectoId);
  if (!proyecto) return res.status(404).json({ error: 'Proyecto no encontrado.' });

  const yaVinculado = await ParticipanteProyecto.findOne({
    where: { participante_id: participante.id, proyecto_id: proyecto.id },
  });
  if (yaVinculado) {
    return res.status(409).json({ error: 'Este participante ya esta vinculado a ese proyecto.' });
  }

  await ParticipanteProyecto.create({
    participante_id: participante.id,
    proyecto_id: proyecto.id,
  });

  const completo = await Participante.findByPk(participante.id, { include: INCLUDE_PROYECTOS });
  res.json(serializar(completo));
}

// DELETE /api/participantes/:id/proyectos/:proyectoId  (Administrador y Lider)
// Desvincula al participante de ese proyecto (no lo elimina, solo quita el vinculo).
async function desvincular(req, res) {
  const { id, proyectoId } = req.params;
  const participante = await Participante.findByPk(id);
  if (!participante) return res.status(404).json({ error: 'Participante no encontrado.' });

  const vinculo = await ParticipanteProyecto.findOne({
    where: { participante_id: id, proyecto_id: proyectoId },
  });
  if (!vinculo) return res.status(404).json({ error: 'Ese participante no esta vinculado a ese proyecto.' });
  await vinculo.destroy();

  const completo = await Participante.findByPk(id, { include: INCLUDE_PROYECTOS });
  res.json(serializar(completo));
}

module.exports = { listar, obtener, crear, actualizar, vincular, desvincular };
