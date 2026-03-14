// ============================================================
// APP.JS — Lógica principal de TaskFlow
// ============================================================

// ── 1. Referencias al DOM y constantes ──

const STORAGE_KEY_TAREAS = "taskflow-tareas";
const CLASE_TASK_CARD = "task-card";
const CLASE_DONE = "done";
const DURACION_ANIMACION_ELIMINAR_MS = 300;
const DURACION_RESALTAR_ERROR_MS = 1200;
const DURACION_DEBOUNCE_BUSCADOR_MS = 150;
const btnNuevaTarea      = document.getElementById("btn-nueva-tarea");
const modalOverlay       = document.getElementById("modal-overlay");
const inputTarea         = document.getElementById("input-tarea");
const inputTareaError    = document.getElementById("input-tarea-error");
const formNuevaTarea     = document.getElementById("form-nueva-tarea");
const btnCancelarModal   = document.getElementById("btn-cancelar");
const listaPendientes    = document.getElementById("lista-pendientes");
const listaCompletadas   = document.getElementById("lista-completadas");
const inputBuscar        = document.getElementById("input-buscar");
const contenedorFiltrosEtiquetas = document.getElementById("filtro-etiquetas");
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
const sidebarStatTotal       = document.getElementById("sidebar-stat-total");
const sidebarStatPendientes  = document.getElementById("sidebar-stat-pendientes");
const sidebarStatCompletadas = document.getElementById("sidebar-stat-completadas");
const templateTarea      = document.getElementById("task-template");
const progressFill       = document.getElementById("progress-fill");
const labelProgreso      = document.getElementById("pct-label");

// Estado de la app
let tareas = [];
let filtroActivo = "todas";
let contadorIdTarea = 0;
let etiquetaActiva = null;

// Tareas de ejemplo para primer uso
const TAREAS_DE_EJEMPLO = [
  crearTarea("Configurar entorno de desarrollo #setup #work"),
  crearTarea("Diseñar estructura inicial de componentes #frontend"),
  crearTarea("Anotar ideas rápidas de mejoras #personal #inbox"),
  crearTarea("Revisar tareas completadas esta semana #review"),
];

// ── 1.1 Utilidades genéricas ──

/**
 * Utilidad para crear funciones con retardo (debounce).
 * @param {Function} fn - Función a ejecutar
 * @param {number} delayMs - Milisegundos de espera
 * @returns {Function} - Función con debounce
 */
function crearDebounce(fn, delayMs) {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delayMs);
  };
}

/**
 * Muestra una notificación temporal en la esquina inferior derecha.
 * @param {string} mensaje - Texto a mostrar
 */
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

// ── 2. Utilidades de almacenamiento ──

/**
 * Migra una tarea al formato actual (id, title, completed, createdAt).
 * @param {Object} tarea - Tarea en formato antiguo o nuevo
 * @returns {{id:number,title:string,completed:boolean,createdAt:number}}
 */
function migrarTarea(tarea) {
  return {
    id: tarea.id,
    title: tarea.title ?? tarea.texto ?? "",
    completed: tarea.completed ?? tarea.completada ?? false,
    createdAt: tarea.createdAt ?? Date.now(),
  };
}

/**
 * Carga las tareas persistidas en localStorage.
 * @returns {Array<{id:number,title:string,completed:boolean,createdAt:number}>}
 */
function cargarTareasPersistidas() {
  try {
    const data = localStorage.getItem(STORAGE_KEY_TAREAS);
    if (!data) return [];
    const parsed = JSON.parse(data);
    const arr = Array.isArray(parsed) ? parsed : [];
    return arr.map(migrarTarea);
  } catch {
    // Si algo falla, devolvemos lista vacía para no romper la interfaz.
    return [];
  }
}

/**
 * Guarda el estado actual de tareas en localStorage.
 * @param {Array<{id:number,title:string,completed:boolean,createdAt:number}>} tareasAGuardar
 */
function guardarTareasEnLocalStorage(tareasAGuardar) {
  try {
    localStorage.setItem(STORAGE_KEY_TAREAS, JSON.stringify(tareasAGuardar));
  } catch {
    // Ignoramos errores de cuota o privacidad; la app sigue funcionando sin guardar.
  }
}

// ── 3. Cálculo de métricas y actualización de interfaz ──

/**
 * Calcula estadísticas básicas de las tareas actuales.
 * @returns {{total:number, completadas:number, pendientes:number}}
 */
function obtenerEstadisticasTareas() {
  const total = tareas.length;
  const completadas = tareas.filter((tarea) => tarea.completed).length;
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
  if (sidebarStatTotal) sidebarStatTotal.textContent = String(total);
  if (sidebarStatPendientes) sidebarStatPendientes.textContent = String(pendientes);
  if (sidebarStatCompletadas) sidebarStatCompletadas.textContent = String(completadas);

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
   if (inputTareaError) {
    inputTareaError.textContent = "";
    inputTareaError.style.display = "none";
  }
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
    (tarea) => (tarea.title ?? tarea.texto ?? "").trim().toLowerCase() === textoNormalizado.toLowerCase()
  );
  if (yaExiste) {
    return { esValido: false, mensajeError: "Ya existe una tarea con ese mismo texto.", textoNormalizado };
  }

  return { esValido: true, mensajeError: null, textoNormalizado };
}

/**
 * Valida el texto al editar una tarea (excluye la tarea actual del chequeo de duplicados).
 * @param {string} textoCrudo
 * @param {number} idTareaExcluir - ID de la tarea que se está editando
 * @returns {{esValido:boolean, mensajeError:string|null, textoNormalizado:string}}
 */
function validarTextoEdicion(textoCrudo, idTareaExcluir) {
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
    (tarea) =>
      tarea.id !== idTareaExcluir &&
      (tarea.title ?? tarea.texto ?? "").trim().toLowerCase() === textoNormalizado.toLowerCase()
  );
  if (yaExiste) {
    return { esValido: false, mensajeError: "Ya existe una tarea con ese mismo texto.", textoNormalizado };
  }

  return { esValido: true, mensajeError: null, textoNormalizado };
}

/**
 * Crea una nueva tarea a partir de un texto ya validado.
 * @param {string} titulo - Texto de la tarea
 * @returns {{id:number,title:string,completed:boolean,createdAt:number}}
 */
function crearTarea(titulo) {
  const now = Date.now();
  return {
    id: now + (++contadorIdTarea),
    title: titulo,
    completed: false,
    createdAt: now,
  };
}

/**
 * Maneja el submit del formulario de nueva tarea: valida, crea y actualiza UI.
 */
function manejarSubmitNuevaTarea() {
  if (!inputTarea) return;

  const { esValido, mensajeError, textoNormalizado } = validarTextoNuevaTarea(inputTarea.value);

  if (!esValido) {
    inputTarea.style.borderColor = document.documentElement.classList.contains("dark") ? "#ff6584" : "#6b7280";
    inputTarea.title = mensajeError || "";
    if (inputTareaError) {
      inputTareaError.textContent = mensajeError || "";
      inputTareaError.style.display = "block";
    }
    setTimeout(() => {
      inputTarea.style.borderColor = "";
      inputTarea.title = "";
    }, DURACION_RESALTAR_ERROR_MS);
    return;
  }

  const nuevaTarea = crearTarea(textoNormalizado);
  tareas.push(nuevaTarea);
  guardarTareasEnLocalStorage(tareas);
  renderizarTareaEnLista(nuevaTarea, { resaltar: true });
  actualizarContadores();
  if (inputTareaError) {
    inputTareaError.textContent = "";
    inputTareaError.style.display = "none";
  }
  cerrarModalNuevaTarea();
  mostrarToast("Tarea creada");
}

/**
 * Inicia la edición del título de una tarea (doble clic).
 * Reemplaza el texto por un input; al guardar actualiza la tarea y los hashtags.
 * @param {number} idTarea
 */
function iniciarEdicionTarea(idTarea) {
  const tarea = tareas.find((t) => t.id === idTarea);
  if (!tarea) return;

  const li = document.querySelector(`[data-id="${idTarea}"]`);
  const tituloEl = li?.querySelector(".task-title");
  if (!tituloEl) return;

  const tituloActual = tarea.title ?? tarea.texto ?? "";
  const input = document.createElement("input");
  input.type = "text";
  input.value = tituloActual;
  input.className =
    "w-full bg-transparent border-b-2 border-gray-500 dark:border-purple-500 outline-none text-inherit font-medium text-[0.95rem] py-0.5";
  input.style.minWidth = "80px";

  const guardar = () => {
    const valor = input.value.trim();
    if (valor === tituloActual) {
      cancelar();
      return;
    }

    const { esValido, mensajeError, textoNormalizado } = validarTextoEdicion(valor, idTarea);
    if (!esValido) {
      mostrarToast(mensajeError || "Texto no válido");
      return;
    }

    tarea.title = textoNormalizado;
    guardarTareasEnLocalStorage(tareas);

    const hashtags = extraerHashtags(textoNormalizado);
    li.dataset.hashtags = hashtags.join(" ");
    tituloEl.innerHTML = "";
    tituloEl.textContent = textoNormalizado;

    let tagsEl = li.querySelector(".task-tags");
    if (hashtags.length > 0) {
      if (!tagsEl) {
        tagsEl = document.createElement("div");
        tagsEl.className = "task-tags mt-1 flex flex-wrap gap-1 text-[10px] text-gray-300";
        li.appendChild(tagsEl);
      }
      tagsEl.innerHTML = hashtags
        .map(
          (tag) =>
            `<span class="tag-chip px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 font-medium">#${escapeHTML(tag)}</span>`
        )
        .join("");
    } else if (tagsEl) {
      tagsEl.innerHTML = "";
    }

    actualizarChipsHashtag();
    mostrarToast("Tarea actualizada");
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
    setTimeout(() => elemento.remove(), DURACION_ANIMACION_ELIMINAR_MS);
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

  tarea.completed = !tarea.completed;
  guardarTareasEnLocalStorage(tareas);

  const elemento = document.querySelector(`[data-id="${idTarea}"]`);
  if (elemento) {
    elemento.classList.toggle(CLASE_DONE, tarea.completed);

    if (tarea.completed && listaCompletadas) {
      listaCompletadas.appendChild(elemento);
    } else if (listaPendientes) {
      listaPendientes.appendChild(elemento);
    }
  }

  actualizarContadores();
  actualizarChipsHashtag();
  aplicarFiltrosCombinados();
}

/**
 * Marca todas las tareas como completadas y mueve sus elementos al listado de completadas.
 */
function marcarTodasCompletadas() {
  const pendientes = tareas.filter((t) => !(t.completed ?? t.completada));
  if (pendientes.length === 0) {
    mostrarToast("No hay tareas pendientes");
    return;
  }

  pendientes.forEach((t) => (t.completed = true));
  guardarTareasEnLocalStorage(tareas);

  if (listaPendientes && listaCompletadas) {
    const cards = listaPendientes.querySelectorAll(`.${CLASE_TASK_CARD}`);
    cards.forEach((el) => {
      el.classList.add(CLASE_DONE);
      listaCompletadas.appendChild(el);
    });
  }

  actualizarContadores();
  actualizarChipsHashtag();
  actualizarMensajesVacio();
  aplicarFiltrosCombinados();
  mostrarToast("Todas marcadas como completadas");
}

/**
 * Elimina todas las tareas completadas.
 */
function borrarTodasCompletadas() {
  const completadas = tareas.filter((t) => t.completed ?? t.completada);
  if (completadas.length === 0) {
    mostrarToast("No hay tareas completadas para borrar");
    return;
  }

  const idsBorrar = completadas.map((t) => t.id);
  tareas = tareas.filter((t) => !(t.completed ?? t.completada));
  guardarTareasEnLocalStorage(tareas);

  idsBorrar.forEach((id) => {
    const el = document.querySelector(`[data-id="${id}"]`);
    if (el) {
      el.classList.add("saliendo");
      setTimeout(() => el.remove(), DURACION_ANIMACION_ELIMINAR_MS);
    }
  });

  actualizarContadores();
  actualizarChipsHashtag();
  actualizarMensajesVacio();
  aplicarFiltrosCombinados();
  mostrarToast(`${completadas.length} tarea(s) eliminada(s)`);
}

// ── 6. Renderizado de tareas ──

/**
 * Extrae hashtags (sin el símbolo #) de un texto.
 * @param {string} texto
 * @returns {string[]}
 */
function extraerHashtags(texto) {
  const coincidencias = texto.match(/#([a-zA-Z0-9áéíóúÁÉÍÓÚñÑ_]+)/g);
  if (!coincidencias) return [];
  return coincidencias.map((tag) => tag.slice(1).toLowerCase());
}

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
 * Crea el elemento visual de una tarea usando la plantilla HTML.
 * @param {{id:number,title:string,completed:boolean,createdAt:number}} tarea
 * @param {{resaltar?:boolean}} [opciones]
 * @returns {HTMLLIElement}
 */
function crearElementoTarea(tarea, opciones) {
  if (!templateTarea) {
    return crearElementoTareaFallback(tarea, opciones);
  }

  const titulo = tarea.title ?? tarea.texto ?? "";
  const li = templateTarea.content.cloneNode(true).querySelector("li");
  li.classList.add(CLASE_TASK_CARD);
  if (tarea.completed ?? tarea.completada) {
    li.classList.add(CLASE_DONE);
  }
  li.dataset.id = String(tarea.id);
  const hashtags = extraerHashtags(titulo);
  li.dataset.hashtags = hashtags.join(" ");

  const tituloEl = li.querySelector(".task-title");
  const tagsEl = li.querySelector(".task-tags");
  if (tituloEl) tituloEl.textContent = titulo;
  if (tagsEl && hashtags.length > 0) {
    tagsEl.innerHTML = hashtags
      .map(
        (tag) =>
          `<span class="tag-chip px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 font-medium">#${escapeHTML(tag)}</span>`
      )
      .join("");
  } else if (tagsEl) {
    tagsEl.innerHTML = "";
  }

  const botonCheck = li.querySelector(".task-check");
  const botonEliminar = li.querySelector(".btn-eliminar");
  if (botonCheck) {
    botonCheck.addEventListener("click", () => alternarTareaCompletada(tarea.id));
  }
  if (botonEliminar) {
    botonEliminar.addEventListener("click", () => eliminarTarea(tarea.id));
  }

  if (tituloEl) {
    tituloEl.addEventListener("dblclick", () => iniciarEdicionTarea(tarea.id));
  }

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

/**
 * Crea una tarea sin plantilla si el template no existe (fallback).
 * @param {{id:number,title:string,completed:boolean,createdAt:number}} tarea
 * @param {{resaltar?:boolean}} [opciones]
 * @returns {HTMLLIElement}
 */
function crearElementoTareaFallback(tarea, opciones) {
  const titulo = tarea.title ?? tarea.texto ?? "";
  const li = document.createElement("li");
  li.classList.add(CLASE_TASK_CARD);
  if (tarea.completed ?? tarea.completada) li.classList.add(CLASE_DONE);
  li.dataset.id = String(tarea.id);
  const hashtags = extraerHashtags(titulo);
  li.dataset.hashtags = hashtags.join(" ");
  const chipsHTML =
    hashtags.length > 0
      ? `<div class="task-tags mt-1 flex flex-wrap gap-1 text-[10px] text-gray-300">${hashtags
          .map(
            (tag) =>
              `<span class="tag-chip px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 font-medium">#${escapeHTML(tag)}</span>`
          )
          .join("")}</div>`
      : "";
  li.innerHTML = `<div class="task-row"><div class="task-check" aria-label="Marcar tarea como completada">✓</div><div class="task-title cursor-pointer" title="Doble clic para editar">${escapeHTML(titulo)}</div><button class="btn-eliminar" aria-label="Eliminar tarea">🗑️</button></div>${chipsHTML}`;
  li.querySelector(".task-check")?.addEventListener("click", () => alternarTareaCompletada(tarea.id));
  li.querySelector(".btn-eliminar")?.addEventListener("click", () => eliminarTarea(tarea.id));
  li.querySelector(".task-title")?.addEventListener("dblclick", () => iniciarEdicionTarea(tarea.id));
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

/**
 * Inserta una tarea en la lista correspondiente (pendientes o completadas).
 * @param {{id:number,title:string,completed:boolean,createdAt:number}} tarea
 * @param {{resaltar?:boolean}} [opciones]
 */
function renderizarTareaEnLista(tarea, opciones) {
  const elemento = crearElementoTarea(tarea, opciones);
  const completada = tarea.completed ?? tarea.completada;

  if (completada && listaCompletadas) {
    listaCompletadas.appendChild(elemento);
  } else if (listaPendientes) {
    listaPendientes.appendChild(elemento);
  }

   actualizarChipsHashtag();
}

// ── 7. Buscador y filtros ──

/**
 * Devuelve los términos de búsqueda normalizados a partir del input.
 * @returns {string[]}
 */
function obtenerTerminosBusqueda() {
  if (!inputBuscar) return [];
  return inputBuscar.value
    .toLowerCase()
    .split(/\s+/)
    .filter((termino) => termino.length > 0);
}

/**
 * Aplica los filtros combinados de texto y etiquetas sobre las tareas visibles.
 */
function aplicarFiltrosCombinados() {
  const terminos = obtenerTerminosBusqueda();

  document.querySelectorAll(`.${CLASE_TASK_CARD}`).forEach((item) => {
    const tituloElemento = item.querySelector(".task-title");
    if (!tituloElemento) return;
    const titulo = tituloElemento.textContent.toLowerCase();
    const hashtagsArray = (item.dataset.hashtags || "")
      .toLowerCase()
      .split(" ")
      .filter(Boolean);
    const hashtagsDataset = new Set(hashtagsArray);

    const coincideTextoYHashtags = terminos.every((termino) => {
      if (termino.startsWith("#")) {
        const etiquetaBuscada = termino.slice(1);
        return hashtagsDataset.has(etiquetaBuscada);
      }
      return titulo.includes(termino);
    });

    const coincideEtiquetaActiva =
      !etiquetaActiva || hashtagsDataset.has(etiquetaActiva);

    const debeMostrarse = coincideTextoYHashtags && coincideEtiquetaActiva;
    item.style.display = debeMostrarse ? "" : "none";
  });
}

/**
 * Aplica el filtro de búsqueda por texto de forma retardada.
 */
function filtrarTareasPorTexto() {
  aplicarFiltrosCombinados();
}

const filtrarTareasPorTextoDebounced = crearDebounce(
  filtrarTareasPorTexto,
  DURACION_DEBOUNCE_BUSCADOR_MS
);

/**
 * Construye o actualiza los chips de hashtags disponibles según las tareas actuales.
 */
function actualizarChipsHashtag() {
  if (!contenedorFiltrosEtiquetas) return;

  const setHashtags = new Set();
  tareas.forEach((tarea) => {
    const titulo = tarea.title ?? tarea.texto ?? "";
    extraerHashtags(titulo).forEach((tag) => setHashtags.add(tag));
  });

  contenedorFiltrosEtiquetas.innerHTML = "";

  if (setHashtags.size === 0) {
    etiquetaActiva = null;
    return;
  }

  const botonTodas = document.createElement("button");
  botonTodas.textContent = "Todas";
  botonTodas.className =
    "px-3 py-1 rounded-full text-xs border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:border-gray-400 dark:hover:border-gray-400 transition";
  if (!etiquetaActiva) {
    botonTodas.classList.add("bg-gray-100", "text-gray-800", "border-gray-300", "dark:bg-gray-800", "dark:text-gray-200", "dark:border-transparent");
  }
  botonTodas.addEventListener("click", () => {
    etiquetaActiva = null;
    actualizarChipsHashtag();
    aplicarFiltrosCombinados();
  });
  contenedorFiltrosEtiquetas.appendChild(botonTodas);

  setHashtags.forEach((tag) => {
    const boton = document.createElement("button");
    boton.textContent = `#${tag}`;
    boton.dataset.tag = tag;
    boton.className =
      "px-3 py-1 rounded-full text-xs border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:border-gray-400 dark:hover:border-gray-400 transition";
    if (etiquetaActiva === tag) {
      boton.classList.add("bg-gray-500", "text-white", "border-gray-400", "dark:bg-purple-700", "dark:border-purple-400");
    }
    boton.addEventListener("click", () => {
      etiquetaActiva = etiquetaActiva === tag ? null : tag;
      actualizarChipsHashtag();
      aplicarFiltrosCombinados();
    });
    contenedorFiltrosEtiquetas.appendChild(boton);
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
    tab.classList.toggle("tab-active", esActivo);
    tab.classList.toggle("text-white", esActivo);
  });

  if (sectionPendientes && sectionCompletadas) {
    sectionPendientes.style.display = nuevoFiltro === "completadas" ? "none" : "";
    sectionCompletadas.style.display = nuevoFiltro === "pendientes" ? "none" : "";
  }
}

/**
 * Verifica que los elementos críticos del DOM existan.
 * Si faltan, registra un error y evita seguir con la inicialización.
 * @returns {boolean}
 */
function validarDOMRequerido() {
  const elementosObligatorios = [
    listaPendientes,
    listaCompletadas,
    modalOverlay,
    inputTarea,
  ];

  const faltan = elementosObligatorios.some((el) => !el);
  if (faltan) {
    console.error("[TaskFlow] Faltan elementos críticos en el DOM. La aplicación no puede inicializarse correctamente.");
    return false;
  }

  return true;
}

// ── 8. Preferencias de tema ──

/**
 * Alterna el modo oscuro / claro y actualiza el icono del botón.
 * Además cambia clases de fondo/texto del body para que el cambio sea visible
 * incluso sin depender de variantes `dark:` de Tailwind.
 */
function alternarTema() {
  if (!btnTema) return;

  document.documentElement.classList.toggle("dark");
  const esOscuro = document.documentElement.classList.contains("dark");
  btnTema.textContent = esOscuro ? "🌙" : "☀️";

  try { localStorage.setItem("taskflow-tema", esOscuro ? "dark" : "light"); } catch (_) {}
}

function sincronizarIconoTema() {
  if (!btnTema) return;
  btnTema.textContent = document.documentElement.classList.contains("dark") ? "\u{1F319}" : "\u2600\uFE0F";
}

// ── 9. Inicialización de la aplicación ──

/**
 * Inicializa los manejadores de eventos de la interfaz.
 */
function inicializarEventos() {
  if (btnNuevaTarea) {
    btnNuevaTarea.addEventListener("click", abrirModalNuevaTarea);
  }

  if (formNuevaTarea) {
    formNuevaTarea.addEventListener("submit", (e) => {
      e.preventDefault();
      manejarSubmitNuevaTarea();
    });
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

  document.addEventListener("keydown", (evento) => {
    const esEscrituraTexto =
      evento.target instanceof HTMLInputElement ||
      evento.target instanceof HTMLTextAreaElement ||
      evento.target instanceof HTMLButtonElement ||
      evento.target.isContentEditable;

    if (evento.key === "Escape") {
      cerrarModalNuevaTarea();
    }

    if (!esEscrituraTexto && (evento.key === "n" || evento.key === "N")) {
      evento.preventDefault();
      abrirModalNuevaTarea();
    }

    if (!esEscrituraTexto && (evento.key === "f" || evento.key === "F") && (evento.ctrlKey || evento.metaKey)) {
      if (inputBuscar) {
        evento.preventDefault();
        inputBuscar.focus();
      }
    }
  });

  if (inputBuscar) {
    inputBuscar.addEventListener("input", filtrarTareasPorTextoDebounced);
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

  const btnMarcarTodas = document.getElementById("btn-marcar-todas");
  const btnBorrarCompletadas = document.getElementById("btn-borrar-completadas");
  if (btnMarcarTodas) btnMarcarTodas.addEventListener("click", marcarTodasCompletadas);
  if (btnBorrarCompletadas) btnBorrarCompletadas.addEventListener("click", borrarTodasCompletadas);
}

/**
 * Punto de entrada principal: carga datos, pinta tareas y deja la UI lista.
 */
function inicializarTaskFlow() {
  if (!validarDOMRequerido()) return;
  sincronizarIconoTema();
  tareas = cargarTareasPersistidas();
  if (tareas.length === 0) {
    tareas = [...TAREAS_DE_EJEMPLO];
    guardarTareasEnLocalStorage(tareas);
  }
  tareas.forEach((tarea) => renderizarTareaEnLista(tarea));
  actualizarContadores();
  aplicarFiltroDeEstado("todas");
}

// Inicio: primero eventos, después carga y renderizado
inicializarEventos();
inicializarTaskFlow();

