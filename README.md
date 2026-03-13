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

## 🛠️ Tecnologías

- **HTML5** — estructura semántica (header, main, aside, footer), plantilla `<template>`.
- **CSS3 / Tailwind (build ya generado)** — layout, tipografía y diseño responsivo.
- **JavaScript (Vanilla ES6+)** — sin frameworks ni librerías externas.
- **localStorage** — persistencia en el navegador.

---

## 👩‍💻 Autora

**Sandra Maeso** — Desarrollo de Aplicaciones Multiplataforma · Especialización en Ciberseguridad y Python

[![GitHub](https://img.shields.io/badge/GitHub-sandramaeso89-181717?logo=github)](https://github.com/sandramaeso89)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-sandra--maeso-0A66C2?logo=linkedin)](https://www.linkedin.com/in/sandra-maeso)