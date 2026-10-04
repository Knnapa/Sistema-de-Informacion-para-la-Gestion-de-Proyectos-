// Catalogo central de roles: valor que maneja el backend, etiqueta en
// español y color de badge. Sidebar, Topbar y la pantalla de Administracion
// leen de aqui para no repetir el mismo mapeo en cada archivo.
export const ROLES = [
  { value: 'administrador', label: 'Administrador', tono: 'purple' },
  { value: 'lider', label: 'Líder', tono: 'blue' },
  { value: 'colider', label: 'Co-líder', tono: 'teal' },
  { value: 'estudiante', label: 'Estudiante', tono: 'slate' },
];

export function rolLabel(rol) {
  return ROLES.find((r) => r.value === rol)?.label || rol;
}

export function rolTono(rol) {
  return ROLES.find((r) => r.value === rol)?.tono || 'gray';
}
