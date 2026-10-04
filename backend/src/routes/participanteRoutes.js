const express = require('express');
const requireAuth = require('../middleware/auth');
const requireRole = require('../middleware/rbac');
const asyncHandler = require('../utils/asyncHandler');
const {
  listar,
  obtener,
  crear,
  actualizar,
  vincular,
  desvincular,
} = require('../controllers/participanteController');

const router = express.Router();

// Todo el modulo de Participantes es solo para Administrador y Lider
// (RF-09, RF-10) -- a Co-lider/Estudiante ni siquiera se les deja consultarlo.
router.use(requireAuth, requireRole('administrador', 'lider'));

router.get('/', asyncHandler(listar));
router.post('/', asyncHandler(crear));
router.get('/:id', asyncHandler(obtener));
router.put('/:id', asyncHandler(actualizar));
router.post('/:id/vincular', asyncHandler(vincular));
router.delete('/:id/proyectos/:proyectoId', asyncHandler(desvincular));

module.exports = router;
