# ✦ TaskFlow

Aplicación web de gestión de tareas con persistencia local, desarrollada como proyecto del módulo DAM con especialización en Ciberseguridad y Python.

🔗 **Demo en vivo:** [taskflow-projectsandra.vercel.app](https://taskflow-projectsandra.vercel.app)

---

## 📸 Vista previa

> _App de tareas con diseño oscuro/claro, buscador avanzado, etiquetas tipo hashtag y estadísticas rápidas._

---

## ✅ Funcionalidades principales

### Gestión de tareas

- **Añadir tareas** mediante un modal con validación (mínimo de caracteres, sin duplicados, sin solo símbolos).
- **Marcar como completadas** y mover automáticamente a la sección correspondiente.
- **Eliminar tareas** con animación de salida.
- **Persistencia** en `localStorage` para que las tareas sobrevivan a los refrescos.
- **Tareas de ejemplo** en el primer arranque para no empezar con la pantalla vacía.

### Búsqueda y filtros

- **Búsqueda en tiempo real** mientras escribes.
- Búsqueda por **múltiples palabras** (todas deben aparecer en la tarea).
- Soporte de **hashtags** dentro del texto de la tarea (ej: `#work`, `#personal`).
- Filtros combinados:
  - Estado: `Todas / Pendientes / Completadas`.
  - Texto + hashtags.
  - Barra de chips de etiquetas clicables (con opción “Todas”).

### UX y feedback

- **Formulario** con `<form>` para crear tareas (submit con Enter o clic), label asociada al campo de descripción.
- Modal con mensajes de error visibles bajo el campo.
- Atajos de teclado:
  - `N` → abrir modal de nueva tarea.
  - `Esc` → cerrar el modal.
  - `Ctrl+F` / `Cmd+F` → enfocar el buscador interno.
- **Toast** de confirmación al crear una tarea.
- Micro-animación cuando una nueva tarea aparece en la lista.
- Mensajes de estado vacíos mejorados, especialmente en “Completadas”.

### Tema y apariencia

- **Modo oscuro** por defecto, con fondo profundo y tarjetas diferenciadas.
- **Modo claro** con contraste suave:
  - Tarjetas de tareas y stats más claras, sin bloques demasiado oscuros.
  - Chips de etiquetas adaptados al tema (fondos y bordes distintos en claro/oscuro).
- Estadísticas en **panel lateral** (Total, Pendientes, Completadas) y en cards en el área principal.

---

## 🗂️ Estructura del proyecto

```text
taskflow-project/
├── maquetacion-app/
│   ├── index.html   # Maquetación principal, plantilla <template>, estilos
│   ├── style.css    # CSS generado por Tailwind
│   └── app.js       # Lógica: tareas, filtros, localStorage, tema, atajos
├── tailwind.config.js
└── README.md
```

---

## 📐 Estructura HTML semántica

- **header** — Encabezado con buscador, toggle de tema y botón de nueva tarea.
- **aside** — Panel lateral con estadísticas (Total, Pendientes, Completadas) y barra de progreso.
- **main** — Contenido principal: filtros, listas de tareas pendientes y completadas.
- **footer** — Pie de página con información del proyecto.
- **form** — Formulario de nueva tarea con label asociada y validación.
- **template** — Plantilla HTML para el renderizado dinámico de cada tarea.

### Accesibilidad y validación

- Etiquetas `label` asociadas correctamente a los inputs.
- Jerarquía de encabezados lógica (un único `h1`, orden h1 → h2 → h3).
- HTML validado con el [validador W3C](https://validator.w3.org/).
- **Navegación por teclado:** toda la app es usable con teclado (Tab, Enter, Espacio, Esc, N, Ctrl+F).
- **Botones con texto o aria-label:** todos los controles tienen texto visible o `aria-label` para lectores de pantalla.
- **Foco visible:** todos los elementos interactivos tienen `focus:ring-2` o `outline` al navegar con Tab.
- **Contraste:** paleta con texto `#111827` sobre fondos `#ffffff`/`#f5f5f5` (ratio > 7:1 en modo claro).

---

## 🧠 Lógica principal (`app.js`)

- Gestión del array `tareas` en memoria (alta, baja, toggle de completado).
- Sincronización con `localStorage` a cada cambio relevante.
- Renderizado de tareas mediante la plantilla `<template>` en dos listas (`Pendientes` / `Completadas`).
- Búsqueda de texto y hashtags con filtros combinados.
- Actualización de estadísticas y barra de progreso.
- Gestión de tema (oscuro/claro) y eventos de teclado globales.

---

## 🛡️ Seguridad

- El texto introducido por el usuario se escapa con una función `escapeHTML()` antes de insertarse en el DOM, reduciendo el riesgo de XSS básicos.
- El acceso a `localStorage` está envuelto en `try/catch` para evitar que errores de cuota rompan la UI.

---

## 🚀 Cómo ejecutarlo en local

```bash
git clone https://github.com/sandramaeso89/taskflow-project
cd taskflow-project/maquetacion-app
```

### Opción 1: Abrir directamente el HTML

Abre `index.html` en tu navegador (doble clic o “Abrir con…”).  
Cada vez que guardes cambios, recarga la pestaña.

### Opción 2: Servidor local con auto-reload (recomendado)

Con Node instalado:

```bash
cd maquetacion-app
npx live-server
```

Esto abrirá una URL tipo `http://127.0.0.1:8080` y recargará la página al guardar archivos.

---

## 📚 Ejemplos de uso

### 1. Crear una tarea con hashtags

1. Haz clic en `+ Nueva tarea` o pulsa `N`.
2. Escribe, por ejemplo:

   ```text
   Configurar entorno de desarrollo #setup #work
   ```

3. Pulsa “Añadir tarea”.

Verás la tarea en la sección **Pendientes** con chips `#setup` y `#work`, y esas etiquetas aparecerán también en la barra de filtros.

### 2. Buscar por texto y etiqueta

1. En el buscador superior, escribe:

   ```text
   entorno #work
   ```

2. La lista mostrará solo las tareas que incluyan la palabra “entorno” y tengan el hashtag `#work`.

### 3. Ver tareas completadas

1. Haz clic en el icono de check de una tarea pendiente.
2. Cambia a la pestaña **Completadas**.
3. Verás la tarea movida allí; si no hay ninguna, se muestra un mensaje explicativo y un mini-CTA.

### 4. Usar atajos de teclado

- `N` → abre el modal de nueva tarea (si no estás escribiendo en un campo de texto).
- `Esc` → cierra el modal abierto.
- `Ctrl+F` / `Cmd+F` → enfoca el buscador interno de tareas.

---

## 🧪 Resultados de pruebas

| Prueba | Resultado | Comportamiento |
|--------|-----------|----------------|
| **Lista vacía** | ✅ | Al no haber tareas, se muestran los mensajes "¡Sin tareas pendientes!" y "Aún no has marcado ninguna tarea como completada" según corresponda. En el primer arranque se cargan tareas de ejemplo. |
| **Añadir tarea sin título** | ✅ | La validación impide enviar el formulario: aparece el mensaje "La tarea no puede estar vacía." y el campo se resalta en rojo durante ~1,2 s. |
| **Título muy largo** | ✅ | El input tiene `maxlength="140"`, por lo que el título queda limitado a 140 caracteres. No se puede escribir más. |
| **Marcar varias como completadas** | ✅ | Se puede marcar una a una con el check o usar "✓ Todas" para marcar todas las pendientes. Las tareas se mueven a la sección Completadas. |
| **Eliminar varias tareas** | ✅ | Se puede eliminar individualmente con el icono 🗑️ o en bloque con "🗑️ Completadas". Hay animación de salida. |
| **Persistencia (recargar)** | ✅ | Las tareas se guardan en `localStorage` en cada cambio. Al recargar la página, los datos se mantienen. |

### Verificación de accesibilidad

| Requisito | Estado | Detalle |
|-----------|--------|---------|
| **Uso con teclado** | ✅ | Tab para navegar, Enter/Espacio para activar. Atajos: N (nueva tarea), Esc (cerrar modal), Ctrl+F (buscar). |
| **aria-label en botones** | ✅ | Botones con solo icono (tema 🌙, eliminar 🗑️, check ✓) tienen `aria-label`. Los dinámicos (etiquetas) también. |
| **Contraste de colores** | ✅ | Modo claro: texto `#111827` sobre `#ffffff` (ratio > 12:1). Texto secundario `#6b7280` sobre blanco (~4.6:1). |
| **Foco visible con Tab** | ✅ | Todos los interactivos tienen `focus:ring-2` o `outline` en `:focus-visible`. El check de tarea usa `outline` personalizado. |

---

## 🔧 Progreso backend (Fase 3)

Estado actual del trabajo para migrar TaskFlow a API con Express:

- ✅ Creado directorio `server/`.
- ✅ Inicializado proyecto Node con `npm init -y`.
- ✅ Instaladas dependencias de producción: `express`, `cors`, `dotenv`.
- ✅ Instalada dependencia de desarrollo: `nodemon`.
- ✅ Generado `server/package.json` con configuración base.

### Próximos pasos inmediatos

- Crear `server/.env` con `PORT=3000`.
- Añadir `.env` a `.gitignore`.
- Crear `server/src/config/env.js` con validación estricta de `process.env.PORT`.
- Crear `server/src/index.js` y endpoint inicial `GET /health`.
- Configurar scripts en `server/package.json`:
  - `dev`: `nodemon src/index.js`
  - `start`: `node src/index.js`

### Bitácora simple (paso a paso)

1. ✅ **Crear backend base (`server/`)**  
   Qué hicimos: creamos una carpeta separada para el servidor.  
   Para qué sirve: mantener frontend y backend ordenados.

2. ✅ **Inicializar Node + instalar paquetes**  
   Qué hicimos: `npm init -y` + `express`, `cors`, `dotenv`, `nodemon`.  
   Para qué sirve: ya tenemos el motor para crear API y entorno de desarrollo.

3. ✅ **Crear `.env` con `PORT=3000`**  
   Qué hicimos: crear `server/.env`.  
   Para qué sirve: guardar configuración fuera del código.

3.1 ✅ **Proteger `.env` en `.gitignore`**  
   Qué hicimos: añadimos `.env` y `server/.env` al `.gitignore`.  
   Para qué sirve: no subir configuración sensible al repositorio.

4. ✅ **Crear `src/config/env.js`**  
   Qué hicimos: cargamos `.env` con `dotenv` y validamos que exista `PORT`.  
   Para qué sirve: que el servidor falle rápido si falta configuración.

5. ✅ **Crear `src/index.js` con `/health`**  
   Qué hicimos: levantamos Express + `cors` + `express.json()` y endpoint `GET /health`.  
   Para qué sirve: comprobar que la API funciona antes de seguir.

6. ✅ **Arrancar servidor y validar respuesta**  
   Qué hicimos: ejecutamos `npm run dev` y verificamos `GET /health` con respuesta `{"ok":true,"service":"taskflow-api"}`.  
   Para qué sirve: confirmar que la base del backend está OK.

7. ✅ **Script `dev` según enunciado**  
   Qué hicimos: dejamos `dev` exactamente como indica el ejercicio: `nodemon src/index.js`.  
   Para qué sirve: cumplir al detalle el requisito académico.

8. ✅ **Capa de servicios (`task.service.js`)**  
   Qué hicimos: creamos persistencia simulada en memoria (`let tasks = []`) y métodos `obtenerTodas()`, `crearTarea(data)`, `eliminarTarea(id)`.  
   Para qué sirve: separar la lógica de negocio de Express y preparar el cambio futuro a base de datos.

9. ✅ **Controladores con validación defensiva (`task.controller.js`)**  
   Qué hicimos: validamos `req.body` y `req.params`, devolvemos `400` si los datos son inválidos, `201` al crear y `204` al borrar.  
   Para qué sirve: blindar la frontera de red y devolver códigos HTTP correctos.

10. ✅ **Enrutamiento centralizado (`task.routes.js`)**  
    Qué hicimos: conectamos `GET /`, `POST /`, `DELETE /:id` a los controladores y montamos el router en `index.js` bajo `/api/v1/tasks`.  
    Para qué sirve: tener arquitectura por capas limpia y una API versionada profesional.

11. ✅ **Código backend comentado (modo didáctico)**  
    Qué hicimos: añadimos comentarios humanizados en `index.js`, `env.js`, `task.routes.js`, `task.controller.js` y `task.service.js`.  
    Para qué sirve: entender fácilmente qué hace cada función y cómo fluye una petición por capas.

---

## 🛠️ Tecnologías

- **HTML5** — estructura semántica (header, main, aside, footer), plantilla `<template>`.
- **CSS3 / Tailwind (build ya generado)** — layout, tipografía y diseño responsivo.
- **JavaScript (Vanilla ES6+)** — sin frameworks ni librerías externas.
- **localStorage** — persistencia en el navegador.

---

## 👩‍💻 Autora

**Sandra Maeso** — Desarrollo de Aplicaciones Multiplataforma · Especialización en Ciberseguridad y Python.

[![GitHub](https://img.shields.io/badge/GitHub-sandramaeso89-181717?logo=github)](https://github.com/sandramaeso89)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-sandra--maeso-0A66C2?logo=linkedin)](https://www.linkedin.com/in/sandra-maeso)