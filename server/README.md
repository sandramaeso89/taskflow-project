# Server TaskFlow (documentacion tecnica)

Este README explica la parte backend del proyecto TaskFlow.

## Stack

- Node.js
- Express
- dotenv
- cors
- swagger-ui-express + yamljs

## Objetivo del backend

Dar una API REST para tareas y centralizar la logica fuera del frontend.

## Arquitectura por capas

Dentro de `src/`:

- `routes/` -> define endpoints
- `controllers/` -> valida datos y responde HTTP
- `services/` -> logica de negocio (sin req/res)
- `middlewares/` -> logger y manejo global de errores
- `config/` -> variables de entorno
- `docs/` -> OpenAPI (`openapi.yaml`)

## Persistencia actual

Se usa un array en memoria en `src/services/task.service.js`.

Importante:

- si reinicias el servidor, se reinicia el contenido del array
- para la practica sirve, pero no es base de datos real

## Variables de entorno

Archivo: `server/.env`

```env
PORT=3000
```

Validacion en `src/config/env.js`:

- si no existe `PORT`, el servidor lanza error y no arranca

## Scripts

```bash
npm run dev    # nodemon src/index.js
npm start      # node src/index.js
```

## Endpoints

Base local: `http://localhost:3000`

### Salud

- `GET /health` -> estado del servidor

### Tareas (v1)

- `GET /api/v1/tasks`
- `POST /api/v1/tasks`
- `PATCH /api/v1/tasks/:id`
- `PUT /api/v1/tasks/:id`
- `DELETE /api/v1/tasks/:id`

### Endpoint de prueba de error

- `GET /api/v1/tasks/_test/error500`

Se usa para comprobar el middleware global de errores.

## Validaciones y errores

En controladores:

- titulo vacio o invalido -> `400`
- id inexistente en borrado/edicion -> `404`

En middleware global (`error.middleware.js`):

- `NOT_FOUND` -> `404`
- resto de errores no controlados -> `500`

## Swagger

Local:

- `http://localhost:3000/api-docs`

Produccion:

- `https://taskflow-project-25oy.vercel.app/api-docs`

Archivo OpenAPI:

- `src/docs/openapi.yaml`

## Como probar rapido con curl

```bash
curl -X GET http://localhost:3000/health
curl -X GET http://localhost:3000/api/v1/tasks
curl -X POST http://localhost:3000/api/v1/tasks -H "Content-Type: application/json" -d '{"titulo":"Tarea de prueba"}'
curl -X DELETE http://localhost:3000/api/v1/tasks/999
curl -X GET http://localhost:3000/api/v1/tasks/_test/error500
```

## Despliegue en Vercel (backend)

Este backend se despliega como serverless usando:

- `api/index.js` (entrypoint para Vercel)
- `vercel.json` (config de rutas/build)

Al hacer push a `main`, Vercel redespliega automaticamente.
