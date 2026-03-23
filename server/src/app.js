const express = require("express");
const cors = require("cors");
const swaggerUi = require("swagger-ui-express");
const YAML = require("yamljs");
const taskRoutes = require("./routes/task.routes");
const { loggerAcademico } = require("./middlewares/logger.middleware");
const { errorHandler } = require("./middlewares/error.middleware");

const app = express();

// Middlewares globales de red
app.use(cors());
app.use(express.json());
app.use(loggerAcademico);

// Documentación interactiva (no debe tumbar la API si falla en serverless).
let swaggerEnabled = false;
try {
  const swaggerDocument = YAML.load(`${__dirname}/docs/openapi.yaml`);
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));
  swaggerEnabled = true;
} catch (error) {
  console.error("[Swagger] No se pudo cargar openapi.yaml:", error.message);
}

// Rutas de negocio
app.use("/api/v1/tasks", taskRoutes);
app.get("/health", (req, res) => {
  res.status(200).json({ ok: true, service: "taskflow-api", swaggerEnabled });
});

// Middleware final de errores
app.use(errorHandler);

module.exports = app;
