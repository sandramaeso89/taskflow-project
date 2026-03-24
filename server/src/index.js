const { port } = require("./config/env");
const app = require("./app");

// Arranca el servidor en el puerto configurado en .env.
app.listen(port, () => {
  console.log(`API escuchando en http://localhost:${port}`);
});
