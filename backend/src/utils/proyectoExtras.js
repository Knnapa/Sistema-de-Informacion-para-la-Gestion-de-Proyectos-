// Validacion de los dos campos nuevos de Proyecto que no son parte del
// formulario de recoleccion (ver utils/formulario.js): el cronograma (hitos
// con fecha) y los archivos adjuntos generales del proyecto.

// cronograma: [{ titulo, fecha (YYYY-MM-DD) }]
function validarCronograma(cronograma) {
  if (cronograma === undefined) return [];
  if (!Array.isArray(cronograma)) return null;
  for (const hito of cronograma) {
    if (!hito || typeof hito.titulo !== 'string' || !hito.titulo.trim()) return null;
    if (typeof hito.fecha !== 'string' || !hito.fecha.trim()) return null;
  }
  return cronograma.map((h) => ({ titulo: h.titulo.trim(), fecha: h.fecha }));
}

// archivosAdjuntos: [{ archivo (nombre guardado por /api/archivos), nombreOriginal }]
function validarArchivosAdjuntos(archivosAdjuntos) {
  if (archivosAdjuntos === undefined) return [];
  if (!Array.isArray(archivosAdjuntos)) return null;
  for (const a of archivosAdjuntos) {
    if (!a || typeof a.archivo !== 'string' || !a.archivo) return null;
  }
  return archivosAdjuntos.map((a) => ({
    archivo: a.archivo,
    nombreOriginal: typeof a.nombreOriginal === 'string' && a.nombreOriginal ? a.nombreOriginal : a.archivo,
  }));
}

module.exports = { validarCronograma, validarArchivosAdjuntos };
