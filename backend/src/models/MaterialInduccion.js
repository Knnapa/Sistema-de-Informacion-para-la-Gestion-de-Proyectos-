// Modelo del material de Induccion: biblioteca de documentos y videos de
// bienvenida/formacion del equipo, organizados por categoria. Reutiliza el
// mismo mecanismo de subida/descarga que los archivos de Proyectos y
// Participantes (ver middleware/upload.js y routes/archivoRoutes.js).
const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const CATEGORIAS = ['normativa', 'procedimientos', 'bienvenida', 'formatos'];

const MaterialInduccion = sequelize.define(
  'MaterialInduccion',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    titulo: {
      type: DataTypes.STRING(200),
      allowNull: false,
    },
    categoria: {
      type: DataTypes.ENUM(...CATEGORIAS),
      allowNull: false,
    },
    // Nombre guardado por /api/archivos (ver middleware/upload.js).
    archivo: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    // Nombre original del archivo, para mostrarlo y para que la descarga
    // sugiera ese nombre en vez del generado.
    nombreOriginal: {
      type: DataTypes.STRING(255),
      allowNull: false,
      field: 'nombre_original',
    },
    creadoPor: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'creado_por',
    },
  },
  {
    tableName: 'materiales_induccion',
    underscored: true,
    timestamps: true,
  }
);

MaterialInduccion.CATEGORIAS = CATEGORIAS;

module.exports = MaterialInduccion;
