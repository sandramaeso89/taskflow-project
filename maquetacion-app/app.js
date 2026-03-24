// ============================================================
// APP.JS — Frontend conectado al backend (Fase D)
// ============================================================

const CLASE_TASK_CARD = "task-card";
const CLASE_DONE = "done";
const DURACION_ANIMACION_ELIMINAR_MS = 300;
const DURACION_DEBOUNCE_BUSCADOR_MS = 150;

// Referencias principales del DOM (botones, listas, inputs y bloques de UI).
const btnNuevaTarea = document.getElementById("btn-nueva-tarea");
const modalOverlay = document.getElementById("modal-overlay");
const inputTarea = document.getElementById("input-tarea");
const inputTareaError = document.getElementById("input-tarea-error");
const formNuevaTarea = document.getElementById("form-nueva-tarea");
const btnCancelarModal = document.getElementById("btn-cancelar");
const listaPendientes = document.getElementById("lista-pendientes");
const listaCompletadas = document.getElementById("lista-completadas");
const inputBuscar = document.getElementById("input-buscar");
const contenedorFiltrosEtiquetas = document.getElementById("filtro-etiquetas");
const sectionPendientes = document.getElementById("section-pendientes");
const sectionCompletadas = document.getElementById("section-completadas");
const emptyPendientes = document.getElementById("empty-pendientes");
const emptyCompletadas = document.getElementById("empty-completadas");
const btnTema = document.getElementById("btn-tema");
const tabsFiltro = document.querySelectorAll(".tab");
const networkStatus = document.getElementById("network-status");

const statTotal = document.getElementById("stat-total");
const statPendientesHome = document.getElementById("stat-pendientes");
const statCompletadas = document.getElementById("stat-completadas");
const badgePendientes = document.getElementById("badge-pendientes");
const badgeCompletadas = document.getElementById("badge-completadas");
const sidebarStatTotal = document.getElementById("sidebar-stat-total");
const sidebarStatPendientes = document.getElementById("sidebar-stat-pendientes");
const sidebarStatCompletadas = document.getElementById("sidebar-stat-completadas");
const templateTarea = document.getElementById("task-template");
const progressFill = document.getElementById("progress-fill");
const labelProgreso = document.getElementById("pct-label");

// Estado global de la aplicacion en memoria del frontend.
let tareas = [];
let filtroActivo = "todas";
let etiquetaActiva = null;
let networkStatusTimer = null;
let loadingStartedAt = 0;
const MIN_LOADING_VISIBLE_MS = 400;

// Evita ejecutar una funcion demasiadas veces seguidas (ej: input de busqueda).
function crearDebounce(fn, delayMs) {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delayMs);
  };
}

function mostrarToast(mensaje) {
  const toast = document.getElementById("toast");
  if (!toast) return;
  toast.textContent = mensaje;
  toast.style.opacity = "1";
  toast.style.pointerEvents = "auto";
  setTimeout(() => {
    toast.style.opacity = "0";
    toast.style.pointerEvents = "none";
  }, 1800);
}

// Estado visual de red: carga / éxito / error.
function setNetworkState(tipo, mensaje) {
  if (!networkStatus) return;
  // Si llega un nuevo estado, cancelamos cualquier auto-ocultado anterior.
  if (networkStatusTimer) {
    clearTimeout(networkStatusTimer);
    networkStatusTimer = null;
  }

  networkStatus.textContent = mensaje || "";
  networkStatus.className = "text-[11px] mb-5 -mt-2";

  if (tipo === "loading") {
    // Guardamos cuando empieza la carga para asegurar visibilidad minima.
    loadingStartedAt = Date.now();
    networkStatus.classList.add("text-blue-500");
    return;
  }

  if (tipo === "error") {
    networkStatus.classList.add("text-red-500");
    return;
  }

  if (tipo === "success") {
    // Muestra exito de forma discreta y lo ocultamos para no ensuciar la UI.
    networkStatus.classList.add("text-gray-500");
    networkStatusTimer = setTimeout(() => {
      setNetworkState("idle", "");
    }, 1500);
    return;
  }

  // En idle (o sin mensaje) se oculta completamente.
  networkStatus.classList.add("hidden");
}

// Convierte el formato de tarea de la API al formato que usa la UI.
function normalizarTareaApi(tarea) {
  return {
    id: String(tarea.id),
    title: tarea.titulo ?? "",
    completed: Boolean(tarea.completada),
    createdAt: tarea.createdAt ?? Date.now(),
  };
}

// Garantiza que el usuario llegue a ver el estado "loading".
function cumplirTiempoMinimoDeLoading() {
  // Si la API responde demasiado rapido, mantenemos "loading"
  // unos milisegundos para que el usuario llegue a percibirlo.
  const transcurrido = Date.now() - loadingStartedAt;
  const restante = MIN_LOADING_VISIBLE_MS - transcurrido;
  if (restante > 0) {
    return new Promise((resolve) => setTimeout(resolve, restante));
  }
  return Promise.resolve();
}

// Carga inicial de tareas desde el backend.
async function cargarTareasDesdeApi() {
  setNetworkState("loading", "Cargando tareas desde el servidor...");
  const data = await globalThis.taskApi.getTasks();
  await cumplirTiempoMinimoDeLoading();
  const arr = Array.isArray(data) ? data : [];
  tareas = arr.map(normalizarTareaApi);
  setNetworkState("success", "Tareas sincronizadas con el servidor.");
}

// Calcula valores para los contadores (total, completadas, pendientes).
function obtenerEstadisticasTareas() {
  const total = tareas.length;
  const completadas = tareas.filter((t) => t.completed).length;
  const pendientes = total - completadas;
  return { total, completadas, pendientes };
}

// Refresca todos los contadores y la barra de progreso.
function actualizarContadores() {
  const { total, completadas, pendientes } = obtenerEstadisticasTareas();
  if (statTotal) statTotal.textContent = String(total);
  if (statPendientesHome) statPendientesHome.textContent = String(pendientes);
  if (statCompletadas) statCompletadas.textContent = String(completadas);
  if (badgePendientes) badgePendientes.textContent = String(pendientes);
  if (badgeCompletadas) badgeCompletadas.textContent = String(completadas);
  if (sidebarStatTotal) sidebarStatTotal.textContent = String(total);
  if (sidebarStatPendientes) sidebarStatPendientes.textContent = String(pendientes);
  if (sidebarStatCompletadas) sidebarStatCompletadas.textContent = String(completadas);
  const porcentaje = total > 0 ? Math.round((completadas / total) * 100) : 0;
  if (progressFill) progressFill.style.width = `${porcentaje}%`;
  if (labelProgreso) labelProgreso.textContent = `${porcentaje}%`;
  actualizarMensajesVacio();
}

// Muestra/oculta mensajes de lista vacia segun haya tareas en cada seccion.
function actualizarMensajesVacio() {
  if (listaPendientes && emptyPendientes) {
    emptyPendientes.style.display = listaPendientes.querySelector(".task-card") ? "none" : "";
  }
  if (listaCompletadas && emptyCompletadas) {
    emptyCompletadas.style.display = listaCompletadas.querySelector(".task-card") ? "none" : "";
  }
}

// Abre modal para crear tarea y limpia estado previo del formulario.
function abrirModalNuevaTarea() {
  if (!modalOverlay || !inputTarea) return;
  modalOverlay.classList.remove("hidden");
  inputTarea.value = "";
  if (inputTareaError) {
    inputTareaError.textContent = "";
    inputTareaError.style.display = "none";
  }
  inputTarea.focus();
}

// Cierra modal de nueva tarea.
function cerrarModalNuevaTarea() {
  if (!modalOverlay) return;
  modalOverlay.classList.add("hidden");
}

// Validacion minima del titulo antes de llamar a la API.
function validarTitulo(textoCrudo) {
  const texto = textoCrudo.trim();
  if (texto.length < 3) return { ok: false, msg: "El título debe tener al menos 3 caracteres." };
  return { ok: true, texto };
}

// Flujo completo de crear tarea: validar -> API -> render -> feedback.
async function manejarSubmitNuevaTarea() {
  if (!inputTarea) return;
  const validacion = validarTitulo(inputTarea.value);
  if (!validacion.ok) {
    if (inputTareaError) {
      inputTareaError.textContent = validacion.msg;
      inputTareaError.style.display = "block";
    }
    return;
  }

  try {
    setNetworkState("loading", "Guardando tarea...");
    const creada = await globalThis.taskApi.createTask({ titulo: validacion.texto });
    await cumplirTiempoMinimoDeLoading();
    const tarea = normalizarTareaApi(creada);
    tareas.push(tarea);
    renderizarTareaEnLista(tarea, { resaltar: true });
    actualizarContadores();
    actualizarChipsHashtag();
    cerrarModalNuevaTarea();
    mostrarToast("Tarea creada");
    setNetworkState("success", "Tarea creada y sincronizada.");
  } catch (error) {
    setNetworkState("error", `Error al crear: ${error.message}`);
    mostrarToast("No se pudo crear la tarea");
  }
}

// Cambia el titulo de una tarea con edicion inline.
async function iniciarEdicionTarea(idTarea) {
  const tarea = tareas.find((t) => t.id === String(idTarea));
  if (!tarea) return;
  const li = document.querySelector(`[data-id="${idTarea}"]`);
  const tituloEl = li?.querySelector(".task-title");
  if (!tituloEl) return;

  const tituloActual = tarea.title;
  const input = document.createElement("input");
  input.type = "text";
  input.value = tituloActual;
  input.className = "w-full bg-transparent border-b-2 border-gray-500 dark:border-purple-500 outline-none text-inherit font-medium text-[0.95rem] py-0.5";

  const guardar = async () => {
    const validacion = validarTitulo(input.value);
    if (!validacion.ok) {
      mostrarToast(validacion.msg);
      return;
    }
    if (validacion.texto === tituloActual) {
      cancelar();
      return;
    }
    try {
      setNetworkState("loading", "Actualizando tarea...");
      const actualizada = await globalThis.taskApi.replaceTask(tarea.id, {
        titulo: validacion.texto,
        completada: Boolean(tarea.completed),
      });
      await cumplirTiempoMinimoDeLoading();
      tarea.title = actualizada.titulo;
      tituloEl.textContent = tarea.title;
      li.dataset.hashtags = extraerHashtags(tarea.title).join(" ");
      actualizarChipsHashtag();
      aplicarFiltrosCombinados();
      setNetworkState("success", "Tarea actualizada.");
    } catch (error) {
      setNetworkState("error", `Error al editar: ${error.message}`);
      mostrarToast("No se pudo actualizar");
      cancelar();
    }
  };

  const cancelar = () => {
    tituloEl.innerHTML = "";
    tituloEl.textContent = tituloActual;
    input.remove();
  };

  tituloEl.innerHTML = "";
  tituloEl.appendChild(input);
  input.focus();
  input.select();
  input.addEventListener("blur", guardar);
  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      input.removeEventListener("blur", guardar);
      guardar();
    } else if (e.key === "Escape") {
      e.preventDefault();
      input.removeEventListener("blur", guardar);
      cancelar();
    }
  });
}

// Elimina una tarea tanto en backend como en la UI local.
async function eliminarTarea(idTarea) {
  try {
    setNetworkState("loading", "Eliminando tarea...");
    await globalThis.taskApi.deleteTask(idTarea);
    await cumplirTiempoMinimoDeLoading();
    tareas = tareas.filter((t) => t.id !== String(idTarea));
    const elemento = document.querySelector(`[data-id="${idTarea}"]`);
    if (elemento) {
      elemento.classList.add("saliendo");
      setTimeout(() => elemento.remove(), DURACION_ANIMACION_ELIMINAR_MS);
    }
    actualizarContadores();
    actualizarChipsHashtag();
    setNetworkState("success", "Tarea eliminada.");
  } catch (error) {
    setNetworkState("error", `Error al eliminar: ${error.message}`);
    mostrarToast("No se pudo eliminar");
  }
}

// Cambia estado completada/pendiente de una tarea.
async function alternarTareaCompletada(idTarea) {
  const tarea = tareas.find((t) => t.id === String(idTarea));
  if (!tarea) return;
  const nuevoEstado = !tarea.completed;

  try {
    setNetworkState("loading", "Actualizando estado...");
    const actualizada = await globalThis.taskApi.updateTaskPartial(idTarea, { completada: nuevoEstado });
    await cumplirTiempoMinimoDeLoading();
    tarea.completed = Boolean(actualizada.completada);
    const elemento = document.querySelector(`[data-id="${idTarea}"]`);
    if (elemento) {
      elemento.classList.toggle(CLASE_DONE, tarea.completed);
      if (tarea.completed && listaCompletadas) listaCompletadas.appendChild(elemento);
      else if (listaPendientes) listaPendientes.appendChild(elemento);
    }
    actualizarContadores();
    actualizarChipsHashtag();
    aplicarFiltrosCombinados();
    setNetworkState("success", "Estado actualizado.");
  } catch (error) {
    setNetworkState("error", `Error al cambiar estado: ${error.message}`);
    mostrarToast("No se pudo actualizar el estado");
  }
}

// Marca todas las pendientes como completadas.
async function marcarTodasCompletadas() {
  const pendientes = tareas.filter((t) => !t.completed);
  if (pendientes.length === 0) return mostrarToast("No hay tareas pendientes");
  try {
    setNetworkState("loading", "Marcando tareas...");
    await Promise.all(pendientes.map((t) => globalThis.taskApi.updateTaskPartial(t.id, { completada: true })));
    await cumplirTiempoMinimoDeLoading();
    pendientes.forEach((t) => (t.completed = true));
    if (listaPendientes && listaCompletadas) {
      listaPendientes.querySelectorAll(`.${CLASE_TASK_CARD}`).forEach((el) => {
        el.classList.add(CLASE_DONE);
        listaCompletadas.appendChild(el);
      });
    }
    actualizarContadores();
    aplicarFiltrosCombinados();
    setNetworkState("success", "Todas completadas.");
  } catch (error) {
    setNetworkState("error", `Error al marcar: ${error.message}`);
  }
}

// Elimina todas las tareas completadas en bloque.
async function borrarTodasCompletadas() {
  const completadas = tareas.filter((t) => t.completed);
  if (completadas.length === 0) return mostrarToast("No hay tareas completadas para borrar");
  try {
    setNetworkState("loading", "Borrando completadas...");
    await Promise.all(completadas.map((t) => globalThis.taskApi.deleteTask(t.id)));
    await cumplirTiempoMinimoDeLoading();
    const ids = new Set(completadas.map((t) => t.id));
    tareas = tareas.filter((t) => !ids.has(t.id));
    ids.forEach((id) => {
      const el = document.querySelector(`[data-id="${id}"]`);
      if (el) {
        el.classList.add("saliendo");
        setTimeout(() => el.remove(), DURACION_ANIMACION_ELIMINAR_MS);
      }
    });
    actualizarContadores();
    actualizarChipsHashtag();
    aplicarFiltrosCombinados();
    setNetworkState("success", "Completadas eliminadas.");
  } catch (error) {
    setNetworkState("error", `Error al borrar: ${error.message}`);
  }
}

// Extrae hashtags validos del texto (#algo) para filtros.
function extraerHashtags(texto) {
  const coincidencias = texto.match(/#([a-zA-Z0-9áéíóúÁÉÍÓÚñÑ_]+)/g);
  if (!coincidencias) return [];
  return coincidencias.map((tag) => tag.slice(1).toLowerCase());
}

// Escapa texto antes de inyectarlo en HTML para evitar XSS basico.
function escapeHTML(texto) {
  const div = document.createElement("div");
  div.appendChild(document.createTextNode(texto));
  return div.innerHTML;
}

// Crea un <li> de tarea y conecta sus eventos (check, borrar, editar).
function crearElementoTarea(tarea, opciones) {
  const titulo = tarea.title;
  const li = templateTarea.content.cloneNode(true).querySelector("li");
  li.classList.add(CLASE_TASK_CARD);
  if (tarea.completed) li.classList.add(CLASE_DONE);
  li.dataset.id = String(tarea.id);
  li.dataset.hashtags = extraerHashtags(titulo).join(" ");

  const tituloEl = li.querySelector(".task-title");
  const tagsEl = li.querySelector(".task-tags");
  if (tituloEl) tituloEl.textContent = titulo;
  if (tagsEl) {
    const tags = extraerHashtags(titulo);
    tagsEl.innerHTML = tags
      .map((tag) => `<span class="tag-chip px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 font-medium">#${escapeHTML(tag)}</span>`)
      .join("");
  }

  li.querySelector(".task-check")?.addEventListener("click", () => alternarTareaCompletada(tarea.id));
  li.querySelector(".btn-eliminar")?.addEventListener("click", () => eliminarTarea(tarea.id));
  tituloEl?.addEventListener("dblclick", () => iniciarEdicionTarea(tarea.id));

  if (opciones?.resaltar) {
    li.style.transform = "scale(0.96)";
    li.style.opacity = "0";
    requestAnimationFrame(() => {
      li.style.transition = "transform 0.18s ease-out, opacity 0.18s ease-out";
      li.style.transform = "scale(1)";
      li.style.opacity = "1";
    });
  }
  return li;
}

// Inserta una tarea en la lista visual correspondiente.
function renderizarTareaEnLista(tarea, opciones) {
  const elemento = crearElementoTarea(tarea, opciones);
  if (tarea.completed && listaCompletadas) listaCompletadas.appendChild(elemento);
  else if (listaPendientes) listaPendientes.appendChild(elemento);
}

// Limpia las listas visuales antes de repintar desde estado actual.
function limpiarListasVisuales() {
  listaPendientes.querySelectorAll(`.${CLASE_TASK_CARD}`).forEach((el) => el.remove());
  listaCompletadas.querySelectorAll(`.${CLASE_TASK_CARD}`).forEach((el) => el.remove());
}

// Convierte el buscador en terminos normalizados.
function obtenerTerminosBusqueda() {
  if (!inputBuscar) return [];
  return inputBuscar.value.toLowerCase().split(/\s+/).filter(Boolean);
}

// Aplica filtro por texto + hashtags seleccionados.
function aplicarFiltrosCombinados() {
  const terminos = obtenerTerminosBusqueda();
  document.querySelectorAll(`.${CLASE_TASK_CARD}`).forEach((item) => {
    const titulo = item.querySelector(".task-title")?.textContent.toLowerCase() || "";
    const hashtagsDataset = new Set((item.dataset.hashtags || "").toLowerCase().split(" ").filter(Boolean));
    const coincideTexto = terminos.every((termino) => termino.startsWith("#")
      ? hashtagsDataset.has(termino.slice(1))
      : titulo.includes(termino));
    const coincideTag = !etiquetaActiva || hashtagsDataset.has(etiquetaActiva);
    item.style.display = coincideTexto && coincideTag ? "" : "none";
  });
}

const filtrarTareasPorTextoDebounced = crearDebounce(aplicarFiltrosCombinados, DURACION_DEBOUNCE_BUSCADOR_MS);

// Genera los chips de hashtag de forma dinamica segun tareas cargadas.
function actualizarChipsHashtag() {
  if (!contenedorFiltrosEtiquetas) return;
  const setHashtags = new Set();
  tareas.forEach((t) => extraerHashtags(t.title).forEach((tag) => setHashtags.add(tag)));
  contenedorFiltrosEtiquetas.innerHTML = "";
  if (setHashtags.size === 0) return;

  const botonTodas = document.createElement("button");
  botonTodas.textContent = "Todas";
  botonTodas.className = "px-3 py-1 rounded-full text-xs border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:border-gray-400 dark:hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 dark:focus:ring-purple-500 focus:ring-offset-1 transition";
  if (!etiquetaActiva) botonTodas.classList.add("bg-gray-100", "text-gray-800", "border-gray-300", "dark:bg-gray-800", "dark:text-gray-200", "dark:border-transparent");
  botonTodas.addEventListener("click", () => { etiquetaActiva = null; actualizarChipsHashtag(); aplicarFiltrosCombinados(); });
  contenedorFiltrosEtiquetas.appendChild(botonTodas);

  setHashtags.forEach((tag) => {
    const boton = document.createElement("button");
    boton.textContent = `#${tag}`;
    boton.className = "px-3 py-1 rounded-full text-xs border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:border-gray-400 dark:hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 dark:focus:ring-purple-500 focus:ring-offset-1 transition";
    if (etiquetaActiva === tag) boton.classList.add("bg-gray-500", "text-white", "border-gray-400", "dark:bg-purple-700", "dark:border-purple-400");
    boton.addEventListener("click", () => { etiquetaActiva = etiquetaActiva === tag ? null : tag; actualizarChipsHashtag(); aplicarFiltrosCombinados(); });
    contenedorFiltrosEtiquetas.appendChild(boton);
  });
}

// Muestra pestañas "todas/pendientes/completadas" y secciones asociadas.
function aplicarFiltroDeEstado(nuevoFiltro) {
  filtroActivo = nuevoFiltro;
  tabsFiltro.forEach((tab) => {
    const esActivo = tab.dataset.filter === nuevoFiltro;
    tab.classList.toggle("tab-active", esActivo);
    tab.classList.toggle("text-white", esActivo);
  });
  if (sectionPendientes && sectionCompletadas) {
    sectionPendientes.style.display = nuevoFiltro === "completadas" ? "none" : "";
    sectionCompletadas.style.display = nuevoFiltro === "pendientes" ? "none" : "";
  }
}

// Alterna tema claro/oscuro y lo guarda para proximas visitas.
function alternarTema() {
  if (!btnTema) return;
  document.documentElement.classList.toggle("dark");
  const esOscuro = document.documentElement.classList.contains("dark");
  btnTema.textContent = esOscuro ? "🌙" : "☀️";
  try {
    localStorage.setItem("taskflow-tema", esOscuro ? "dark" : "light");
  } catch (error) {
    console.warn("[TaskFlow] No se pudo guardar preferencia de tema:", error);
  }
}

// Sincroniza icono del boton de tema al arrancar la app.
function sincronizarIconoTema() {
  if (!btnTema) return;
  btnTema.textContent = document.documentElement.classList.contains("dark") ? "\u{1F319}" : "\u2600\uFE0F";
}

// Registra todos los listeners de la interfaz y atajos de teclado.
function inicializarEventos() {
  btnNuevaTarea?.addEventListener("click", abrirModalNuevaTarea);
  formNuevaTarea?.addEventListener("submit", (e) => { e.preventDefault(); manejarSubmitNuevaTarea(); });
  btnCancelarModal?.addEventListener("click", cerrarModalNuevaTarea);
  modalOverlay?.addEventListener("click", (e) => { if (e.target === modalOverlay) cerrarModalNuevaTarea(); });

  document.addEventListener("keydown", (evento) => {
    const esEscrituraTexto = evento.target instanceof HTMLInputElement ||
      evento.target instanceof HTMLTextAreaElement ||
      evento.target instanceof HTMLButtonElement ||
      evento.target.isContentEditable;
    if (evento.key === "Escape") cerrarModalNuevaTarea();
    if (!esEscrituraTexto && (evento.key === "n" || evento.key === "N")) { evento.preventDefault(); abrirModalNuevaTarea(); }
    if (!esEscrituraTexto && (evento.key === "f" || evento.key === "F") && (evento.ctrlKey || evento.metaKey)) {
      if (inputBuscar) { evento.preventDefault(); inputBuscar.focus(); }
    }
  });

  inputBuscar?.addEventListener("input", filtrarTareasPorTextoDebounced);
  btnTema?.addEventListener("click", alternarTema);
  tabsFiltro.forEach((tab) => tab.addEventListener("click", () => tab.dataset.filter && aplicarFiltroDeEstado(tab.dataset.filter)));
  document.getElementById("btn-marcar-todas")?.addEventListener("click", marcarTodasCompletadas);
  document.getElementById("btn-borrar-completadas")?.addEventListener("click", borrarTodasCompletadas);
}

// Punto de arranque de la app: carga datos y renderiza estado inicial.
async function inicializarTaskFlow() {
  sincronizarIconoTema();
  try {
    await cargarTareasDesdeApi();
    limpiarListasVisuales();
    tareas.forEach((t) => renderizarTareaEnLista(t));
    actualizarContadores();
    actualizarChipsHashtag();
    aplicarFiltroDeEstado("todas");
  } catch (error) {
    setNetworkState("error", `No se pudieron cargar tareas: ${error.message}`);
  }
}

// Bootstrapping inicial.
inicializarEventos();
inicializarTaskFlow();

