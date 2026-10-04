// Tipos de indicador (coinciden con el enum del backend) y utilidades para
// mostrarlos: etiqueta, formato del valor y meses cortos para la grafica.
export const TIPOS_INDICADOR = [
  { value: 'porcentaje', label: 'Porcentaje' },
  { value: 'promedio', label: 'Promedio' },
  { value: 'conteo', label: 'Conteo' },
];

export function tipoLabel(value) {
  return TIPOS_INDICADOR.find((t) => t.value === value)?.label || value;
}

export function formatearValor(indicador) {
  const { tipo, valor } = indicador;
  if (tipo === 'porcentaje') {
    return `${Math.round(valor * 10) / 10}%`;
  }
  if (tipo === 'promedio') {
    return valor.toLocaleString('es-CO', { maximumFractionDigits: 1, minimumFractionDigits: 0 });
  }
  return Math.round(valor).toLocaleString('es-CO');
}

const MESES_CORTOS = [
  'Ene',
  'Feb',
  'Mar',
  'Abr',
  'May',
  'Jun',
  'Jul',
  'Ago',
  'Sep',
  'Oct',
  'Nov',
  'Dic',
];

// 'YYYY-MM' -> 'Oct 26'
export function formatearPeriodo(periodo) {
  const [anio, mes] = periodo.split('-').map(Number);
  const nombre = MESES_CORTOS[(mes || 1) - 1] || periodo;
  return `${nombre} ${String(anio).slice(-2)}`;
}
