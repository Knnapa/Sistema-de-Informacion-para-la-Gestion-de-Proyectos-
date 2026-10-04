const sequelize = require('../config/db');
const User = require('./User');
const ActionLog = require('./ActionLog');
const Proyecto = require('./Proyecto');
const ProyectoEquipo = require('./ProyectoEquipo');
const Participante = require('./Participante');
const ParticipanteProyecto = require('./ParticipanteProyecto');
const Indicador = require('./Indicador');
const MaterialInduccion = require('./MaterialInduccion');

// Asociaciones
User.hasMany(ActionLog, { foreignKey: 'usuario_id', as: 'acciones' });
ActionLog.belongsTo(User, { foreignKey: 'usuario_id', as: 'usuario' });

Proyecto.belongsTo(User, { foreignKey: 'creado_por', as: 'creador' });

Proyecto.belongsToMany(User, {
  through: ProyectoEquipo,
  foreignKey: 'proyecto_id',
  otherKey: 'usuario_id',
  as: 'equipo',
});
User.belongsToMany(Proyecto, {
  through: ProyectoEquipo,
  foreignKey: 'usuario_id',
  otherKey: 'proyecto_id',
  as: 'proyectos',
});
// Asociaciones directas sobre la tabla intermedia (ademas de las
// belongsToMany de arriba), para poder consultar los permisos por proyecto
// de un usuario puntual sin tener que pasar por Proyecto/User primero (ver
// userController.listarPermisos).
ProyectoEquipo.belongsTo(Proyecto, { foreignKey: 'proyecto_id', as: 'proyecto' });
ProyectoEquipo.belongsTo(User, { foreignKey: 'usuario_id', as: 'usuario' });

Participante.belongsTo(User, { foreignKey: 'creado_por', as: 'creador' });

Participante.belongsToMany(Proyecto, {
  through: ParticipanteProyecto,
  foreignKey: 'participante_id',
  otherKey: 'proyecto_id',
  as: 'proyectos',
});
Proyecto.belongsToMany(Participante, {
  through: ParticipanteProyecto,
  foreignKey: 'proyecto_id',
  otherKey: 'participante_id',
  as: 'participantes',
});

module.exports = {
  sequelize,
  User,
  ActionLog,
  Proyecto,
  ProyectoEquipo,
  Participante,
  ParticipanteProyecto,
  Indicador,
  MaterialInduccion,
};
