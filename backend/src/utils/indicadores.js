// Logica de los Indicadores (modulo nuevo): catalogo de indicadores que se
// calculan solos con datos reales del sistema ("sistema"), calculo del
// valor de los indicadores manuales a partir de sus variables, y el manejo
// del historial mensual que alimenta la grafica de la vista.
const { Proyecto, Participante, ParticipanteProyecto } = require('../models');

// Catalogo de indicadores que el sistema puede calcular solo, a partir de
// datos reales (proyectos y participantes vinculados). El tipo de cada uno
// queda fijo (no lo elige quien lo crea) para que el calculo siempre tenga
// sentido con el numero que produce.
const SISTEMA_INDICADORES = {
  proyectos_activos: {
    etiqueta: 'Proyectos activos',
    tipo: 'conteo',
    calcular: () => Proyecto.count({ where: { estado: 'activo' } }),
  },
  proyectos_finalizados: {
    etiqueta: 'Proyectos finalizados',
    tipo: 'conteo',
    calcular: () => Proyecto.count({ where: { estado: 'finalizado' } }),
  },
  total_proyectos: {
    etiqueta: 'Total de proyectos',
    tipo: 'conteo',
    calcular: () => Proyecto.count(),
  },
  total_participantes: {
    etiqueta: 'Total de participantes',
    tipo: 'conteo',
    calcular: () => Participante.count(),
  },
  promedio_participantes_por_proyecto: {
    etiqueta: 'Promedio de participantes por proyecto',
    tipo: 'promedio',
    calcular: async () => {
      const totalProyectos = await Proyecto.count();
      if (totalProyectos === 0) return 0;
      const totalVinculos = await ParticipanteProyecto.count();
      return totalVinculos / totalProyectos;
    },
  },
  tasa_finalizacion_proyectos: {
    etiqueta: 'Tasa de finalización de proyectos',
    tipo: 'porcentaje',
    calcular: async () => {
      const total = await Proyecto.count();
      if (total === 0) return 0;
      const finalizados = await Proyecto.count({ where: { estado: 'finalizado' } });
      return (finalizados / total) * 100;
    },
  },
};

function catalogoSistema() {
  return Object.entries(SISTEMA_INDICADORES).map(([clave, info]) => ({
    clave,
    etiqueta: info.etiqueta,
    tipo: info.tipo,
  }));
}

const TIPOS = ['porcentaje', 'promedio', 'conteo'];

// variables: [{ nombre, valor (numero) }]. Porcentaje usa las primeras dos
// (numerador / denominador * 100); promedio y conteo usan todas.
function validarVariables(tipo, variables) {
  if (!Array.isArray(variables) || variables.length === 0) return null;
  const limpias = [];
  for (const v of variables) {
    if (!v || typeof v.nombre !== 'string' || !v.nombre.trim()) return null;
    const valor = Number(v.valor);
    if (!Number.isFinite(valor)) return null;
    limpias.push({ nombre: v.nombre.trim(), valor });
  }
  if (tipo === 'porcentaje' && limpias.length < 2) return null;
  return limpias;
}

function calcularValorManual(tipo, variables) {
  if (tipo === 'porcentaje') {
    const [parte, total] = variables;
    if (!total || total.valor === 0) return 0;
    return (parte.valor / total.valor) * 100;
  }
  if (tipo === 'promedio') {
    const suma = variables.reduce((acc, v) => acc + v.valor, 0);
    return suma / variables.length;
  }
  // conteo
  return variables.reduce((acc, v) => acc + v.valor, 0);
}

function periodoActual() {
  return new Date().toISOString().slice(0, 7); // 'YYYY-MM'
}

// Guarda/reemplaza el valor del mes actual en el historial y conserva como
// mucho los ultimos 12 meses, para que la grafica no crezca sin limite.
function upsertHistorial(historial, periodo, valor) {
  const lista = Array.isArray(historial) ? historial.slice() : [];
  const idx = lista.findIndex((h) => h.periodo === periodo);
  const entrada = { periodo, valor };
  if (idx >= 0) lista[idx] = entrada;
  else lista.push(entrada);
  lista.sort((a, b) => a.periodo.localeCompare(b.periodo));
  return lista.slice(-12);
}

module.exports = {
  SISTEMA_INDICADORES,
  catalogoSistema,
  TIPOS,
  validarVariables,
  calcularValorManual,
  periodoActual,
  upsertHistorial,
};
