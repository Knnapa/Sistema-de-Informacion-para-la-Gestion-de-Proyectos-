// Envuelve un controlador async para que sus errores lleguen al middleware
// de manejo de errores de Express en vez de quedar como promesas sin capturar.
function asyncHandler(fn) {
  return (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
}

module.exports = asyncHandler;
