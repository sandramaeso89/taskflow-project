// ============================================================
// APP.JS — El cerebro de TaskFlow
// ============================================================

// ── 1. Agarramos los elementos del HTML ──
const btnNuevaTarea    = document.getElementById("btn-nueva-tarea");  // Botón "+ Nueva tarea" del header
const modalOverlay     = document.getElementById("modal-overlay");    // El fondo oscuro del modal
const inputTarea       = document.getElementById("input-tarea");      // El input dentro del modal
const btnAnadir        = document.getElementById("btn-anadir");       // Botón "Añadir tarea"
const btnCancelar      = document.getElementById("btn-cancelar");     // Botón "Cancelar"
const listaPendientes  = document.getElementById("lista-pendientes"); // <ul> tareas pendientes
const listaCompletadas = document.getElementById("lista-completadas");// <ul> tareas completadas
const inputBuscar      = document.getElementById("input-buscar");     // Buscador (Bonus)

// Contadores
const statTotal        = document.getElementById("stat-total");
const statCompletadas  = document.getElementById("stat-completadas");
const badgePendientes  = document.getElementById("badge-pendientes");
const badgeCompletadas = document.getElementById("badge-completadas");
const countTodas       = document.getElementById("count-todas");
const countCompletadas = document.getElementById("count-completadas");


// ── 2. Cargamos las tareas guardadas (o lista vacía) ──
let tareas = JSON.parse(localStorage.getItem("taskflow-tareas")) || [];


// ── 3. Guardar en LocalStorage ──
function guardarEnLocalStorage() {
  localStorage.setItem("taskflow-tareas", JSON.stringify(tareas));
}


// ── 4. Actualizar todos los contadores de la UI ──
function actualizarContadores() {
  const total       = tareas.length;
  const completadas = tareas.filter(t => t.completada).length;
  const pendientes  = total - completadas;

  if (statTotal)        statTotal.textContent        = total;
  if (statCompletadas)  statCompletadas.textContent  = completadas;
  if (badgePendientes)  badgePendientes.textContent  = pendientes;
  if (badgeCompletadas) badgeCompletadas.textContent = completadas;
  if (countTodas)       countTodas.textContent       = total;
  if (countCompletadas) countCompletadas.textContent = completadas;
}


// ── 5. Abrir y cerrar el modal ──
// El modal se muestra/oculta añadiendo o quitando la clase "hidden"

function abrirModal() {
  modalOverlay.classList.remove("hidden");
  inputTarea.value = "";
  inputTarea.focus();
}

function cerrarModal() {
  modalOverlay.classList.add("hidden");
}


// ── 6. Añadir tarea ──
function anadirTarea() {
  const texto = inputTarea.value.trim();

  // Si está vacío, ponemos borde rojo y salimos
  if (texto === "") {
    inputTarea.style.borderColor = "#ff6584";
    setTimeout(() => inputTarea.style.borderColor = "", 1000);
    return;
  }

  // Creamos el objeto tarea con id único
  const nuevaTarea = {
    id: Date.now(),
    texto: texto,a
    completada: false
  };

  tareas.push(nuevaTarea);
  guardarEnLocalStorage();
  renderizarTarea(nuevaTarea);
  actualizarContadores();
  cerrarModal();
}


// ── 7. Eliminar tarea ──
function eliminarTarea(id) {
  tareas = tareas.filter(t => t.id !== id);
  guardarEnLocalStorage();

  const el = document.querySelector(`[data-id="${id}"]`);
  if (el) {
    el.classList.add("saliendo");
    setTimeout(() => el.remove(), 300);
  }

  actualizarContadores();
}


// ── 8. Marcar/desmarcar como completada ──
function toggleCompletada(id) {
  const tarea = tareas.find(t => t.id === id);
  if (!tarea) return;

  tarea.completada = !tarea.completada;
  guardarEnLocalStorage();

  // Borramos y redibujamos para que se mueva a la lista correcta
  const el = document.querySelector(`[data-id="${id}"]`);
  if (el) el.remove();

  renderizarTarea(tarea);
  actualizarContadores();
}


// ── 9. Dibujar una tarea en pantalla ──
function renderizarTarea(tarea) {
  const li = document.createElement("li");
  li.classList.add("task-card");
  if (tarea.completada) li.classList.add("done");
  li.setAttribute("data-id", tarea.id);

  li.innerHTML = `
    <div class="task-row">
      <div class="task-check">✓</div>
      <div class="task-title">${escapeHTML(tarea.texto)}</div>
      <button class="btn-eliminar" aria-label="Eliminar">🗑️</button>
    </div>
  `;

  // Click en ✓ → completar
  li.querySelector(".task-check").addEventListener("click", () => toggleCompletada(tarea.id));

  // Click en 🗑️ → eliminar
  li.querySelector(".btn-eliminar").addEventListener("click", () => eliminarTarea(tarea.id));

  // Va a la lista correcta según su estado
  if (tarea.completada) {
    listaCompletadas.appendChild(li);
  } else {
    listaPendientes.appendChild(li);
  }
}


// ── 10. Filtrar tareas (Bonus) ──
function filtrarTareas() {
  const termino = inputBuscar.value.trim().toLowerCase();
  document.querySelectorAll(".task-card").forEach(item => {
    const titulo = item.querySelector(".task-title").textContent.toLowerCase();
    item.style.display = titulo.includes(termino) ? "" : "none";
  });
}


// ── 11. Seguridad: evitar XSS ──
function escapeHTML(texto) {
  const div = document.createElement("div");
  div.appendChild(document.createTextNode(texto));
  return div.innerHTML;
}


// ── 12. Arranque: cargar tareas guardadas ──
tareas.forEach(tarea => renderizarTarea(tarea));
actualizarContadores();


// ── 13. Eventos ──
btnNuevaTarea.addEventListener("click", abrirModal);
btnAnadir.addEventListener("click", anadirTarea);
btnCancelar.addEventListener("click", cerrarModal);

// Click fuera del modal → cerrar
modalOverlay.addEventListener("click", (e) => {
  if (e.target === modalOverlay) cerrarModal();
});

// Enter → añadir, Escape → cerrar
inputTarea.addEventListener("keydown", (e) => {
  if (e.key === "Enter") anadirTarea();
});
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") cerrarModal();
});

// Buscador en tiempo real
if (inputBuscar) {
  inputBuscar.addEventListener("input", filtrarTareas);
}