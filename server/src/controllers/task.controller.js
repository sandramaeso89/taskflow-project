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

function eliminarTarea(req, res) {
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
    // Error controlado cuando el id no existe.
    if (error.message === "NOT_FOUND") {
      return res.status(404).json({ error: "Tarea no encontrada." });
    }

    // Cualquier otro error se considera interno del servidor.
    return res.status(500).json({ error: "Error interno del servidor." });
  }
}

module.exports = {
  obtenerTodas,
  crearTarea,
  eliminarTarea,
};
