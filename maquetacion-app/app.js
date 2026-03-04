// 1. "Las manos de JS": Buscamos los elementos en el HTML para poder tocarlos
const btnNuevaTarea    = document.querySelector('.btn-new');
const contenedorTareas = document.querySelector('.tasks-section');

// 2. Creamos un input y un botón en el header para reemplazar el prompt()
// (el prompt() está bloqueado en navegadores modernos, así que lo hacemos "a mano")
const header = document.querySelector('.header-actions');

const inputTarea = document.createElement('input');
inputTarea.type        = 'text';
inputTarea.placeholder = '¿Qué quieres hacer?';
inputTarea.style.cssText = `
  display: none;
  background: rgba(255,255,255,0.06);
  border: 1px solid #2e3354;
  border-radius: 8px;
  padding: .45rem 1rem;
  color: #fff;
  font-family: inherit;
  font-size: .9rem;
  outline: none;
  width: 220px;
`;

const btnConfirmar = document.createElement('button');
btnConfirmar.textContent = 'Añadir';
btnConfirmar.style.cssText = `
  display: none;
  background: #612163;
  border: none;
  border-radius: 8px;
  padding: .45rem 1rem;
  color: #fff;
  font-family: inherit;
  cursor: pointer;
`;

// Insertamos el input y el botón antes del avatar
const avatar = header.querySelector('.avatar');
header.insertBefore(btnConfirmar, avatar);
header.insertBefore(inputTarea, btnConfirmar);

// 3. "El baúl de los recuerdos": Aquí guardaremos la lista de tareas
let misTareas = [];

// 4. Función para cargar las tareas guardadas (¡Para que no se olviden!)
function cargarDeLaMemoria() {
  const datosGuardados = localStorage.getItem('misTareasDeTaskFlow');
  if (datosGuardados) {
    // Convertimos el texto de la memoria en una lista de verdad
    misTareas = JSON.parse(datosGuardados);
    // Dibujamos cada tarea en la pantalla
    misTareas.forEach(tarea => dibujarTareaEnPantalla(tarea));
  }
}

// 5. Función para guardar en la memoria (Como escribir en un diario)
function guardarEnLaMemoria() {
  // Guardamos la lista convirtiéndola en un texto largo
  localStorage.setItem('misTareasDeTaskFlow', JSON.stringify(misTareas));
}

// 6. Función para "dibujar" la tarea en el HTML
function dibujarTareaEnPantalla(textoTarea) {
  // Creamos una caja nueva para la tarea
  const nuevaCaja = document.createElement('div');
  nuevaCaja.classList.add('task-card');

  // Le metemos el dibujito y el texto dentro
  nuevaCaja.innerHTML = `
    <div class="task-row">
      <div class="task-check">✓</div>
      <div class="task-title">${textoTarea}</div>
      <button class="btn-borrar">🗑️ Borrar</button>
    </div>
  `;

  // Programamos el botón de borrar de esta tarea específica
  nuevaCaja.querySelector('.btn-borrar').addEventListener('click', () => {
    nuevaCaja.remove(); // Borra el dibujo de la pantalla
    // Quitamos la tarea de nuestra lista "mental"
    misTareas = misTareas.filter(t => t !== textoTarea);
    guardarEnLaMemoria(); // Le decimos a la memoria que ya no está
  });

  // Añadimos la nueva caja a la lista de tareas pendientes
  contenedorTareas.appendChild(nuevaCaja);
}

// 7. Función para añadir la tarea (antes era el prompt, ahora usa el input)
function anadirTarea() {
  const texto = inputTarea.value.trim();
  if (texto) {
    misTareas.push(texto);        // La guardamos en nuestra lista
    dibujarTareaEnPantalla(texto); // La pintamos en la web
    guardarEnLaMemoria();          // La guardamos en el navegador para siempre
    inputTarea.value = '';         // Limpiamos el input
    // Ocultamos el input y el botón después de añadir
    inputTarea.style.display    = 'none';
    btnConfirmar.style.display  = 'none';
  }
}

// 8. El botón de "Nueva Tarea" ahora muestra/oculta el input (en vez de prompt)
btnNuevaTarea.addEventListener('click', () => {
  const visible = inputTarea.style.display === 'block';
  inputTarea.style.display   = visible ? 'none'         : 'block';
  btnConfirmar.style.display = visible ? 'none'         : 'inline-block';
  if (!visible) inputTarea.focus();
});

// Botón "Añadir" → añade la tarea
btnConfirmar.addEventListener('click', anadirTarea);

// Enter en el input → también añade
inputTarea.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') anadirTarea();
});

// Al empezar, cargamos lo que ya teníamos guardado
cargarDeLaMemoria();