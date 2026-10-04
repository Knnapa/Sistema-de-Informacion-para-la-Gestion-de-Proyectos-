const express = require('express');
const requireAuth = require('../middleware/auth');
const requireRole = require('../middleware/rbac');
const asyncHandler = require('../utils/asyncHandler');
const { listar, catalogo, crear, actualizar, eliminar } = require('../controllers/indicadorController');

const router = express.Router();

// Todo el modulo de Indicadores es solo para Administrador y Lider, igual
// que en la barra lateral (ver config/modules.js en el frontend).
router.use(requireAuth);
router.use(requireRole('administrador', 'lider'));

// IMPORTANTE: /catalogo-sistema va antes que cualquier ruta con :id.
router.get('/catalogo-sistema', asyncHandler(catalogo));
router.get('/', asyncHandler(listar));
router.post('/', asyncHandler(crear));
router.put('/:id', asyncHandler(actualizar));
router.delete('/:id', asyncHandler(eliminar));

module.exports = router;
