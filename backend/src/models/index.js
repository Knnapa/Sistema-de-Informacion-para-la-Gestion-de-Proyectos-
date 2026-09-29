const sequelize = require('../config/db');
const User = require('./User');
const ActionLog = require('./ActionLog');

// Asociaciones
User.hasMany(ActionLog, { foreignKey: 'usuario_id', as: 'acciones' });
ActionLog.belongsTo(User, { foreignKey: 'usuario_id', as: 'usuario' });

module.exports = { sequelize, User, ActionLog };
