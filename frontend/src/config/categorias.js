// Categorias de proyecto: coinciden con el enum del backend y con las
// categorias que ya se usan en el Dashboard (data/mockDashboardData.js).
export const CATEGORIAS = [
  { value: 'educacion_continua', label: 'Educación continua' },
  { value: 'proyeccion_social', label: 'Proyección social' },
  { value: 'emprendimiento', label: 'Emprendimiento' },
  { value: 'salud_comunitaria', label: 'Salud comunitaria' },
  { value: 'cultura', label: 'Cultura' },
];

export function categoriaLabel(value) {
  return CATEGORIAS.find((c) => c.value === value)?.label || value;
}
