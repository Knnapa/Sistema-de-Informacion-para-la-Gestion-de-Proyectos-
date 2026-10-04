// Middleware de subida de archivos (multer) para los campos tipo "archivo"
// del formulario de recoleccion de un proyecto. Los archivos quedan en
// backend/uploads/ con un nombre generado (no el nombre original) para
// evitar colisiones y no exponer rutas predecibles.
const multer = require('multer');
const path = require('path');
const crypto = require('crypto');
const fs = require('fs');

const UPLOADS_DIR = path.join(__dirname, '..', '..', 'uploads');
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOADS_DIR),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).slice(0, 10); // limite razonable
    cb(null, `${Date.now()}-${crypto.randomUUID()}${ext}`);
  },
});

// El limite subio de 10MB a 100MB para poder subir videos cortos (material
// de Induccion, ver pages/Induccion.jsx) ademas de documentos; aplica a
// todo lo que pase por este endpoint (campos tipo "archivo", archivos
// adjuntos de Proyectos y material de Induccion).
const upload = multer({
  storage,
  limits: { fileSize: 100 * 1024 * 1024 }, // 100 MB
});

module.exports = { upload, UPLOADS_DIR };
