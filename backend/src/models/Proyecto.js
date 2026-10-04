// Modelo de Proyecto de extension (RF-07, RF-08): categorias, fechas,
// estado y el formulario dinamico de recoleccion de datos del participante.
const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

// Mismas categorias que ya se usan en el Dashboard.
const CATEGORIAS = [
  'educacion_continua',
  'proyeccion_social',
  'emprendimiento',
  'salud_comunitaria',
  'cultura',
];

const ESTADOS = ['activo', 'finalizado'];

const Proyecto = sequelize.define(
  'Proyecto',
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
    categoria: {
      type: DataTypes.ENUM(...CATEGORIAS),
      allowNull: false,
    },
    descripcion: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    fechaInicio: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      field: 'fecha_inicio',
    },
    fechaFin: {
      type: DataTypes.DATEONLY,
      allowNull: true,
      field: 'fecha_fin',
    },
    estado: {
      type: DataTypes.ENUM(...ESTADOS),
      allowNull: false,
      defaultValue: 'activo',
    },
    // Si es false (por defecto), el controlador recalcula "estado" solo,
    // comparando fechaFin con la fecha de hoy, cada vez que se lista o se
    // consulta el proyecto (ver calcularEstadoAutomatico/sincronizarEstado
    // en proyectoController.js). Si es true, quiere decir que alguien forzo
    // el estado manualmente desde el formulario y ya no se vuelve a tocar
    // automaticamente hasta que se regrese a "Automatico".
    estadoManual: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      field: 'estado_manual',
    },
    // Formulario de recoleccion: informacion adicional propia del proyecto.
    // [{ tipo: 'texto'|'lista'|'multiple'|'archivo', etiqueta,
    //    opciones (solo lista/multiple, es solo la lista a mostrar),
    //    valor (texto: string; archivo: { archivo, nombreOriginal } o '') }]
    formulario: {
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: [],
    },
    // Hitos del proyecto, en orden. [{ titulo, fecha (YYYY-MM-DD) }]
    cronograma: {
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: [],
    },
    // Archivos adjuntos generales del proyecto (no ligados a un campo del
    // formulario). Mismo mecanismo de subida/descarga que los campos tipo
    // "archivo" -- ver middleware/upload.js y routes/archivoRoutes.js.
    // [{ archivo, nombreOriginal }]
    archivosAdjuntos: {
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: [],
      field: 'archivos_adjuntos',
    },
    creadoPor: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'creado_por',
    },
  },
  {
    tableName: 'proyectos',
    underscored: true,
    timestamps: true,
  }
);

Proyecto.CATEGORIAS = CATEGORIAS;
Proyecto.ESTADOS = ESTADOS;

module.exports = Proyecto;
