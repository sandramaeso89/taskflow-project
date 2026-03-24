# ✦ TaskFlow

Aplicación web de gestión de tareas con frontend + backend Express (API REST), desarrollada como proyecto del módulo DAM con especialización en Ciberseguridad y Python.

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
- **Persistencia de tareas en backend API** (ya no en `localStorage` para tareas).
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
│   ├── app.js       # Lógica de UI conectada al backend
│   └── api/client.js # Capa de red del frontend (fetch)
├── server/
│   ├── src/config/env.js
│   ├── src/services/task.service.js
│   ├── src/controllers/task.controller.js
│   ├── src/routes/task.routes.js
│   └── src/middlewares/error.middleware.js
├── docs/backend-api.md
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
- Sincronización con la API REST (`fetch`) a cada cambio relevante.
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
| **Persistencia (recargar)** | ✅ | Las tareas se consultan al backend y se mantienen mientras el servidor esté activo (persistencia en memoria en esta fase). |

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

12. ✅ **Middleware global de errores (Fase C)**  
    Qué hicimos: creamos `server/src/middlewares/error.middleware.js` con firma `(err, req, res, next)` y mapeo semántico de errores.  
    Para qué sirve: evitar que fallos no controlados rompan el servidor y devolver respuestas HTTP correctas.

13. ✅ **Mapeo semántico de excepciones HTTP**  
    Qué hicimos: si el error es `NOT_FOUND` devolvemos `404`; para cualquier otro, registramos `console.error(err)` y devolvemos `500` genérico.  
    Para qué sirve: proteger detalles internos y mantener contrato de API robusto.

14. ✅ **Controladores conectados al middleware global**  
    Qué hicimos: en `eliminarTarea` delegamos errores con `next(error)` en lugar de responder localmente.  
    Para qué sirve: centralizar el manejo de errores en un único punto de la app.

15. ✅ **Pruebas de integración de red (éxito + errores)**  
    Qué hicimos: probamos endpoints con casos reales:
    - `GET /api/v1/tasks` → `200` + `[]`
    - `POST /api/v1/tasks` sin título → `400`
    - `POST /api/v1/tasks` válido → `201`
    - `DELETE /api/v1/tasks/999` inexistente → `404`
    Para qué sirve: validar robustez de la API ante entradas correctas e incorrectas.

16. ✅ **Fase D: consumo desde frontend sin LocalStorage de tareas**  
    Qué hicimos: creamos `maquetacion-app/api/client.js` y conectamos `app.js` a `fetch` contra `http://localhost:3000/api/v1/tasks`.  
    Para qué sirve: que la fuente de verdad de tareas sea el backend, no el navegador.

17. ✅ **Estados de red visibles en UI**  
    Qué hicimos: añadimos estado visual `#network-status` con tres modos: carga, éxito y error.  
    Para qué sirve: mejorar UX ante latencia o caídas del servidor.

18. ✅ **Documentación de herramientas API**  
    Qué hicimos: agregamos `docs/backend-api.md` explicando Axios, Postman, Sentry y Swagger, y por qué se usan.  
    Para qué sirve: reforzar parte teórica y decisiones de ingeniería.

19. ✅ **Bonus: Swagger y pruebas de errores 400/404/500**  
    Qué hicimos: integramos Swagger UI en `/api-docs`, añadimos especificación OpenAPI y documentamos pruebas de error en Postman/Thunder Client.  
    Para qué sirve: trazabilidad técnica completa y validación de robustez de la API.

20. ✅ **Middleware de auditoría (`loggerAcademico`)**  
    Qué hicimos: añadimos logger con métricas de tiempo por request usando `performance.now()` y evento `finish`.  
    Para qué sirve: observar método, ruta, estado HTTP y latencia real.

21. ✅ **Preparación de despliegue backend en Vercel**  
    Qué hicimos: separamos `app` y `server`, añadimos `server/api/index.js` y `server/vercel.json` para despliegue serverless.  
    Para qué sirve: dejar el backend listo para importarlo en Vercel sin cambiar código de negocio.

---

## 🏗️ Arquitectura backend y red

### Capas (separación de responsabilidades)

- **Routes**: reciben URL + verbo HTTP y delegan al controlador.
- **Controllers**: validan entrada (`req.body`/`req.params`) y devuelven códigos HTTP.
- **Services**: lógica de negocio pura (sin `req`/`res`), actualmente con persistencia en memoria.

### Middlewares y pipeline

- `cors()` permite peticiones del frontend al backend.
- `express.json()` transforma JSON de red en `req.body`.
- `errorHandler(err, req, res, next)` centraliza errores:
  - `NOT_FOUND` -> `404`
  - errores no controlados -> log interno + `500` genérico

### Endpoints REST (v1)

- `GET /api/v1/tasks` -> lista tareas
- `POST /api/v1/tasks` -> crea tarea (`201`)
- `PATCH /api/v1/tasks/:id` -> cambio parcial (`200`)
- `PUT /api/v1/tasks/:id` -> reemplazo total (`200`)
- `DELETE /api/v1/tasks/:id` -> elimina (`204`)

### Ejemplos rápidos de uso

```bash
curl -X GET http://localhost:3000/api/v1/tasks
curl -X POST http://localhost:3000/api/v1/tasks -H "Content-Type: application/json" -d '{"titulo":"Mi tarea"}'
curl -X PATCH http://localhost:3000/api/v1/tasks/1 -H "Content-Type: application/json" -d '{"completada":true}'
curl -X DELETE http://localhost:3000/api/v1/tasks/1
```

---

## 🧾 Bonus: Swagger + pruebas de error

### Swagger (documentación exhaustiva)

- URL local: `http://localhost:3000/api-docs`
- Especificación OpenAPI: `server/src/docs/openapi.yaml`
- Incluye endpoints de negocio y endpoint de test para error 500.

### Pruebas con Postman / Thunder Client (forzando errores)

| Caso | Request | Resultado esperado |
|------|---------|-------------------|
| **400** validación | `POST /api/v1/tasks` body `{}` | `400` + `{"error":"El título es obligatorio..."}` |
| **404** recurso inexistente | `DELETE /api/v1/tasks/999` | `404` + `{"error":"Recurso no encontrado."}` |
| **500** error interno | `GET /api/v1/tasks/_test/error500` | `500` + `{"error":"Error interno del servidor."}` |

### Ejemplos request/response (copiar y pegar)

#### 1) Crear tarea correcta

```http
POST /api/v1/tasks
Content-Type: application/json

{
  "titulo": "Preparar demo backend"
}
```

Respuesta:

```json
{
  "id": "1",
  "titulo": "Preparar demo backend",
  "completada": false,
  "createdAt": "2026-03-23T14:00:00.000Z"
}
```

#### 2) Error 400 (sin título)

```http
POST /api/v1/tasks
Content-Type: application/json

{}
```

Respuesta:

```json
{
  "error": "El título es obligatorio y debe tener al menos 3 caracteres."
}
```

#### 3) Error 500 (forzado)

```http
GET /api/v1/tasks/_test/error500
```

Respuesta:

```json
{
  "error": "Error interno del servidor."
}
```

---

## 🛠️ Tecnologías

- **HTML5** — estructura semántica (header, main, aside, footer), plantilla `<template>`.
- **CSS3 / Tailwind (build ya generado)** — layout, tipografía y diseño responsivo.
- **JavaScript (Vanilla ES6+)** — sin frameworks ni librerías externas.
- **API REST con Express** — persistencia temporal en memoria del backend.

---

## 👩‍💻 Autora

**Sandra Maeso** — Desarrollo de Aplicaciones Multiplataforma · Especialización en Ciberseguridad y Python.

[![GitHub](https://img.shields.io/badge/GitHub-sandramaeso89-181717?logo=github)](https://github.com/sandramaeso89)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-sandra--maeso-0A66C2?logo=linkedin)](https://www.linkedin.com/in/sandra-maeso)## Setup
