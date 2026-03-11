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
const btnAgregarTarea    = document.getElementById("btn-anadir");
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
const countTodas         = document.getElementById("count-todas");
const countCompletadas   = document.getElementById("count-completadas");
const progressFill       = document.getElementById("progress-fill");
const labelProgreso      = document.getElementById("pct-label");

// Estado de la app
let tareas = [];
let filtroActivo = "todas";
let contadorIdTarea = 0;
let etiquetaActiva = null;

// ── 1.1 Utilidades genéricas ──

/**
 * Pequeño helper para crear funciones con "debounce".
 * @param {Function} fn
 * @param {number} delayMs
 * @returns {Function}
 */
function crearDebounce(fn, delayMs) {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delayMs);
  };
}

// ── 2. Utilidades de almacenamiento ──

/**
 * Carga las tareas persistidas en localStorage.
 * @returns {Array<{id:number,texto:string,completada:boolean}>}
 */
function cargarTareasPersistidas() {
  try {
    const data = localStorage.getItem(STORAGE_KEY_TAREAS);
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
    localStorage.setItem(STORAGE_KEY_TAREAS, JSON.stringify(tareasAGuardar));
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
    id: Date.now() + (++contadorIdTarea),
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
    }, DURACION_RESALTAR_ERROR_MS);
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

  tarea.completada = !tarea.completada;
  guardarTareasEnLocalStorage(tareas);

  const elemento = document.querySelector(`[data-id="${idTarea}"]`);
  if (elemento) {
    elemento.classList.toggle(CLASE_DONE, tarea.completada);

    if (tarea.completada && listaCompletadas) {
      listaCompletadas.appendChild(elemento);
    } else if (listaPendientes) {
      listaPendientes.appendChild(elemento);
    }
  }

  actualizarContadores();
  actualizarChipsHashtag();
  aplicarFiltrosCombinados();
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
 * Crea el elemento `<li>` visual que representa una tarea.
 * @param {{id:number,texto:string,completada:boolean}} tarea
 * @returns {HTMLLIElement}
 */
function crearElementoTarea(tarea) {
  const li = document.createElement("li");
  li.classList.add(CLASE_TASK_CARD);
  if (tarea.completada) {
    li.classList.add(CLASE_DONE);
  }
  li.dataset.id = String(tarea.id);
  const hashtags = extraerHashtags(tarea.texto);
  li.dataset.hashtags = hashtags.join(" ");

  const chipsHTML =
    hashtags.length > 0
      ? `<div class="mt-1 flex flex-wrap gap-1 text-[10px] text-gray-500">
          ${hashtags
            .map(
              (tag) =>
                `<span class="px-2 py-0.5 rounded-full bg-gray-800 border border-gray-700">#${escapeHTML(
                  tag
                )}</span>`
            )
            .join("")}
        </div>`
      : "";

  li.innerHTML = `
    <div class="task-row">
      <div class="task-check" aria-label="Marcar tarea como completada">✓</div>
      <div class="task-title">${escapeHTML(tarea.texto)}</div>
      <button class="btn-eliminar" aria-label="Eliminar tarea">🗑️</button>
    </div>
    ${chipsHTML}
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
    extraerHashtags(tarea.texto).forEach((tag) => setHashtags.add(tag));
  });

  contenedorFiltrosEtiquetas.innerHTML = "";

  if (setHashtags.size === 0) {
    etiquetaActiva = null;
    return;
  }

  const botonTodas = document.createElement("button");
  botonTodas.textContent = "Todas";
  botonTodas.className =
    "px-3 py-1 rounded-full text-xs border border-gray-700 text-gray-400 hover:text-gray-200 hover:border-gray-400 transition";
  if (!etiquetaActiva) {
    botonTodas.classList.add("bg-gray-800", "text-gray-200");
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
      "px-3 py-1 rounded-full text-xs border border-gray-700 text-gray-400 hover:text-gray-200 hover:border-gray-400 transition";
    if (etiquetaActiva === tag) {
      boton.classList.add("bg-purple-700", "text-white", "border-purple-400");
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
    tab.classList.toggle("bg-purple-700", esActivo);
    tab.classList.toggle("text-white", esActivo);
    tab.classList.toggle("text-gray-400", !esActivo);
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

  const { body } = document;
  if (!body) return;

  // Tema oscuro (por defecto)
  if (esOscuro) {
    body.classList.add("bg-gray-950", "text-gray-300");
    body.classList.remove("bg-white", "text-gray-900");
  } else {
    // Tema claro
    body.classList.remove("bg-gray-950", "text-gray-300");
    body.classList.add("bg-white", "text-gray-900");
  }
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
}

/**
 * Punto de entrada principal: carga datos, pinta tareas y deja la UI lista.
 */
function inicializarTaskFlow() {
  if (!validarDOMRequerido()) return;
  tareas = cargarTareasPersistidas();
  tareas.forEach((tarea) => renderizarTareaEnLista(tarea));
  actualizarContadores();
  aplicarFiltroDeEstado("todas");
}

// Arranque de la aplicación
inicializarTaskFlow();
inicializarEventos();

