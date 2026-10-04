// Tabla intermedia Proyecto <-> Usuario: quien integra el equipo de cada
// proyecto. Las columnas proyecto_id/usuario_id las agrega la asociacion
// belongsToMany declarada en models/index.js.
const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const ProyectoEquipo = sequelize.define(
  'ProyectoEquipo',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    // Nivel de acceso que tiene ese usuario sobre ESE proyecto en
    // particular, ademas de lo que ya le da su rol global: 'ver' no cambia
    // nada hoy (ver un proyecto ya es publico para los 4 roles), pero deja
    // la asignacion visible en "Equipo de trabajo"; 'editar' le permite
    // editar ese proyecto aunque su rol global no se lo permitiria (ver
    // proyectoController.puedeEditarProyecto). Se asigna desde
    // Administracion (ver userController.actualizarPermisos), no desde el
    // formulario de Proyectos.
    nivel: {
      type: DataTypes.ENUM('ver', 'editar'),
      allowNull: false,
      defaultValue: 'editar',
    },
  },
  {
    tableName: 'proyectos_equipo',
    underscored: true,
    timestamps: true,
    updatedAt: false,
  }
);

module.exports = ProyectoEquipo;
