# TaskFlow

Aplicacion web de gestion de tareas con frontend + backend Express, creada como proyecto para migrar de `localStorage` a una API REST y desplegar todo en Vercel.

## Demo

- Frontend: [https://taskflow-project-orcin-eight.vercel.app](https://taskflow-project-orcin-eight.vercel.app)
- Backend health: [https://taskflow-project-25oy.vercel.app/health](https://taskflow-project-25oy.vercel.app/health)
- Swagger: [https://taskflow-project-25oy.vercel.app/api-docs](https://taskflow-project-25oy.vercel.app/api-docs)

## Objetivo del proyecto

- Migrar la gestion de tareas al backend.
- Separar la logica por capas (`routes`, `controllers`, `services`).
- Manejar errores de forma consistente (`400`, `404`, `500`).
- Documentar y desplegar frontend + backend.
- Mostrar estado de carga en interfaz durante peticiones async.

## Stack usado

- Frontend: HTML, CSS (Tailwind), JavaScript vanilla
- Backend: Node.js, Express, dotenv, cors
- Documentacion API: Swagger (`swagger-ui-express`, `yamljs`)
- Deploy: Vercel

## Estructura del proyecto

```text
taskflow-project/
├── maquetacion-app/
│   ├── index.html
│   ├── app.js
│   └── network/client.js
├── server/
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── docs/
│   │   ├── middlewares/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── app.js
│   │   └── index.js
│   ├── api/index.js
│   ├── vercel.json
│   └── README.md
└── docs/backend-api.md
```

## Migracion a API (resumen)

Antes las tareas se guardaban en el navegador.  
Ahora la fuente de verdad esta en la API REST del backend.

En el frontend se creo una capa de red dedicada (`maquetacion-app/network/client.js`) y `app.js` consume esa capa en lugar de usar `localStorage` para tareas.

### Ejemplo de cliente HTTP (`fetch`)

```js
async function getTasks() {
  return request(endpoint(), { method: "GET" });
}

async function createTask(payload) {
  return request(endpoint(), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}
```

## API REST

Base local: `http://localhost:3000/api/v1/tasks`

- `GET /` -> listar tareas
- `POST /` -> crear tarea
- `PATCH /:id` -> actualizar parcialmente
- `PUT /:id` -> reemplazar tarea
- `DELETE /:id` -> borrar tarea

Extras:

- `GET /health`
- `GET /api/v1/tasks/_test/error500` (forzar error interno para pruebas)

### Ejemplo request/response

`POST /api/v1/tasks`

```json
{
  "titulo": "Preparar demo del lunes"
}
```

Respuesta esperada:

```json
{
  "id": "1",
  "titulo": "Preparar demo del lunes",
  "completada": false,
  "createdAt": "2026-03-24T00:00:00.000Z"
}
```

## Manejo de errores y debug por endpoints

Pruebas manuales realizadas con Postman/Thunder Client/curl:

- `POST` sin titulo -> `400`
- `DELETE` con ID inexistente -> `404`
- `GET /_test/error500` -> `500`
- Flujo normal CRUD -> correcto

### Ejemplo rapido con curl

```bash
curl -X GET http://localhost:3000/health
curl -X GET http://localhost:3000/api/v1/tasks
curl -X POST http://localhost:3000/api/v1/tasks \
  -H "Content-Type: application/json" \
  -d '{"titulo":"Tarea de prueba"}'
curl -X DELETE http://localhost:3000/api/v1/tasks/999
curl -X GET http://localhost:3000/api/v1/tasks/_test/error500
```

## Extra: mensaje de carga en la interfaz

Se implemento un estado visual de red en frontend para mostrar:

- `loading`: mientras espera respuesta
- `success`: cuando sincroniza correctamente
- `error`: si la peticion falla

### Ejemplo de uso en `app.js`

```js
setNetworkState("loading", "Cargando tareas desde el servidor...");
const data = await globalThis.taskApi.getTasks();
setNetworkState("success", "Tareas sincronizadas con el servidor.");
```

Esto cumple el extra pedido: mostrar un mensaje de carga durante respuestas asincronas.

## Despliegue en Vercel

- Proyecto frontend desplegado por separado.
- Proyecto backend (`server/`) desplegado como serverless.
- Cada push a `main` dispara redeploy automatico.

Nota tecnica importante: en frontend se evito usar rutas estaticas bajo `/api/*` para no colisionar con rutas serverless de Vercel.

## Ejecutar en local

### 1) Backend

```bash
cd server
npm install
npm run dev
```

Servidor en `http://localhost:3000`.

### 2) Frontend

Abrir `maquetacion-app/index.html` con Live Server (o servidor local equivalente).

## Documentacion adicional

- Documentacion tecnica del backend: `server/README.md`
- Documento teorico de herramientas API: `docs/backend-api.md`

