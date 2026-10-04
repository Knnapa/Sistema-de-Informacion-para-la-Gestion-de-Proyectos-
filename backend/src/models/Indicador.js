// Modelo de Indicador (modulo Indicadores): tableros de control configurables
// por el usuario. Puede nutrirse de datos reales del sistema (fuente
// 'sistema', ver utils/indicadores.js) o de variables que la persona digita
// a mano (fuente 'manual', para conceptos que el sistema no registra como
// asistencia a talleres).
const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const TIPOS = ['porcentaje', 'promedio', 'conteo'];
const FUENTES = ['sistema', 'manual'];

const Indicador = sequelize.define(
  'Indicador',
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
    tipo: {
      type: DataTypes.ENUM(...TIPOS),
      allowNull: false,
    },
    fuente: {
      type: DataTypes.ENUM(...FUENTES),
      allowNull: false,
      defaultValue: 'manual',
    },
    // Solo cuando fuente = 'sistema': clave dentro del catalogo de
    // utils/indicadores.js (ej. 'proyectos_activos').
    campoSistema: {
      type: DataTypes.STRING(80),
      allowNull: true,
      field: 'campo_sistema',
    },
    // Solo cuando fuente = 'manual'. [{ nombre, valor (numero) }]
    variables: {
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: [],
    },
    // Valor actual ya calculado (automatico para 'sistema', a partir de las
    // variables para 'manual'), listo para mostrar en la tarjeta.
    valor: {
      type: DataTypes.FLOAT,
      allowNull: false,
      defaultValue: 0,
    },
    // Historial mensual para la grafica. [{ periodo: 'YYYY-MM', valor }]
    historial: {
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: [],
    },
    creadoPor: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'creado_por',
    },
  },
  {
    tableName: 'indicadores',
    underscored: true,
    timestamps: true,
  }
);

Indicador.TIPOS = TIPOS;
Indicador.FUENTES = FUENTES;

module.exports = Indicador;
