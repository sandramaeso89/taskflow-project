function errorHandler(err, req, res, next) {
  // Si el servicio avisa que no existe el recurso, devolvemos 404.
  if (err && err.message === "NOT_FOUND") {
    return res.status(404).json({ error: "Recurso no encontrado." });
  }

  // Para cualquier error no controlado, registramos traza interna y respondemos genérico.
  console.error(err);
  return res.status(500).json({ error: "Error interno del servidor." });
}

module.exports = {
  errorHandler,
};
