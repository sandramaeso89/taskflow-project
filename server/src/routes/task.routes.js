const express = require("express");
const taskController = require("../controllers/task.controller");

const router = express.Router();

// GET /api/v1/tasks -> lista todas las tareas.
router.get("/", taskController.obtenerTodas);
// POST /api/v1/tasks -> crea una nueva tarea.
router.post("/", taskController.crearTarea);
// PATCH /api/v1/tasks/:id -> modifica parcialmente una tarea.
router.patch("/:id", taskController.actualizarParcial);
// PUT /api/v1/tasks/:id -> reemplaza toda la tarea.
router.put("/:id", taskController.reemplazarTarea);
// DELETE /api/v1/tasks/:id -> elimina una tarea por id.
router.delete("/:id", taskController.eliminarTarea);
// Endpoint de test para comprobar el middleware global 500.
router.get("/_test/error500", taskController.forzarErrorInterno);

module.exports = router;
