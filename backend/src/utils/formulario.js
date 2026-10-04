// Valida y limpia un arreglo de "campos dinamicos" (ver FormularioBuilder
// en el frontend). Misma forma de datos tanto para Proyecto.formulario
// como para Participante.camposPersonalizados:
// [{ tipo: 'texto'|'lista'|'multiple'|'archivo', etiqueta,
//    opciones (solo lista/multiple), valor (texto: string; archivo: { archivo, nombreOriginal }) }]
const TIPOS = ['texto', 'lista', 'multiple', 'archivo'];

function validarCampos(campos) {
  if (campos === undefined) return [];
  if (!Array.isArray(campos)) return null;

  for (const campo of campos) {
    if (!campo || typeof campo.etiqueta !== 'string' || !campo.etiqueta.trim()) return null;
    if (!TIPOS.includes(campo.tipo)) return null;
    if ((campo.tipo === 'lista' || campo.tipo === 'multiple') && !Array.isArray(campo.opciones)) return null;
  }

  return campos.map((c) => {
    const limpio = { tipo: c.tipo, etiqueta: c.etiqueta.trim() };
    if (c.tipo === 'lista' || c.tipo === 'multiple') {
      limpio.opciones = c.opciones;
    } else if (c.tipo === 'archivo') {
      // El valor de un campo archivo es { archivo, nombreOriginal } una vez
      // subido de verdad (ver /api/archivos). Si no hay nada subido, o es
      // un dato antiguo (solo el nombre, sin archivo real), se guarda vacio.
      if (c.valor && typeof c.valor === 'object' && typeof c.valor.archivo === 'string' && c.valor.archivo) {
        limpio.valor = {
          archivo: c.valor.archivo,
          nombreOriginal:
            typeof c.valor.nombreOriginal === 'string' && c.valor.nombreOriginal ? c.valor.nombreOriginal : c.valor.archivo,
        };
      } else {
        limpio.valor = '';
      }
    } else {
      limpio.valor = typeof c.valor === 'string' ? c.valor : '';
    }
    return limpio;
  });
}

module.exports = { validarCampos };
