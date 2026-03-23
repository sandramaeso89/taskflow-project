const express = require("express");
const cors = require("cors");
const { port } = require("./config/env");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/health", (req, res) => {
  res.status(200).json({ ok: true, service: "taskflow-api" });
});

app.listen(port, () => {
  console.log(`API escuchando en http://localhost:${port}`);
});
