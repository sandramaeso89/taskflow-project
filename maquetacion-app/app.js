// ============================================================
// APP.JS — Lógica principal de TaskFlow
// ============================================================

// ── 1. Referencias al DOM ──
const btnNuevaTarea      = document.getElementById("btn-nueva-tarea");
const modalOverlay       = document.getElementById("modal-overlay");
const inputTarea         = document.getElementById("input-tarea");
const btnAgregarTarea    = document.getElementById("btn-anadir");
const btnCancelarModal   = document.getElementById("btn-cancelar");
const listaPendientes    = document.getElementById("lista-pendientes");
const listaCompletadas   = document.getElementById("lista-completadas");
const inputBuscar        = document.getElementById("input-buscar");
const sectionPendientes  = document.getElementById("section-pendientes");
const sectionCompletadas = document.getElementById("section-completadas");
const emptyPendientes    = document.getElementById("empty-pendientes");
const emptyCompletadas   = document.getElementById("empty-completadas");
const btnTema            = document.getElementById("btn-tema");
const tabsFiltro         = document.querySelectorAll(".tab");

// Contadores y métricas
const statTotal          = document.getElementById("stat-total");
const statPendientesHome = document.getElementById("stat-pendientes");
const statCompletadas    = document.getElementById("stat-completadas");
const badgePendientes    = document.getElementById("badge-pendientes");
const badgeCompletadas   = document.getElementById("badge-completadas");
const countTodas         = document.getElementById("count-todas");
const countCompletadas   = document.getElementById("count-completadas");
const progressFill       = document.getElementById("progress-fill");
const labelProgreso      = document.getElementById("pct-label");

// Estado de la app
let tareas = [];
let filtroActivo = "todas";

// ── 2. Utilidades de almacenamiento ──

/**
 * Carga las tareas persistidas en localStorage.
 * @returns {Array<{id:number,texto:string,completada:boolean}>}
 */
function cargarTareasPersistidas() {
  try {
    const data = localStorage.getItem("taskflow-tareas");
    if (!data) return [];
    const parsed = JSON.parse(data);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    // Si algo va mal, devolvemos lista vacía para no romper la UI.
    return [];
  }
}

/**
 * Guarda el estado actual de tareas en localStorage.
 * @param {Array<{id:number,texto:string,completada:boolean}>} tareasAGuardar
 */
function guardarTareasEnLocalStorage(tareasAGuardar) {
  try {
    localStorage.setItem("taskflow-tareas", JSON.stringify(tareasAGuardar));
  } catch {
    // Silenciamos errores de cuota / privacidad; la app sigue funcionando sin persistencia.
  }
}

// ── 3. Cálculo de métricas y actualización de UI ──

/**
 * Calcula estadísticas básicas de las tareas actuales.
 * @returns {{total:number, completadas:number, pendientes:number}}
 */
function obtenerEstadisticasTareas() {
  const total = tareas.length;
  const completadas = tareas.filter((tarea) => tarea.completada).length;
  const pendientes = total - completadas;
  return { total, completadas, pendientes };
}

/**
 * Actualiza los contadores numéricos visibles en la interfaz.
 */
function actualizarContadores() {
  const { total, completadas, pendientes } = obtenerEstadisticasTareas();

  if (statTotal) statTotal.textContent = String(total);
  if (statPendientesHome) statPendientesHome.textContent = String(pendientes);
  if (statCompletadas) statCompletadas.textContent = String(completadas);
  if (badgePendientes) badgePendientes.textContent = String(pendientes);
  if (badgeCompletadas) badgeCompletadas.textContent = String(completadas);
  if (countTodas) countTodas.textContent = String(total);
  if (countCompletadas) countCompletadas.textContent = String(completadas);

  actualizarBarraDeProgreso(total, completadas, pendientes);
  actualizarMensajesVacio();
}

/**
 * Actualiza la barra de progreso y el porcentaje en la sidebar.
 * @param {number} total
 * @param {number} completadas
 * @param {number} pendientes
 */
function actualizarBarraDeProgreso(total, completadas, pendientes) {
  const porcentaje = total > 0 ? Math.round((completadas / total) * 100) : 0;

  if (progressFill) {
    progressFill.style.width = `${porcentaje}%`;
  }
  if (labelProgreso) {
    labelProgreso.textContent = `${porcentaje}%`;
  }
  if (statPendientesHome) {
    statPendientesHome.textContent = String(pendientes);
  }
}

/**
 * Muestra u oculta los mensajes de listas vacías según haya tareas en cada lista.
 */
function actualizarMensajesVacio() {
  if (listaPendientes && emptyPendientes) {
    const tienePendientes = listaPendientes.querySelector(".task-card") !== null;
    emptyPendientes.style.display = tienePendientes ? "none" : "";
  }

  if (listaCompletadas && emptyCompletadas) {
    const tieneCompletadas = listaCompletadas.querySelector(".task-card") !== null;
    emptyCompletadas.style.display = tieneCompletadas ? "none" : "";
  }
}

// ── 4. Gestión del modal ──

/**
 * Abre el modal de creación de tarea y prepara el campo de texto.
 */
function abrirModalNuevaTarea() {
  if (!modalOverlay || !inputTarea) return;
  modalOverlay.classList.remove("hidden");
  inputTarea.value = "";
  inputTarea.focus();
}

/**
 * Cierra el modal de creación de tarea.
 */
function cerrarModalNuevaTarea() {
  if (!modalOverlay) return;
  modalOverlay.classList.add("hidden");
}

// ── 5. Creación, validación y modificación de tareas ──

/**
 * Valida el texto introducido para una nueva tarea.
 * @param {string} textoCrudo
 * @returns {{esValido:boolean, mensajeError:string|null, textoNormalizado:string}}
 */
function validarTextoNuevaTarea(textoCrudo) {
  const textoNormalizado = textoCrudo.trim();

  if (textoNormalizado.length === 0) {
    return { esValido: false, mensajeError: "La tarea no puede estar vacía.", textoNormalizado };
  }

  if (textoNormalizado.length < 3) {
    return { esValido: false, mensajeError: "La tarea debe tener al menos 3 caracteres.", textoNormalizado };
  }

  const soloSimbolos = !/[a-zA-Z0-9áéíóúÁÉÍÓÚñÑ]/.test(textoNormalizado);
  if (soloSimbolos) {
    return { esValido: false, mensajeError: "La tarea debe contener algún carácter alfanumérico.", textoNormalizado };
  }

  const yaExiste = tareas.some(
    (tarea) => tarea.texto.trim().toLowerCase() === textoNormalizado.toLowerCase()
  );
  if (yaExiste) {
    return { esValido: false, mensajeError: "Ya existe una tarea con ese mismo texto.", textoNormalizado };
  }

  return { esValido: true, mensajeError: null, textoNormalizado };
}

/**
 * Crea una nueva tarea a partir de un texto ya validado.
 * @param {string} texto
 * @returns {{id:number,texto:string,completada:boolean}}
 */
function crearTarea(texto) {
  return {
    id: Date.now(),
    texto,
    completada: false,
  };
}

/**
 * Maneja el submit del formulario de nueva tarea: valida, crea y actualiza UI.
 */
function manejarSubmitNuevaTarea() {
  if (!inputTarea) return;

  const { esValido, mensajeError, textoNormalizado } = validarTextoNuevaTarea(inputTarea.value);

  if (!esValido) {
    inputTarea.style.borderColor = "#ff6584";
    inputTarea.title = mensajeError || "";
    setTimeout(() => {
      inputTarea.style.borderColor = "";
      inputTarea.title = "";
    }, 1200);
    return;
  }

  const nuevaTarea = crearTarea(textoNormalizado);
  tareas.push(nuevaTarea);
  guardarTareasEnLocalStorage(tareas);
  renderizarTareaEnLista(nuevaTarea);
  actualizarContadores();
  cerrarModalNuevaTarea();
}

/**
 * Elimina una tarea por id y actualiza la interfaz.
 * @param {number} idTarea
 */
function eliminarTarea(idTarea) {
  tareas = tareas.filter((tarea) => tarea.id !== idTarea);
  guardarTareasEnLocalStorage(tareas);

  const elemento = document.querySelector(`[data-id="${idTarea}"]`);
  if (elemento) {
    elemento.classList.add("saliendo");
    setTimeout(() => elemento.remove(), 300);
  }

  actualizarContadores();
}

/**
 * Alterna el estado de completada/pendiente de una tarea.
 * @param {number} idTarea
 */
function alternarTareaCompletada(idTarea) {
  const tarea = tareas.find((item) => item.id === idTarea);
  if (!tarea) return;

  tarea.completada = !tarea.completada;
  guardarTareasEnLocalStorage(tareas);

  const elemento = document.querySelector(`[data-id="${idTarea}"]`);
  if (elemento) {
    elemento.remove();
  }

  renderizarTareaEnLista(tarea);
  actualizarContadores();
}

// ── 6. Renderizado de tareas ──

/**
 * Escapa un texto para evitar inyección de HTML en el DOM.
 * @param {string} texto
 * @returns {string}
 */
function escapeHTML(texto) {
  const div = document.createElement("div");
  div.appendChild(document.createTextNode(texto));
  return div.innerHTML;
}

/**
 * Crea el elemento `<li>` visual que representa una tarea.
 * @param {{id:number,texto:string,completada:boolean}} tarea
 * @returns {HTMLLIElement}
 */
function crearElementoTarea(tarea) {
  const li = document.createElement("li");
  li.classList.add("task-card");
  if (tarea.completada) {
    li.classList.add("done");
  }
  li.dataset.id = String(tarea.id);

  li.innerHTML = `
    <div class="task-row">
      <div class="task-check" aria-label="Marcar tarea como completada">✓</div>
      <div class="task-title">${escapeHTML(tarea.texto)}</div>
      <button class="btn-eliminar" aria-label="Eliminar tarea">🗑️</button>
    </div>
  `;

  const botonCheck = li.querySelector(".task-check");
  const botonEliminar = li.querySelector(".btn-eliminar");

  if (botonCheck) {
    botonCheck.addEventListener("click", () => alternarTareaCompletada(tarea.id));
  }

  if (botonEliminar) {
    botonEliminar.addEventListener("click", () => eliminarTarea(tarea.id));
  }

  return li;
}

/**
 * Inserta una tarea en la lista correspondiente (pendientes o completadas).
 * @param {{id:number,texto:string,completada:boolean}} tarea
 */
function renderizarTareaEnLista(tarea) {
  const elemento = crearElementoTarea(tarea);

  if (tarea.completada && listaCompletadas) {
    listaCompletadas.appendChild(elemento);
  } else if (listaPendientes) {
    listaPendientes.appendChild(elemento);
  }
}

// ── 7. Buscador y filtros ──

/**
 * Aplica el filtro de búsqueda por texto sobre las tareas visibles.
 */
function filtrarTareasPorTexto() {
  if (!inputBuscar) return;
  const termino = inputBuscar.value.trim().toLowerCase();

  document.querySelectorAll(".task-card").forEach((item) => {
    const tituloElemento = item.querySelector(".task-title");
    if (!tituloElemento) return;
    const titulo = tituloElemento.textContent.toLowerCase();
    item.style.display = titulo.includes(termino) ? "" : "none";
  });
}

/**
 * Marca visualmente la pestaña activa y oculta/enseña secciones según filtro.
 * @param {"todas"|"pendientes"|"completadas"} nuevoFiltro
 */
function aplicarFiltroDeEstado(nuevoFiltro) {
  filtroActivo = nuevoFiltro;

  tabsFiltro.forEach((tab) => {
    const esActivo = tab.dataset.filter === nuevoFiltro;
    tab.classList.toggle("bg-purple-700", esActivo);
    tab.classList.toggle("text-white", esActivo);
    tab.classList.toggle("text-gray-400", !esActivo);
  });

  if (sectionPendientes && sectionCompletadas) {
    sectionPendientes.style.display = nuevoFiltro === "completadas" ? "none" : "";
    sectionCompletadas.style.display = nuevoFiltro === "pendientes" ? "none" : "";
  }
}

// ── 8. Preferencias de tema ──

/**
 * Alterna el modo oscuro / claro y actualiza el icono del botón.
 */
function alternarTema() {
  if (!btnTema) return;
  document.documentElement.classList.toggle("dark");
  const esOscuro = document.documentElement.classList.contains("dark");
  btnTema.textContent = esOscuro ? "🌙" : "☀️";
}

// ── 9. Inicialización de la aplicación ──

/**
 * Inicializa los manejadores de eventos de la interfaz.
 */
function inicializarEventos() {
  if (btnNuevaTarea) {
    btnNuevaTarea.addEventListener("click", abrirModalNuevaTarea);
  }

  if (btnAgregarTarea) {
    btnAgregarTarea.addEventListener("click", manejarSubmitNuevaTarea);
  }

  if (btnCancelarModal) {
    btnCancelarModal.addEventListener("click", cerrarModalNuevaTarea);
  }

  if (modalOverlay) {
    modalOverlay.addEventListener("click", (evento) => {
      if (evento.target === modalOverlay) {
        cerrarModalNuevaTarea();
      }
    });
  }

  if (inputTarea) {
    inputTarea.addEventListener("keydown", (evento) => {
      if (evento.key === "Enter") {
        manejarSubmitNuevaTarea();
      }
    });
  }

  document.addEventListener("keydown", (evento) => {
    if (evento.key === "Escape") {
      cerrarModalNuevaTarea();
    }
  });

  if (inputBuscar) {
    inputBuscar.addEventListener("input", filtrarTareasPorTexto);
  }

  if (btnTema) {
    btnTema.addEventListener("click", alternarTema);
  }

  tabsFiltro.forEach((tab) => {
    tab.addEventListener("click", () => {
      const filtro = tab.dataset.filter;
      if (!filtro) return;
      aplicarFiltroDeEstado(filtro);
    });
  });
}

/**
 * Punto de entrada principal: carga datos, pinta tareas y deja la UI lista.
 */
function inicializarTaskFlow() {
  tareas = cargarTareasPersistidas();
  tareas.forEach((tarea) => renderizarTareaEnLista(tarea));
  actualizarContadores();
  aplicarFiltroDeEstado("todas");
}

// Arranque de la aplicación
inicializarTaskFlow();
inicializarEventos();

