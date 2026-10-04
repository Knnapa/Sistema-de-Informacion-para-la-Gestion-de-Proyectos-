// Tipos de poblacion de un participante: coinciden con el enum del backend
// y con las categorias que ya se usan en el donut del Dashboard.
export const TIPOS_POBLACION = [
  { value: 'estudiantes', label: 'Estudiantes' },
  { value: 'egresados', label: 'Egresados' },
  { value: 'comunidad_externa', label: 'Comunidad externa' },
  { value: 'docentes', label: 'Docentes' },
];

export function tipoPoblacionLabel(value) {
  return TIPOS_POBLACION.find((t) => t.value === value)?.label || value;
}
