const dotenv = require("dotenv");

dotenv.config();

if (!process.env.PORT) {
  throw new Error("El puerto no está definido");
}

module.exports = {
  port: Number(process.env.PORT),
};
