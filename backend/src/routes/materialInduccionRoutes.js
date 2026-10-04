const express = require('express');
const requireAuth = require('../middleware/auth');
const requireRole = require('../middleware/rbac');
const asyncHandler = require('../utils/asyncHandler');
const { listar, crear, actualizar, eliminar } = require('../controllers/materialInduccionController');

const router = express.Router();

// Ver el material de induccion es para cualquier usuario autenticado (el
// modulo es visible para los 4 roles, ver config/modules.js en el
// frontend); subir/editar/eliminar es solo Administrador.
router.use(requireAuth);

router.get('/', asyncHandler(listar));
router.post('/', requireRole('administrador'), asyncHandler(crear));
router.put('/:id', requireRole('administrador'), asyncHandler(actualizar));
router.delete('/:id', requireRole('administrador'), asyncHandler(eliminar));

module.exports = router;
