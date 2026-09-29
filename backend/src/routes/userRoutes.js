const express = require('express');
const requireAuth = require('../middleware/auth');
const requireRole = require('../middleware/rbac');
const asyncHandler = require('../utils/asyncHandler');
const {
  listar,
  crear,
  actualizar,
  desactivar,
  resetPassword,
} = require('../controllers/userController');

const router = express.Router();

// Todas las rutas de este modulo requieren estar autenticado Y ser Administrador
// (RF-01 a RF-04: el modulo de Administracion es de uso exclusivo del rol Administrador).
router.use(requireAuth, requireRole('administrador'));

router.get('/', asyncHandler(listar));
router.post('/', asyncHandler(crear));
router.put('/:id', asyncHandler(actualizar));
router.put('/:id/desactivar', asyncHandler(desactivar));
router.put('/:id/reset-password', asyncHandler(resetPassword));

module.exports = router;
