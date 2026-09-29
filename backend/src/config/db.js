// Conexion a MySQL usando Sequelize.
// Todas las credenciales salen de variables de entorno (ver .env.example).
require('dotenv').config();
const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 3306,
    dialect: 'mysql',
    logging: false, // cambia a console.log si quieres ver el SQL generado
  }
);

module.exports = sequelize;
