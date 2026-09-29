// Crea el usuario Administrador inicial si todavia no existe.
// Uso: npm run seed  (ejecutar despues de levantar la base de datos por primera vez)
require('dotenv').config();
const bcrypt = require('bcryptjs');
const { sequelize, User } = require('./models');

async function seed() {
  await sequelize.authenticate();
  await sequelize.sync();

  const correo = process.env.SEED_ADMIN_CORREO || 'admin@miudes.local';
  const existente = await User.findOne({ where: { correo } });

  if (existente) {
    console.log(`Ya existe un usuario administrador con el correo ${correo}. No se creo ninguno nuevo.`);
    process.exit(0);
  }

  const passwordHash = await bcrypt.hash(
    process.env.SEED_ADMIN_PASSWORD || 'CambiaEstaClave123',
    10
  );

  await User.create({
    nombre: process.env.SEED_ADMIN_NOMBRE || 'Administrador',
    correo,
    passwordHash,
    rol: 'administrador',
    activo: true,
  });

  console.log(`Usuario administrador creado: ${correo}`);
  console.log('Recuerda cambiar esta contrasena despues del primer login.');
  process.exit(0);
}

seed().catch((err) => {
  console.error('Error creando el usuario administrador:', err);
  process.exit(1);
});
