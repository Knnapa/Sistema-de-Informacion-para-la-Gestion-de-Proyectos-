const { MaterialInduccion } = require('../models');

function serializar(m) {
  return {
    id: m.id,
    titulo: m.titulo,
    categoria: m.categoria,
    archivo: m.archivo,
    nombreOriginal: m.nombreOriginal,
    createdAt: m.createdAt,
  };
}

// GET /api/materiales-induccion  (cualquier usuario autenticado)
async function listar(req, res) {
  const materiales = await MaterialInduccion.findAll({ order: [['createdAt', 'DESC']] });
  res.json(materiales.map(serializar));
}

// POST /api/materiales-induccion  (Administrador)
// El archivo ya se subio antes a /api/archivos (igual que un campo tipo
// "archivo" del formulario de recoleccion); aqui solo se guarda la
// referencia junto con el titulo y la categoria.
async function crear(req, res) {
  const { titulo, categoria, archivo, nombreOriginal } = req.body;

  if (!titulo || !titulo.trim()) {
    return res.status(400).json({ error: 'El título es obligatorio.' });
  }
  if (!MaterialInduccion.CATEGORIAS.includes(categoria)) {
    return res
      .status(400)
      .json({ error: `Categoría inválida. Usa una de: ${MaterialInduccion.CATEGORIAS.join(', ')}` });
  }
  if (!archivo || !nombreOriginal) {
    return res.status(400).json({ error: 'Debes subir un archivo.' });
  }

  const material = await MaterialInduccion.create({
    titulo: titulo.trim(),
    categoria,
    archivo,
    nombreOriginal,
    creadoPor: req.user.id,
  });
  res.status(201).json(serializar(material));
}

// PUT /api/materiales-induccion/:id  (Administrador)
async function actualizar(req, res) {
  const material = await MaterialInduccion.findByPk(req.params.id);
  if (!material) return res.status(404).json({ error: 'Material no encontrado.' });

  const { titulo, categoria, archivo, nombreOriginal } = req.body;

  if (titulo !== undefined) {
    if (!titulo.trim()) return res.status(400).json({ error: 'El título es obligatorio.' });
    material.titulo = titulo.trim();
  }
  if (categoria !== undefined) {
    if (!MaterialInduccion.CATEGORIAS.includes(categoria)) {
      return res
        .status(400)
        .json({ error: `Categoría inválida. Usa una de: ${MaterialInduccion.CATEGORIAS.join(', ')}` });
    }
    material.categoria = categoria;
  }
  // Reemplazar el archivo es opcional al editar: solo si mandan los dos.
  if (archivo !== undefined && nombreOriginal !== undefined) {
    material.archivo = archivo;
    material.nombreOriginal = nombreOriginal;
  }

  await material.save();
  res.json(serializar(material));
}

// DELETE /api/materiales-induccion/:id  (Administrador)
async function eliminar(req, res) {
  const material = await MaterialInduccion.findByPk(req.params.id);
  if (!material) return res.status(404).json({ error: 'Material no encontrado.' });
  await material.destroy();
  res.json({ mensaje: 'Material eliminado.' });
}

module.exports = { listar, crear, actualizar, eliminar };
