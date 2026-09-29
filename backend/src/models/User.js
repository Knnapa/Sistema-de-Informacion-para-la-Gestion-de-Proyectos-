// Modelo de Usuario. Cubre RF-01 (crear/editar/desactivar) y RF-02 (roles jerarquicos).
const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

// Roles definidos en REQUISITOS_MIUDES_v2: Administrador, Lider, Co-lider, Estudiante.
const ROLES = ['administrador', 'lider', 'colider', 'estudiante'];

const User = sequelize.define(
  'User',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    nombre: {
      type: DataTypes.STRING(150),
      allowNull: false,
    },
    correo: {
      type: DataTypes.STRING(150),
      allowNull: false,
      unique: true,
      validate: { isEmail: true },
    },
    passwordHash: {
      type: DataTypes.STRING(255),
      allowNull: false,
      field: 'password_hash',
    },
    rol: {
      type: DataTypes.ENUM(...ROLES),
      allowNull: false,
      defaultValue: 'estudiante',
    },
    activo: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
  },
  {
    tableName: 'usuarios',
    underscored: true,
    timestamps: true,
  }
);

User.ROLES = ROLES;

module.exports = User;
