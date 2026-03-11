# Experimentos con IA

## Propósito

Este documento registra de forma estructurada los experimentos realizados con herramientas de IA durante el desarrollo del proyecto TaskFlow. Cada experimento incluye el objetivo, el proceso seguido, los resultados obtenidos y las conclusiones extraídas, incluyendo lo que funcionó y lo que no.

---

## Índice

1. [Experimento 1: Refactorización completa de TaskFlow con Cursor Agent](#experimento-1-refactorización-completa-de-taskflow-con-cursor-agent)
2. [Experimento 2: Corrección del modo oscuro](#experimento-2-corrección-del-modo-oscuro)
3. [Experimento 3: Conexión del servidor MCP filesystem](#experimento-3-conexión-del-servidor-mcp-filesystem)

---

## Experimento 1: Refactorización completa de TaskFlow con Cursor Agent

- **Fecha:** 11/03/2026
- **Herramienta usada:** Cursor (modo Agent, Auto)
- **Archivos afectados:** `app.js`, `index.html`

### Objetivo

Revisar todo el código de TaskFlow y aplicar una refactorización completa usando IA: mejorar nombres de funciones y variables, separar responsabilidades, añadir validaciones al formulario, centralizar la lógica que estaba dispersa entre `index.html` y `app.js`, y añadir comentarios JSDoc.

### Prompt usado

> *"Revisa todo el código de TaskFlow y detecta partes mejorables. Usa IA para refactorizar al menos cinco funciones. Mejora nombres de variables y estructura de archivos. Añade validaciones adicionales al formulario. Simplifica funciones largas o repetitivas. Añade comentarios JSDoc en varias funciones del proyecto. Revisa manualmente todo el código generado antes de aceptarlo. Realiza commits claros explicando cada mejora."*

### Proceso

Cursor Agent exploró `index.html` y `app.js` y propuso un plan de 6 tareas. Las tareas de git no se ejecutaron automáticamente — Cursor pidió confirmación para cada comando de terminal. Los commits se realizaron manualmente desde la terminal integrada.

### Qué mejoró Cursor

**Refactor de funciones (≥5) y nombres**

| Nombre original | Nombre refactorizado |
|---|---|
| `cargarTareas` | `cargarTareasPersistidas` |
| `guardarTareas` | `guardarTareasEnLocalStorage` |
| `getStats` | `obtenerEstadisticasTareas` |
| `updateCounters` | `actualizarContadores` |
| `updateProgress` | `actualizarBarraDeProgreso` |
| `validateText` | `validarTextoNuevaTarea` |
| `addTask` | `crearTarea` |
| `handleSubmit` | `manejarSubmitNuevaTarea` |
| `deleteTask` | `eliminarTarea` |
| `toggleTask` | `alternarTareaCompletada` |
| `createTaskElement` | `crearElementoTarea` |
| `renderTask` | `renderizarTareaEnLista` |
| `filterText` | `filtrarTareasPorTexto` |
| `applyFilter` | `aplicarFiltroDeEstado` |
| `toggleTheme` | `alternarTema` |
| `initEvents` | `inicializarEventos` |
| `init` | `inicializarTaskFlow` |

**Validaciones adicionales del formulario**

Antes de crear una tarea, ahora se valida que:
- El texto no esté vacío
- Tenga al menos 3 caracteres
- Contenga caracteres alfanuméricos
- No sea un duplicado (comparación case-insensitive)

Si falla, el campo se marca con borde rojo y se muestra un mensaje de error que desaparece pasado ~1,2 segundos.

**Centralización de lógica**

Se eliminó el bloque `<script>` inline de `index.html` (-52 líneas) que contenía lógica de progreso, filtros y modo oscuro. Todo se movió a `app.js` (+443 líneas).

**JSDoc añadido**

```javascript
/**
 * Valida el texto introducido para una nueva tarea.
 * @param {string} texto - Texto a validar
 * @returns {{ valido: boolean, error: string }} Resultado de la validación
 */
function validarTextoNuevaTarea(texto) { ... }
```

### Resultado

- `app.js`: +443 líneas, completamente refactorizado
- `index.html`: -52 líneas, sin script inline
- Commit: `"Refactorizar lógica de TaskFlow con validaciones y JSDoc"` ✅

### Conclusión

Cursor Agent propuso y aplicó una refactorización coherente. La centralización de lógica elimina la duplicidad entre archivos. **Punto clave:** Cursor propuso los comandos git pero esperó confirmación — siempre hay que revisar el diff antes de commitear.

---

## Experimento 2: Corrección del modo oscuro

- **Fecha:** 11/03/2026
- **Herramienta usada:** Cursor (modo Agent)
- **Archivos afectados:** `app.js` (función `alternarTema`)

### Objetivo

Tras la refactorización, el modo oscuro dejó de funcionar visualmente. Se pidió a Cursor que detectara y corrigiera el problema.

### Prompt usado

> *"No funciona el modo oscuro, lo puedes revisar?"*

### Diagnóstico de Cursor

La función `alternarTema` solo añadía/quitaba la clase `dark` en `<html>`, pero el proyecto no tenía configuradas las variantes `dark:` de Tailwind. El cambio existía en el DOM pero no producía efecto visual.

### Solución aplicada

```javascript
// ANTES
function alternarTema() {
  if (!btnTema) return;
  document.documentElement.classList.toggle("dark");
  btnTema.textContent = esOscuro ? "🌙" : "☀️";
}

// DESPUÉS
function alternarTema() {
  if (!btnTema) return;
  document.documentElement.classList.toggle("dark");
  const esOscuro = document.documentElement.classList.contains("dark");
  btnTema.textContent = esOscuro ? "🌙" : "☀️";

  const { body } = document;
  if (!body) return;

  if (esOscuro) {
    body.classList.add("bg-gray-950", "text-gray-300");
    body.classList.remove("bg-white", "text-gray-900");
  } else {
    body.classList.remove("bg-gray-950", "text-gray-300");
    body.classList.add("bg-white", "text-gray-900");
  }
}
```

### Resultado

El modo oscuro funciona correctamente alternando entre `bg-gray-950 / text-gray-300` y `bg-white / text-gray-900`.

### Conclusión

Tras una refactorización grande siempre hay que probar manualmente todas las funcionalidades. La causa no fue un error de Cursor, sino una dependencia implícita que no se trasladó bien al mover el script inline. Un prompt simple y directo fue suficiente para que Cursor diagnosticara y corrigiera el problema.

---

## Experimento 3: Conexión del servidor MCP filesystem

- **Fecha:** 11/03/2026
- **Herramienta usada:** Cursor + MCP server `@modelcontextprotocol/server-filesystem`
- **Archivos afectados:** `~/.cursor/mcp.json` (configuración global)

### ¿Qué es MCP?

El **Model Context Protocol (MCP)** es un protocolo abierto creado por Anthropic que estandariza cómo las aplicaciones proporcionan contexto y herramientas a los modelos de lenguaje (LLMs). Funciona como un sistema de plugins para Cursor: permite conectar el agente de IA con fuentes de datos externas (sistema de archivos, GitHub, bases de datos, APIs) a través de interfaces estandarizadas.

**Arquitectura básica:**

```
Cursor (MCP Host)
     │
     ▼
MCP Client (enrutador interno)
     │
     ▼
MCP Server (filesystem, github, etc.)
     │
     ▼
Fuente de datos (archivos locales, API de GitHub...)
```

Sin MCP, la IA solo ve el código que tú le muestras. Con MCP, puede acceder directamente a archivos, repositorios, bases de datos y más, sin que tengas que copiar y pegar nada.

---

### Instalación paso a paso — servidor filesystem

El servidor `filesystem` permite a Cursor leer y navegar archivos del sistema directamente desde el chat.

**Requisitos previos**
- Node.js instalado (`node -v` para comprobar)
- Cursor actualizado a la última versión
- Modo **Agent** activado en el chat de Cursor

---

**Paso 1 — Abrir la configuración de MCP en Cursor**

1. Ve a `Cursor Settings` (`Cmd+,`)
2. En el panel izquierdo busca **Tools & MCP**
3. Verás la sección de servidores MCP configurados (vacía al principio)

---

**Paso 2 — Crear el archivo de configuración**

Crea el archivo `~/.cursor/mcp.json` (configuración global, aplica a todos los proyectos):

```bash
mkdir -p ~/.cursor
touch ~/.cursor/mcp.json
```

---

**Paso 3 — Añadir la configuración del servidor filesystem**

Edita `~/.cursor/mcp.json` y añade:

```json
{
  "mcpServers": {
    "filesystem": {
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-filesystem",
        "/ruta/a/tu/proyecto"
      ]
    }
  }
}
```

> Sustituye `/ruta/a/tu/proyecto` por la ruta real de tu repositorio TaskFlow.
> En Mac suele ser algo como `/Users/tunombre/proyectos/taskflow-project`

---

**Paso 4 — Reiniciar Cursor completamente**

Cierra Cursor del todo (`Cmd+Q`) y vuelve a abrirlo. Los servidores MCP arrancan automáticamente al iniciar.

---

**Paso 5 — Verificar que el servidor está activo**

1. Ve a `Cursor Settings` → **Tools & MCP**
2. Deberías ver `filesystem` listado con un indicador verde ✅
3. Si no aparece, haz clic en el icono de recargar

---

**Paso 6 — Activar modo Agent en el chat**

En el chat de Cursor, asegúrate de que el selector inferior izquierdo muestra **Agent** (no Ask ni Normal). MCP solo funciona en modo Agent.

---

### Cinco consultas realizadas con MCP filesystem

Una vez conectado el servidor, se realizaron las siguientes consultas directamente en el chat de Cursor en modo Agent:

---

**Consulta 1 — Listar la estructura del proyecto**

> *"Lista todos los archivos del proyecto TaskFlow y muéstrame la estructura de carpetas."*

Cursor accedió al sistema de archivos y devolvió la estructura completa del proyecto:

```
taskflow-project/
├── package.json
├── input.css
├── tailwind.config.js
├── maquetacion-app/
│   ├── index.html
│   ├── style.css
│   ├── app.js
│   └── docs/
│       ├── experiments.md
│       ├── cursor-workflow.md
│       └── ai-comparation.md
├── node_modules/
└── .vscode/
```

Sin MCP habría que abrir el explorador manualmente o ejecutar `tree` en la terminal. Con MCP Cursor lo hizo solo desde el chat.

---

**Consulta 2 — Buscar todos los usos de localStorage**

> *"Busca en todos los archivos del proyecto dónde se usa localStorage y dime en qué líneas aparece."*

Cursor identificó cada uso con número de línea exacto:

- `maquetacion-app/app.js`
  - L44: `const data = localStorage.getItem("taskflow-tareas");`
  - L60: `localStorage.setItem("taskflow-tareas", JSON.stringify(tareasAGuardar));`
- `maquetacion-app/index-backup.html`
  - L510: acceso en `guardar()` con try/catch
  - L514: acceso en `cargar()` con try/catch
- Menciones solo en documentación (no lógica): `README.md`, `experiments.md`, `cursor-workflow.md`

Útil para auditar dónde se persisten datos sin tener que buscar manualmente en cada archivo.

---

**Consulta 3 — Detectar funciones sin JSDoc**

> *"Revisa app.js y dime qué funciones no tienen comentario JSDoc todavía."*

Cursor analizó el archivo y confirmó que **todas las funciones tienen JSDoc**. Lista completa documentada:

`cargarTareasPersistidas`, `guardarTareasEnLocalStorage`, `obtenerEstadisticasTareas`, `actualizarContadores`, `actualizarBarraDeProgreso`, `actualizarMensajesVacio`, `abrirModalNuevaTarea`, `cerrarModalNuevaTarea`, `validarTextoNuevaTarea`, `crearTarea`, `manejarSubmitNuevaTarea`, `eliminarTarea`, `alternarTareaCompletada`, `escapeHTML`, `crearElementoTarea`, `renderizarTareaEnLista`, `filtrarTareasPorTexto`, `aplicarFiltroDeEstado`, `alternarTema`, `inicializarEventos`, `inicializarTaskFlow`.

Resultado: ninguna función sin documentar ✅

---

**Consulta 4 — Comparar index-backup.html con index.html actual**

> *"Lee el archivo index-backup.html y compáralo con el index.html actual. ¿Qué se ha eliminado?"*

Cursor leyó ambos archivos y resumió las diferencias:

- **CSS eliminado:** el backup usaba CSS propio con variables `:root`, clases como `.layout`, `.sidebar-section`, `.task-card`, `.modal-overlay`, etc. El actual usa clases de Tailwind en su lugar.
- **Script inline eliminado:** el backup tenía todo el JS embebido en un `<script>` (líneas 489–652) con funciones como `guardar`, `cargar`, `anadirTarea`, `renderizarTarea`, etc. El actual solo tiene `<script src="app.js"></script>`.
- **Resultado:** `index.html` actual es mucho más limpio — delega estilos a Tailwind y lógica a `app.js`.

---

**Consulta 5 — Analizar dependencias del package.json**

> *"Lee el package.json y dime qué dependencias tiene el proyecto, si hay alguna desactualizada o que no se use en el código."*

Cursor analizó el archivo y cruzó las dependencias con el código:

```json
{
  "devDependencies": {
    "tailwindcss": "^3.4.19"
  }
}
```

- **tailwindcss@^3.4.19** — en uso. `index.html` usa clases de Tailwind por todas partes y `style.css` es el output generado.
- Versión reciente y adecuada para el proyecto.
- No hay dependencias sobrantes ni sin usar.
- Conclusión: `package.json` está muy limpio ✅

---

### ¿En qué casos es útil MCP en proyectos reales?

| Caso de uso | Por qué ayuda MCP |
|---|---|
| **Proyectos grandes** | La IA puede navegar cientos de archivos sin que tengas que abrirlos uno a uno |
| **Onboarding a código ajeno** | Puedes preguntar "¿cómo funciona este módulo?" y la IA lee los archivos directamente |
| **Auditorías de código** | Buscar patrones, usos de librerías o malas prácticas en todo el proyecto de golpe |
| **Integración con GitHub** | Con el servidor GitHub MCP, la IA puede leer issues, PRs y commits sin salir del editor |
| **Bases de datos** | Con servidores MCP de PostgreSQL o Supabase, la IA puede consultar el esquema y escribir queries |
| **Documentación automática** | Generar o actualizar docs leyendo el código fuente completo del proyecto |

### Limitaciones encontradas

- Cursor soporta un **máximo de 40 herramientas** de servidores MCP simultáneos.
- MCP **no funciona bien** en entornos remotos (SSH).
- Cursor actualmente solo soporta **tools**, no resources (soporte de resources está planificado).
- Por seguridad, Cursor pide **confirmación manual** antes de ejecutar cada herramienta MCP — esto es un comportamiento correcto y recomendable.

### Conclusión

MCP transforma el chat de Cursor de una herramienta que responde sobre el código que le muestras, a un agente que puede explorar activamente el proyecto. Para proyectos del tamaño de TaskFlow la diferencia es pequeña, pero en proyectos reales con docenas de archivos y módulos, tener la IA con acceso directo al sistema de archivos ahorra mucho tiempo de contexto manual.

---

*Documento completado — Prácticas DAM · Proyecto TaskFlow*