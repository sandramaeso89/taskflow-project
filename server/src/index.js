const express = require("express");
const cors = require("cors");
const { port } = require("./config/env");
const taskRoutes = require("./routes/task.routes");

// Creamos la app de Express (nuestro servidor HTTP).
const app = express();

// Permite que el frontend (otro origen/puerto) pueda llamar a esta API.
app.use(cors());
// Convierte automáticamente JSON de entrada en req.body.
app.use(express.json());
// Todas las rutas de tareas vivirán bajo /api/v1/tasks.
app.use("/api/v1/tasks", taskRoutes);

// Endpoint de "pulso": sirve para comprobar rápidamente que el backend está vivo.
app.get("/health", (req, res) => {
  res.status(200).json({ ok: true, service: "taskflow-api" });
});

// Arranca el servidor en el puerto configurado en .env.
app.listen(port, () => {
  console.log(`API escuchando en http://localhost:${port}`);
});
