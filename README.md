# ✦ TaskFlow

Aplicación web de gestión de tareas con persistencia local, desarrollada como proyecto del módulo DAM con especialización en Ciberseguridad y Python.

🔗 **Demo en vivo:** [taskflow-projectsandra.vercel.app](https://taskflow-projectsandra.vercel.app)

---

## 📸 Vista previa

> _App de tareas con diseño oscuro, buscador en tiempo real y separación entre tareas pendientes y completadas._

---

## ✅ Funcionalidades

| Funcionalidad | Descripción |
|---|---|
| ➕ Añadir tareas | Formulario modal con validación, se abre con botón o tecla `Enter` |
| 🗑️ Eliminar tareas | Botón de borrado por tarea, con animación de salida |
| ✓ Completar tareas | Marca una tarea como hecha y la mueve a la sección correspondiente |
| 💾 Persistencia | Guardado automático en `localStorage` — las tareas sobreviven al refresco |
| 🔍 Búsqueda en tiempo real | Filtra tareas mientras escribes (Bonus) |
| 📊 Estadísticas | Contador de total, pendientes y completadas en tiempo real |
| 📈 Barra de progreso | Porcentaje visual de tareas completadas |

---

## 🗂️ Estructura del proyecto

```
taskflow/
├── index.html   # Estructura HTML y estilos del modal
├── style.css    # Variables CSS, layout, componentes y media queries
└── app.js       # Toda la lógica: tareas, localStorage, eventos, búsqueda
```

---

## 🧠 Lógica principal (`app.js`)

### Añadir una tarea
Captura el texto del input, crea un objeto `{ id, texto, completada }`, lo empuja al array `tareas`, llama a `guardarEnLocalStorage()` y renderiza el nuevo elemento en el DOM.

### Eliminar una tarea
Filtra el array quitando el objeto con ese `id`, guarda el array actualizado en localStorage y elimina el nodo del DOM con una animación de salida.

### Persistencia con localStorage
```js
// Guardar
localStorage.setItem("taskflow-tareas", JSON.stringify(tareas));

// Cargar al iniciar
let tareas = JSON.parse(localStorage.getItem("taskflow-tareas")) || [];
```

### Búsqueda (Bonus)
Escucha el evento `input` en el buscador y oculta con `display: none` las tarjetas cuyo texto no incluya el término buscado.

---

## 🛡️ Seguridad

El texto introducido por el usuario se escapa con `escapeHTML()` antes de insertarse en el DOM, previniendo ataques XSS básicos.

---

## 🚀 Cómo ejecutarlo en local

```bash
git clone https://github.com/sandramaeso89/taskflow
cd taskflow
# Abre index.html en tu navegador (no necesita servidor)
```

O simplemente abre `index.html` directamente en el navegador. No tiene dependencias externas.

---

## 🛠️ Tecnologías

- **HTML5** — estructura semántica
- **CSS3** — variables custom, grid/flexbox, media queries, animaciones
- **JavaScript (Vanilla ES6+)** — sin frameworks ni librerías externas
- **localStorage** — persistencia de datos en el navegador

---

## 👩‍💻 Autora

**Sandra Maeso** — Desarrollo de Aplicaciones Multiplataforma · Especialización en Ciberseguridad y Python

[![GitHub](https://img.shields.io/badge/GitHub-sandramaeso89-181717?logo=github)](https://github.com/sandramaeso89)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-sandra--maeso-0A66C2?logo=linkedin)](https://www.linkedin.com/in/sandra-maeso)