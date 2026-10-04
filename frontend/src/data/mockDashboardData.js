// Datos de ejemplo para el Dashboard. El modulo de Proyectos/Participantes
// todavia no existe, asi que estos numeros son de muestra (coinciden con el
// mockup que armaste en Lovable) para poder maquetar la pantalla ya mismo.
//
// Cuando construyamos esos modulos, estos tres bloques se reemplazan por
// llamadas reales a la API (por ejemplo GET /api/proyectos/resumen).

export const resumenStats = {
  totalProyectos: 6,
  totalParticipantes: 832,
  proyectosActivos: 4,
};

// "label" va partido en lineas para que quepa debajo de cada barra.
export const proyectosPorCategoria = [
  { label: ['Educación', 'continua'], value: 1 },
  { label: ['Proyección', 'social'], value: 4 },
  { label: ['Emprendi-', 'miento'], value: 2 },
  { label: ['Salud', 'comunitaria'], value: 2 },
  { label: ['Cultura'], value: 2 },
];

export const participantesPorTipo = [
  { label: 'Estudiantes', value: 320 },
  { label: 'Egresados', value: 230 },
  { label: 'Comunidad externa', value: 190 },
  { label: 'Docentes', value: 92 },
];
