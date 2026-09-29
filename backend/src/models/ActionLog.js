// Log de acciones criticas del Administrador (RF-06).
const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const ActionLog = sequelize.define(
  'ActionLog',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    accion: {
      type: DataTypes.STRING(100),
      allowNull: false, // p.ej. 'crear_usuario', 'editar_usuario', 'desactivar_usuario', 'reset_password'
    },
    detalle: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    tableName: 'logs_acciones',
    underscored: true,
    timestamps: true,
    updatedAt: false,
  }
);

module.exports = ActionLog;
