const express = require('express');
const requireAuth = require('../middleware/auth');
const requireRole = require('../middleware/rbac');
const asyncHandler = require('../utils/asyncHandler');
const {
  listar,
  obtener,
  crear,
  actualizar,
  eliminar,
  usuariosDisponibles,
} = require('../controllers/proyectoController');

const router = express.Router();

// Todo el modulo de Proyectos exige estar autenticado. Es visible para los
// 4 roles (RF-07); crear/eliminar es solo Administrador y Lider. Editar
// tambien lo puede hacer quien tenga nivel 'editar' asignado en ESE
// proyecto puntual desde Administracion -- por eso actualizar() valida el
// permiso adentro del controlador en vez de con requireRole aqui (ver
// proyectoController.puedeEditarProyecto).
router.use(requireAuth);

// IMPORTANTE: /usuarios-disponibles va antes que /:id para que Express no
// la confunda con un id de proyecto.
router.get('/usuarios-disponibles', requireRole('administrador', 'lider'), asyncHandler(usuariosDisponibles));
router.get('/', asyncHandler(listar));
router.post('/', requireRole('administrador', 'lider'), asyncHandler(crear));
router.get('/:id', asyncHandler(obtener));
router.put('/:id', asyncHandler(actualizar));
router.delete('/:id', requireRole('administrador', 'lider'), asyncHandler(eliminar));

module.exports = router;
