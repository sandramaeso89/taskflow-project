# Taskflow Project

# ✦ TaskFlow — Gestión de Tareas

> Aplicación web para organizar tus tareas del día a día, con persistencia local y búsqueda en tiempo real.

![Vista previa de TaskFlow](https://placehold.co/900x450/1a1a2e/6c63ff?text=TaskFlow+Preview)

---

## 📋 Tabla de contenidos

- [¿Qué hace esta app?](#-qué-hace-esta-app)
- [Funcionalidades](#-funcionalidades)
- [Tecnologías usadas](#-tecnologías-usadas)
- [Estructura del proyecto](#-estructura-del-proyecto)
- [Cómo ejecutarlo en local](#-cómo-ejecutarlo-en-local)
- [Cómo funciona por dentro](#-cómo-funciona-por-dentro)
- [Demo en producción](#-demo-en-producción)

---

## 🤔 ¿Qué hace esta app?

TaskFlow es una app de gestión de tareas que corre **100% en el navegador**, sin servidores ni bases de datos externas. Puedes añadir tareas, marcarlas como completadas, eliminarlas y buscarlas... y todo se guarda automáticamente aunque cierres la pestaña o el navegador.

---

## ✨ Funcionalidades

| Función | Descripción |
|---|---|
| ➕ **Añadir tarea** | Escribe y pulsa `Añadir` o la tecla `Enter` |
| ✅ **Completar tarea** | Pulsa el botón `✓` para marcarla como hecha |
| 🗑️ **Eliminar tarea** | Pulsa el icono de papelera para borrarla |
| 💾 **Persistencia** | Las tareas se guardan en LocalStorage automáticamente |
| 🔍 **Búsqueda** | Filtra tareas en tiempo real mientras escribes |
| 🔢 **Contador** | Muestra cuántas tareas pendientes tienes |

---

## 🛠️ Tecnologías usadas

- **HTML5** — estructura de la página
- **CSS3** — estilos y animaciones
- **JavaScript (Vanilla)** — lógica de la aplicación, sin frameworks
- **LocalStorage API** — para guardar datos en el navegador del usuario

> ℹ️ No se usan librerías externas ni npm. Todo funciona con tecnologías nativas del navegador.

---

## 📁 Estructura del proyecto

```
taskflow/
├── index.html      → La estructura visual (el "esqueleto")
├── style.css       → Los estilos y colores (la "ropa")
├── app.js          → La lógica y comportamiento (el "cerebro")
└── README.md       → Este archivo
```

---

## 🚀 Cómo ejecutarlo en local

No necesitas instalar nada. Solo:

1. **Clona el repositorio:**
   ```bash
   git clone https://github.com/tu-usuario/taskflow.git
   ```

2. **Entra en la carpeta:**
   ```bash
   cd taskflow
   ```

3. **Abre `index.html` en tu navegador** — puedes hacer doble clic en el archivo o usar la extensión **Live Server** de VS Code para recarga automática.

---

## 🧠 Cómo funciona por dentro

### LocalStorage: la "libretita" del navegador

Cada vez que añades, completas o eliminas una tarea, el array de tareas se convierte en texto con `JSON.stringify()` y se guarda en LocalStorage. Al cargar la página, ese texto se recupera con `JSON.parse()` y se vuelve a dibujar en pantalla.

```
Tarea nueva → push al array → JSON.stringify → localStorage.setItem
Al cargar   → localStorage.getItem → JSON.parse → renderizar cada tarea
```

### El flujo de una tarea

```
Usuario escribe → click en Añadir
      ↓
Se crea objeto { id, texto, completada: false }
      ↓
Se guarda en el array + LocalStorage
      ↓
Se "dibuja" en el DOM con renderizarTarea()
```

### Búsqueda en tiempo real

El filtro **no borra nada**. Solo oculta visualmente (`display: none`) las tarjetas cuyo título no contiene el texto buscado. Al borrar la búsqueda, todo vuelve a aparecer.

---

## 🌐 Demo en producción

👉 [Ver app en Vercel](https://taskflow-tu-usuario.vercel.app)

---

## 👨‍💻 Autor

Hecho con ☕ por **[Tu Nombre]**