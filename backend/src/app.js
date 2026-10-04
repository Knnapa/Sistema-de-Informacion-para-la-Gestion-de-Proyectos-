const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const proyectoRoutes = require('./routes/proyectoRoutes');
const participanteRoutes = require('./routes/participanteRoutes');
const archivoRoutes = require('./routes/archivoRoutes');
const indicadorRoutes = require('./routes/indicadorRoutes');
const materialInduccionRoutes = require('./routes/materialInduccionRoutes');

const app = express();

app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => res.json({ ok: true }));

app.use('/api/auth', authRoutes);
app.use('/api/usuarios', userRoutes);
app.use('/api/proyectos', proyectoRoutes);
app.use('/api/participantes', participanteRoutes);
app.use('/api/archivos', archivoRoutes);
app.use('/api/indicadores', indicadorRoutes);
app.use('/api/materiales-induccion', materialInduccionRoutes);

// Manejador de errores centralizado (evita que un error tumbe el proceso)
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Error interno del servidor.' });
});

module.exports = app;
