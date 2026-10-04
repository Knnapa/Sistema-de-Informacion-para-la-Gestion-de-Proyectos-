// Tabla intermedia Participante <-> Proyecto: a que proyectos esta
// vinculado cada participante. El formulario de recoleccion (con sus
// valores) es informacion propia de CADA PROYECTO (ver Proyecto.formulario),
// no algo que cada participante responda por separado, por eso esta tabla
// solo guarda el vinculo.
const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const ParticipanteProyecto = sequelize.define(
  'ParticipanteProyecto',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
  },
  {
    tableName: 'participantes_proyectos',
    underscored: true,
    timestamps: true,
    updatedAt: false,
  }
);

module.exports = ParticipanteProyecto;
