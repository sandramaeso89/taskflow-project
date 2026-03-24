const taskService = require("../services/task.service");

function obtenerTodas(req, res) {
  // Pide las tareas al servicio y responde al cliente con HTTP 200.
  const tasks = taskService.obtenerTodas();
  return res.status(200).json(tasks);
}

function crearTarea(req, res) {
  // Leemos lo que envía el cliente en el body.
  const { titulo } = req.body;

  // Validación defensiva mínima para proteger la API.
  if (!titulo || typeof titulo !== "string" || titulo.trim().length < 3) {
    return res
      .status(400)
      .json({ error: "El título es obligatorio y debe tener al menos 3 caracteres." });
  }

  // Si todo es válido, delegamos la creación al servicio.
  const nuevaTarea = taskService.crearTarea({ titulo });
  // 201 = recurso creado correctamente.
  return res.status(201).json(nuevaTarea);
}

function actualizarParcial(req, res, next) {
  const { id } = req.params;
  const { completada, titulo } = req.body;

  if (!id || typeof id !== "string") {
    return res.status(400).json({ error: "El id es obligatorio." });
  }

  if (titulo !== undefined && (typeof titulo !== "string" || titulo.trim().length < 3)) {
    return res
      .status(400)
      .json({ error: "Si envías título, debe ser string y tener al menos 3 caracteres." });
  }

  if (completada !== undefined && typeof completada !== "boolean") {
    return res.status(400).json({ error: "Si envías completada, debe ser boolean." });
  }

  try {
    const tareaActualizada = taskService.actualizarParcial(id, { titulo, completada });
    return res.status(200).json(tareaActualizada);
  } catch (error) {
    return next(error);
  }
}

function reemplazarTarea(req, res, next) {
  const { id } = req.params;
  const { titulo, completada } = req.body;

  if (!id || typeof id !== "string") {
    return res.status(400).json({ error: "El id es obligatorio." });
  }

  if (!titulo || typeof titulo !== "string" || titulo.trim().length < 3) {
    return res.status(400).json({ error: "El título es obligatorio y debe tener al menos 3 caracteres." });
  }

  if (typeof completada !== "boolean") {
    return res.status(400).json({ error: "El campo completada es obligatorio y debe ser boolean." });
  }

  try {
    const tareaReemplazada = taskService.reemplazarTarea(id, { titulo, completada });
    return res.status(200).json(tareaReemplazada);
  } catch (error) {
    return next(error);
  }
}

function eliminarTarea(req, res, next) {
  // El id llega por URL: /api/v1/tasks/:id
  const { id } = req.params;

  // Validación básica del parámetro de ruta.
  if (!id || typeof id !== "string") {
    return res.status(400).json({ error: "El id es obligatorio." });
  }

  try {
    // Intentamos borrar desde la capa de servicio.
    taskService.eliminarTarea(id);
    // 204 = eliminado con éxito, sin contenido de respuesta.
    return res.status(204).send();
  } catch (error) {
    // Delegamos al middleware global para mapear y responder errores.
    return next(error);
  }
}

function forzarErrorInterno(req, res, next) {
  // Endpoint solo para pruebas de Postman/Thunder Client (simula fallo inesperado).
  return next(new Error("INTERNAL_TEST_ERROR"));
}

module.exports = {
  obtenerTodas,
  crearTarea,
  actualizarParcial,
  reemplazarTarea,
  eliminarTarea,
  forzarErrorInterno,
};
