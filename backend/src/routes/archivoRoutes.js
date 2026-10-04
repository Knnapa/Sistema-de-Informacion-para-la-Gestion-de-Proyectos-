const express = require('express');
const requireAuth = require('../middleware/auth');
const requireRole = require('../middleware/rbac');
const asyncHandler = require('../utils/asyncHandler');
const { upload } = require('../middleware/upload');
const { subir, descargar } = require('../controllers/archivoController');

const router = express.Router();

router.use(requireAuth);

// Subir: solo quien puede editar proyectos (Administrador y Lider), igual
// que el resto del formulario de recoleccion.
router.post('/', requireRole('administrador', 'lider'), upload.single('archivo'), asyncHandler(subir));

// Descargar: cualquier usuario autenticado (los mismos que pueden ver el
// proyecto en /api/proyectos).
router.get('/:archivo', asyncHandler(descargar));

module.exports = router;
