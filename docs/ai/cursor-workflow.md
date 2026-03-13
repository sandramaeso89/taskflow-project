En este documento describiré cómo he integrado Cursor (el editor de código potenciado por IA) en mi flujo de trabajo diario de desarrollo. # Flujo de Trabajo con Cursor

## Propósito

Incorporar una herramienta nueva al flujo de trabajo habitual no es inmediato: hay una curva de aprendizaje, hábitos que cambiar y una etapa de experimentación antes de que la herramienta realmente aporte valor. Cursor es mucho más que un editor con autocompletado; es un entorno donde la IA puede leer el contexto del proyecto completo, proponer cambios en múltiples archivos y mantener una conversación sobre el código.

Este documento recoge ese proceso de adaptación de forma honesta, registrando atajos, funcionalidades descubiertas y ejemplos reales donde Cursor mejoró el código del proyecto **TaskFlow**.

---

## Índice

1. [Exploración de la interfaz](#1-exploración-de-la-interfaz)
2. [Atajos de teclado más usados](#2-atajos-de-teclado-más-usados)
3. [Autocompletado con comentarios](#3-autocompletado-con-comentarios)
4. [Chat contextual — explicación de código](#4-chat-contextual--explicación-de-código)
5. [Edición inline](#5-edición-inline)
6. [Composer — cambios en varios archivos](#6-composer--cambios-en-varios-archivos)
7. [Dos ejemplos concretos de mejora](#7-dos-ejemplos-concretos-de-mejora)
8. [Reflexión y conclusiones](#8-reflexión-y-conclusiones)

---

## 1. Exploración de la interfaz

Al abrir el proyecto **TaskFlow** en Cursor lo primero que se observa es que la interfaz es casi idéntica a VS Code, lo que reduce mucho la curva de entrada.

**Explorador de archivos (panel izquierdo)**
Muestra la estructura del proyecto: `index.html`, `app.js`, `style.css`, `tailwind.config.js`, `package.json`. Se navega igual que en VS Code, con clic o con el atajo `Cmd+P` para búsqueda rápida de archivos.

**Terminal integrada**
Se abre con `` Ctrl+` `` (o desde el menú Terminal). Permite ejecutar comandos sin salir del editor. En TaskFlow se usó para arrancar el servidor local y comprobar errores de consola.

**Chat de IA (panel derecho o `Cmd+L`)**
Es el panel principal de interacción con la IA. Tiene contexto del proyecto completo cuando se activa el modo Agent. Se puede adjuntar un archivo concreto con `@nombrearchivo` para centrar la conversación.

**Herramientas de edición**
Las mismas que VS Code: multicursor con `Alt+clic`, selección de todas las ocurrencias con `Cmd+Shift+L`, formateo con `Shift+Alt+F`.

---

## 2. Atajos de teclado más usados

| Atajo (Mac) | Atajo (Windows/Linux) | Acción |
|---|---|---|
| `Cmd+L` | `Ctrl+L` | Abrir chat de IA |
| `Cmd+I` | `Ctrl+I` | Abrir Composer (edición inline / multiarchivo) |
| `Cmd+K` | `Ctrl+K` | Edición inline rápida en selección |
| `Cmd+P` | `Ctrl+P` | Búsqueda rápida de archivos |
| `Cmd+Shift+P` | `Ctrl+Shift+P` | Paleta de comandos |
| `Cmd+Shift+L` | `Ctrl+Shift+L` | Seleccionar todas las ocurrencias |
| `` Ctrl+` `` | `` Ctrl+` `` | Abrir/cerrar terminal integrada |
| `Cmd+/` | `Ctrl+/` | Comentar/descomentar línea |
| `Shift+Alt+F` | `Shift+Alt+F` | Formatear documento |
| `Cmd+Z` | `Ctrl+Z` | Deshacer (muy útil tras aplicar sugerencias) |
| `Tab` | `Tab` | Aceptar sugerencia de autocompletado |
| `Esc` | `Esc` | Rechazar sugerencia de autocompletado |

> **Tip:** `Cmd+Z` es el atajo más importante cuando se trabaja con IA. Siempre se puede deshacer un cambio aplicado si no convence.

---

## 3. Autocompletado con comentarios

Cursor puede generar código completo a partir de un comentario descriptivo. El flujo es:

1. Escribes un comentario explicando qué debe hacer la función.
2. Cursor sugiere la implementación completa en gris.
3. Pulsas `Tab` para aceptar o `Esc` para rechazar.

**Ejemplo probado en TaskFlow:**

Se escribió el siguiente comentario en `app.js`:

```javascript
// Función que filtra las tareas por texto de búsqueda,
// ignorando mayúsculas y minúsculas, y vuelve a renderizar la lista
```

Cursor sugirió automáticamente:

```javascript
function filtrarPorBusqueda(termino) {
  const terminoNormalizado = termino.toLowerCase().trim();
  const tareasFiltradas = tareas.filter(tarea =>
    tarea.texto.toLowerCase().includes(terminoNormalizado)
  );
  renderizarLista(tareasFiltradas);
}
```

La sugerencia era correcta y coherente con el resto del código del proyecto. Se aceptó con `Tab` y funcionó sin modificaciones.

---

## 4. Chat contextual — explicación de código

El chat de Cursor puede explicar fragmentos concretos del proyecto. Para obtener contexto preciso se usó `@app.js` al inicio del mensaje.

**Prompt usado:**
> *"@app.js Explícame cómo funciona la función `renderizarTarea` y qué hace exactamente `escapeHTML`."*

**Respuesta de Cursor (resumen):**
- `renderizarTarea` crea un nodo DOM para cada tarea, le adjunta los eventos de completar y eliminar, y lo inserta en la lista del HTML.
- `escapeHTML` convierte caracteres especiales (`<`, `>`, `&`, `"`) en sus entidades HTML equivalentes, evitando que un usuario malintencionado inyecte código HTML o JavaScript a través del campo de texto (protección contra XSS).

Esta explicación fue útil para entender por qué `escapeHTML` es una buena práctica de seguridad, algo que no estaba comentado en el código original.

---

## 5. Edición inline

Con `Cmd+K` se puede seleccionar un fragmento de código y pedirle a Cursor que lo modifique sin abrir el chat completo. Es más rápido para cambios pequeños.

**Ejemplo probado:**

Se seleccionó la función `toggleCompletada` en `app.js` y se usó `Cmd+K` con el mensaje:
> *"Añade un console.log que muestre el id y el nuevo estado de la tarea cada vez que se llame a esta función."*

Cursor modificó la función directamente mostrando el diff. Se aceptó con el botón **Accept**.

---

## 6. Composer — cambios en varios archivos

El Composer (`Cmd+I`) es la herramienta más potente de Cursor. Permite dar una instrucción que afecte a múltiples archivos a la vez, mostrando un diff completo antes de aplicar nada.

**Ejemplo probado en TaskFlow:**

Prompt dado al Composer:
> *"Envuelve todos los accesos a localStorage en try/catch para manejar el caso en que esté bloqueado (por ejemplo en modo incógnito). Aplica el cambio tanto en app.js como en index.html."*

Cursor propuso cambios en ambos archivos simultáneamente. Se revisó el diff archivo por archivo y se aceptaron los cambios.

**Resultado:** el código quedó más robusto sin tener que editar manualmente cada acceso a `localStorage`.

---

## 7. Dos ejemplos concretos de mejora

### Ejemplo 1 — Corrección del error de sintaxis crítico

**Situación:** Al pedir al chat que revisara `app.js`, detectó un error de sintaxis que impedía que el script se ejecutara en absoluto.

**Código con bug:**
```javascript
const nuevaTarea = {
  id: Date.now(),
  texto: texto,a   // ← 'a' suelta, error de sintaxis
  completada: false
};
```

**Prompt usado:**
> *"@app.js Revisa el código completo, detecta errores de sintaxis y corrígelos."*

**Código corregido (aplicado con Apply):**
```javascript
const nuevaTarea = {
  id: Date.now(),
  texto,
  completada: false
};
```

**Impacto:** sin esta corrección, toda la aplicación estaba rota. Cursor lo detectó de inmediato y propuso la corrección con una explicación clara. Se aplicó en un clic.

---

### Ejemplo 2 — Guardia de seguridad en reasignación de función

**Situación:** En `index.html` se sobreescribía la función `actualizarContadores` sin comprobar si existía, lo que podía causar un error si `app.js` no había cargado correctamente.

**Código original:**
```javascript
const _orig = actualizarContadores;
actualizarContadores = function () {
  _orig();
  // resto de la lógica...
};
```

**Prompt usado:**
> *"En index.html, la reasignación de actualizarContadores podría fallar si app.js no ha cargado. Añade una comprobación typeof antes de reasignarla."*

**Código mejorado (aplicado con Apply):**
```javascript
if (typeof actualizarContadores === "function") {
  const _orig = actualizarContadores;
  actualizarContadores = function () {
    _orig();
    // resto de la lógica...
  };
}
```

**Impacto:** el código es ahora más robusto frente a fallos de carga. Cursor generó el cambio exacto necesario sin tocar nada más del archivo.

---

## 8. Reflexión y conclusiones

Después de trabajar con Cursor en el proyecto TaskFlow, estas son las observaciones más relevantes:

**Dónde Cursor aporta más valor:**
- Detectar bugs que se escapan a simple vista (como la `a` suelta).
- Explicar código ajeno o código propio escrito hace tiempo.
- Aplicar el mismo patrón de cambio en varios archivos a la vez con Composer.
- Generar boilerplate (código repetitivo) a partir de comentarios.

**Dónde hay que tener cuidado:**
- Cursor puede generar código que parece correcto pero tiene errores sutiles. Siempre hay que leer el diff antes de aceptar.
- En proyectos pequeños como TaskFlow, el Composer puede proponer cambios más grandes de lo necesario. Mejor ser específico en el prompt.
- El autocompletado a veces sugiere código de otro contexto. `Esc` es tu amigo.

**Conclusión general:**
Cursor acelera el trabajo, pero no reemplaza entender el código. Los dos ejemplos de mejora documentados aquí los propuso la IA, pero fue necesario entender qué cambiaba y por qué antes de aceptarlo. Esa revisión crítica es la habilidad que hay que desarrollar.

---

*Documento completado — Prácticas DAM · Proyecto TaskFlow*