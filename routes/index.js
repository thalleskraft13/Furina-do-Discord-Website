const express = require("express");
const router = express.Router();
const client = require("../botClient")
// Página inicial
router.get("/", (req, res) => {
  res.render("index", { user: req.user, client });
});

// Página de comandos
router.get("/comandos", (req, res) => {
  res.render("comandos", { user: req.user });
});

// Página de termos de uso
router.get("/termos", (req, res) => {
  res.render("termos", { user: req.user });
});

// Página de política de privacidade
router.get("/privacidade", (req, res) => {
  res.render("política-de-privacidade", { user: req.user });
});

// Teste de ping
router.get("/ping", (req, res) => {
  res.send("pong");
});

module.exports = router;
