// "Base de datos" temporal en memoria.
let tasks = [];
let nextId = 1;

function obtenerTodas() {
  // Devuelve todas las tareas tal como están guardadas.
  return tasks;
}

function crearTarea(data) {
  // Construimos una tarea normalizada con id, estado inicial y fecha de creación.
  const nuevaTarea = {
    id: String(nextId++),
    titulo: data.titulo.trim(),
    completada: false,
    createdAt: new Date().toISOString(),
  };

  // Persistimos en memoria y devolvemos el objeto creado.
  tasks.push(nuevaTarea);
  return nuevaTarea;
}

function eliminarTarea(id) {
  // Buscamos la tarea por id para saber exactamente qué posición borrar.
  const index = tasks.findIndex((task) => task.id === String(id));

  if (index === -1) {
    // El controlador interpreta este error y responde 404.
    throw new Error("NOT_FOUND");
  }

  // Borrado real de la tarea del array en memoria.
  tasks.splice(index, 1);
}

module.exports = {
  obtenerTodas,
  crearTarea,
  eliminarTarea,
};
