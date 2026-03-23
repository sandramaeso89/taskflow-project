const dotenv = require("dotenv");

// Carga variables de entorno desde el archivo .env a process.env.
dotenv.config();

// Si no hay puerto, no arrancamos: mejor fallar pronto que romper en runtime.
if (!process.env.PORT) {
  throw new Error("El puerto no está definido");
}

module.exports = {
  // Exportamos el puerto como número para usarlo en app.listen(...).
  port: Number(process.env.PORT),
};
