const { Indicador } = require('../models');
const {
  SISTEMA_INDICADORES,
  catalogoSistema,
  TIPOS,
  validarVariables,
  calcularValorManual,
  periodoActual,
  upsertHistorial,
} = require('../utils/indicadores');

function serializar(indicador) {
  return {
    id: indicador.id,
    nombre: indicador.nombre,
    tipo: indicador.tipo,
    fuente: indicador.fuente,
    campoSistema: indicador.campoSistema,
    variables: indicador.variables || [],
    valor: indicador.valor,
    historial: indicador.historial || [],
    createdAt: indicador.createdAt,
    updatedAt: indicador.updatedAt,
  };
}

// GET /api/indicadores  (Administrador y Lider)
// Antes de responder, recalcula en vivo los indicadores de fuente 'sistema'
// a partir de los datos reales y guarda el valor del mes actual en su
// historial -- asi la tarjeta y la grafica siempre reflejan la base de
// datos de verdad, sin tener que editar el indicador a mano.
async function listar(req, res) {
  const indicadores = await Indicador.findAll({ order: [['createdAt', 'ASC']] });
  const periodo = periodoActual();

  for (const ind of indicadores) {
    if (ind.fuente !== 'sistema') continue;
    const info = SISTEMA_INDICADORES[ind.campoSistema];
    if (!info) continue;
    const valor = await info.calcular();
    if (valor !== ind.valor || !(ind.historial || []).some((h) => h.periodo === periodo)) {
      ind.valor = valor;
      ind.historial = upsertHistorial(ind.historial, periodo, valor);
      await ind.save();
    }
  }

  res.json(indicadores.map(serializar));
}

// GET /api/indicadores/catalogo-sistema  (Administrador y Lider)
// Lista de indicadores que el sistema puede calcular solo, para el selector
// del formulario "Nuevo indicador" cuando se elige origen "Datos del sistema".
function catalogo(req, res) {
  res.json(catalogoSistema());
}

// POST /api/indicadores  (Administrador y Lider)
async function crear(req, res) {
  const { nombre, fuente, campoSistema, tipo, variables } = req.body;

  if (!nombre || !nombre.trim()) {
    return res.status(400).json({ error: 'El nombre del indicador es obligatorio.' });
  }
  if (!Indicador.FUENTES.includes(fuente)) {
    return res.status(400).json({ error: `Origen invalido. Usa uno de: ${Indicador.FUENTES.join(', ')}` });
  }

  if (fuente === 'sistema') {
    const info = SISTEMA_INDICADORES[campoSistema];
    if (!info) {
      return res.status(400).json({ error: 'Selecciona un dato del sistema valido.' });
    }
    const valor = await info.calcular();
    const indicador = await Indicador.create({
      nombre: nombre.trim(),
      tipo: info.tipo,
      fuente: 'sistema',
      campoSistema,
      variables: [],
      valor,
      historial: upsertHistorial([], periodoActual(), valor),
      creadoPor: req.user.id,
    });
    return res.status(201).json(serializar(indicador));
  }

  // fuente === 'manual'
  if (!TIPOS.includes(tipo)) {
    return res.status(400).json({ error: `Tipo invalido. Usa uno de: ${TIPOS.join(', ')}` });
  }
  const variablesValidadas = validarVariables(tipo, variables);
  if (variablesValidadas === null) {
    return res.status(400).json({
      error:
        tipo === 'porcentaje'
          ? 'Un indicador de porcentaje necesita al menos dos variables (numerador y denominador), cada una con nombre y un valor numerico.'
          : 'Agrega al menos una variable, cada una con nombre y un valor numerico.',
    });
  }
  const valor = calcularValorManual(tipo, variablesValidadas);
  const indicador = await Indicador.create({
    nombre: nombre.trim(),
    tipo,
    fuente: 'manual',
    campoSistema: null,
    variables: variablesValidadas,
    valor,
    historial: upsertHistorial([], periodoActual(), valor),
    creadoPor: req.user.id,
  });
  res.status(201).json(serializar(indicador));
}

// PUT /api/indicadores/:id  (Administrador y Lider)
async function actualizar(req, res) {
  const indicador = await Indicador.findByPk(req.params.id);
  if (!indicador) return res.status(404).json({ error: 'Indicador no encontrado.' });

  const { nombre, fuente, campoSistema, tipo, variables } = req.body;

  if (nombre !== undefined) {
    if (!nombre.trim()) return res.status(400).json({ error: 'El nombre del indicador es obligatorio.' });
    indicador.nombre = nombre.trim();
  }

  const fuenteFinal = fuente !== undefined ? fuente : indicador.fuente;
  if (!Indicador.FUENTES.includes(fuenteFinal)) {
    return res.status(400).json({ error: `Origen invalido. Usa uno de: ${Indicador.FUENTES.join(', ')}` });
  }

  if (fuenteFinal === 'sistema') {
    const clave = campoSistema !== undefined ? campoSistema : indicador.campoSistema;
    const info = SISTEMA_INDICADORES[clave];
    if (!info) {
      return res.status(400).json({ error: 'Selecciona un dato del sistema valido.' });
    }
    const valor = await info.calcular();
    indicador.tipo = info.tipo;
    indicador.fuente = 'sistema';
    indicador.campoSistema = clave;
    indicador.variables = [];
    indicador.valor = valor;
    indicador.historial = upsertHistorial(indicador.historial, periodoActual(), valor);
  } else {
    const tipoFinal = tipo !== undefined ? tipo : indicador.tipo;
    if (!TIPOS.includes(tipoFinal)) {
      return res.status(400).json({ error: `Tipo invalido. Usa uno de: ${TIPOS.join(', ')}` });
    }
    const variablesFinal = variables !== undefined ? variables : indicador.variables;
    const variablesValidadas = validarVariables(tipoFinal, variablesFinal);
    if (variablesValidadas === null) {
      return res.status(400).json({
        error:
          tipoFinal === 'porcentaje'
            ? 'Un indicador de porcentaje necesita al menos dos variables (numerador y denominador), cada una con nombre y un valor numerico.'
            : 'Agrega al menos una variable, cada una con nombre y un valor numerico.',
      });
    }
    const valor = calcularValorManual(tipoFinal, variablesValidadas);
    indicador.tipo = tipoFinal;
    indicador.fuente = 'manual';
    indicador.campoSistema = null;
    indicador.variables = variablesValidadas;
    indicador.valor = valor;
    indicador.historial = upsertHistorial(indicador.historial, periodoActual(), valor);
  }

  await indicador.save();
  res.json(serializar(indicador));
}

// DELETE /api/indicadores/:id  (Administrador y Lider)
async function eliminar(req, res) {
  const indicador = await Indicador.findByPk(req.params.id);
  if (!indicador) return res.status(404).json({ error: 'Indicador no encontrado.' });
  await indicador.destroy();
  res.json({ mensaje: 'Indicador eliminado.' });
}

module.exports = { listar, catalogo, crear, actualizar, eliminar };
