// "Base de datos" temporal en memoria.
// Dejamos unas tareas iniciales para que la UI no arranque vacia.
let tasks = [
  {
    id: "1",
    titulo: "Revisar correo y priorizar pendientes #trabajo",
    completada: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: "2",
    titulo: "Preparar la practica de Node.js #estudio",
    completada: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: "3",
    titulo: "Actualizar README del proyecto #docs",
    completada: true,
    createdAt: new Date().toISOString(),
  },
];
let nextId = tasks.length + 1;

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

function actualizarParcial(id, data) {
  const task = tasks.find((item) => item.id === String(id));
  if (!task) {
    throw new Error("NOT_FOUND");
  }

  if (typeof data.completada === "boolean") {
    task.completada = data.completada;
  }
  if (typeof data.titulo === "string") {
    task.titulo = data.titulo.trim();
  }

  return task;
}

function reemplazarTarea(id, data) {
  const index = tasks.findIndex((item) => item.id === String(id));
  if (index === -1) {
    throw new Error("NOT_FOUND");
  }

  const actual = tasks[index];
  const reemplazo = {
    id: actual.id,
    titulo: data.titulo.trim(),
    completada: Boolean(data.completada),
    createdAt: actual.createdAt,
  };
  tasks[index] = reemplazo;
  return reemplazo;
}

module.exports = {
  obtenerTodas,
  crearTarea,
  eliminarTarea,
  actualizarParcial,
  reemplazarTarea,
};
