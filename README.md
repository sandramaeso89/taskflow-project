# TaskFlow (Proyecto de practicas)

Este proyecto es una app de tareas que hice en clase para practicar:

- frontend con HTML/CSS/JS
- backend con Node.js + Express
- conexion frontend-backend con API REST
- despliegue en Vercel

La idea es que las tareas ya no se guarden solo en el navegador, sino que pasen por el servidor.

## Demo

- Frontend: [https://taskflow-project-orcin-eight.vercel.app](https://taskflow-project-orcin-eight.vercel.app)
- Backend (health): [https://taskflow-project-25oy.vercel.app/health](https://taskflow-project-25oy.vercel.app/health)
- Swagger backend: [https://taskflow-project-25oy.vercel.app/api-docs](https://taskflow-project-25oy.vercel.app/api-docs)

## Que he hecho (resumen sencillo)

1. Cree una carpeta `server/` con Express.
2. Prepare variables de entorno con `.env` (`PORT=3000`).
3. Hice API REST de tareas por capas:
   - rutas
   - controladores
   - servicios
4. Migre el frontend para usar `fetch` contra la API.
5. Quite la persistencia de tareas en `localStorage` (solo dejo el tema claro/oscuro).
6. Añadi manejo de errores y endpoint de prueba para error 500.
7. Documente API con Swagger.
8. Subi frontend y backend a Vercel.
9. Añadi estado visual de red en la interfaz (cargando/exito/error).

## Estructura del proyecto

```text
taskflow-project/
├── maquetacion-app/
│   ├── index.html
│   ├── app.js
│   └── network/client.js
├── server/
│   ├── src/
│   ├── api/index.js
│   ├── vercel.json
│   └── README.md
└── docs/backend-api.md
```

## Endpoints principales

Base local: `http://localhost:3000/api/v1/tasks`

- `GET /` -> listar tareas
- `POST /` -> crear tarea
- `PATCH /:id` -> actualizar parte de una tarea
- `PUT /:id` -> reemplazar tarea completa
- `DELETE /:id` -> eliminar tarea

Tambien:

- `GET /health`
- `GET /api/v1/tasks/_test/error500` (para probar error interno)

## Pruebas de endpoints (debug de errores)

Pruebas que hice de forma manual con Postman/curl/Thunder Client:

- `POST` sin titulo -> `400`
- `DELETE` con id que no existe -> `404`
- endpoint `_test/error500` -> `500`
- casos normales (`GET`, `POST`, `PATCH`, `PUT`, `DELETE`) -> correctos

## Extra pedido (mensaje de carga)

En frontend agregue un estado de red visible:

- cargando: cuando espera respuesta del servidor
- exito: cuando responde bien
- error: cuando falla

Esto se ve en el texto de estado dentro de la app.

Implementacion hecha para cumplir el extra de la tarea:

- "modificar la interfaz para que muestre un mensaje de carga mientras espera las respuestas asincronas del servidor"

## Como ejecutar en local

### 1) Backend

```bash
cd server
npm install
npm run dev
```

Backend en: `http://localhost:3000`

### 2) Frontend

Abre `maquetacion-app/index.html` con Live Server o servidor local.

## Despliegue en Vercel (lo que hice)

- Proyecto 1 en Vercel para frontend
- Proyecto 2 en Vercel para backend Express (`server/`)
- Cada push a `main` hace redeploy automatico

## Preparado para la revision del lunes

En la revision mostrare estas partes del proyecto:

- migracion del frontend para usar API (sin localStorage para tareas)
- debug de errores por endpoints (400, 404 y 500)
- documentacion principal en este README
- documentacion tecnica en `server/README.md`
- despliegue funcionando en Vercel (frontend + backend)
- extra del mensaje de carga en peticiones async

## Nota personal

Este proyecto esta hecho con enfoque de practicas, aprendiendo paso a paso.  
Seguro hay cosas mejorables, pero el objetivo principal era entender bien la migracion a API, el manejo de errores y el despliegue.
