const express = require("express");
const taskController = require("../controllers/task.controller");

const router = express.Router();

// GET /api/v1/tasks -> lista todas las tareas.
router.get("/", taskController.obtenerTodas);
// POST /api/v1/tasks -> crea una nueva tarea.
router.post("/", taskController.crearTarea);
// DELETE /api/v1/tasks/:id -> elimina una tarea por id.
router.delete("/:id", taskController.eliminarTarea);

module.exports = router;
