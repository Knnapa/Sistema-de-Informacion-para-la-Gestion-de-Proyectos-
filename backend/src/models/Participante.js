// Modelo de Participante/beneficiario (RF-09, RF-10). Es una entidad global:
// la misma persona (por identificacion) puede estar vinculada a varios
// proyectos a la vez, via la tabla intermedia ParticipanteProyecto.
const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

// Mismas categorias que ya se usan en el donut del Dashboard.
const TIPOS_POBLACION = ['estudiantes', 'egresados', 'comunidad_externa', 'docentes'];

// Tipos de documento de identidad usados en Colombia.
const TIPOS_DOCUMENTO = ['CC', 'TI', 'CE', 'PA', 'RC'];

const Participante = sequelize.define(
  'Participante',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    nombre: {
      type: DataTypes.STRING(200),
      allowNull: false,
    },
    // Tipo de documento (CC, TI, CE, PA, RC); se agrego despues de que ya
    // existian participantes, por eso tiene un valor por defecto -- asi la
    // columna nueva se puede llenar sola para los que ya estaban ('CC' es
    // el mas comun) sin tener que migrar datos a mano.
    tipoDocumento: {
      type: DataTypes.ENUM(...TIPOS_DOCUMENTO),
      allowNull: false,
      defaultValue: 'CC',
      field: 'tipo_documento',
    },
    identificacion: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
    },
    telefono: {
      type: DataTypes.STRING(30),
      allowNull: true,
    },
    tipoPoblacion: {
      type: DataTypes.ENUM(...TIPOS_POBLACION),
      allowNull: true,
      field: 'tipo_poblacion',
    },
    creadoPor: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'creado_por',
    },
    // Campos extra que se le agreguen a este participante (nombre +
    // contenido, o un archivo para subir/descargar) -- misma forma de
    // datos que Proyecto.formulario (ver utils/formulario.js). Son del
    // participante en si, no de un proyecto en particular.
    camposPersonalizados: {
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: [],
      field: 'campos_personalizados',
    },
  },
  {
    tableName: 'participantes',
    underscored: true,
    timestamps: true,
  }
);

Participante.TIPOS_POBLACION = TIPOS_POBLACION;
Participante.TIPOS_DOCUMENTO = TIPOS_DOCUMENTO;

module.exports = Participante;
