const fs = require('fs');
const path = require('path');
const { UPLOADS_DIR } = require('../middleware/upload');

// Solo letras, numeros, puntos, guiones y guion bajo -- los nombres que
// genera multer (ver middleware/upload.js) siempre cumplen esto. Evita
// que alguien intente pedir ../../ u otra ruta fuera de uploads/.
const NOMBRE_VALIDO = /^[a-zA-Z0-9_.-]+$/;

// POST /api/archivos  (Administrador y Lider)
// Sube un archivo para un campo tipo "archivo" del formulario de
// recoleccion de un proyecto. Devuelve el nombre guardado (no el original)
// para que el frontend lo guarde como valor del campo.
function subir(req, res) {
  if (!req.file) {
    return res.status(400).json({ error: 'No se recibio ningun archivo.' });
  }
  res.status(201).json({ archivo: req.file.filename });
}

// GET /api/archivos/:archivo  (cualquier usuario autenticado)
// Descarga un archivo subido previamente. ?nombre= es solo para que el
// navegador sugiera el nombre original al guardar (no se usa para ubicar
// el archivo en disco).
function descargar(req, res) {
  const { archivo } = req.params;
  if (!NOMBRE_VALIDO.test(archivo)) {
    return res.status(400).json({ error: 'Nombre de archivo invalido.' });
  }

  const ruta = path.join(UPLOADS_DIR, archivo);
  if (!fs.existsSync(ruta)) {
    return res.status(404).json({ error: 'Archivo no encontrado.' });
  }

  const nombreSugerido = typeof req.query.nombre === 'string' && req.query.nombre.trim() ? req.query.nombre : archivo;
  res.download(ruta, nombreSugerido);
}

module.exports = { subir, descargar };
