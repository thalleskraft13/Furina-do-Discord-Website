const express = require("express");
const router = express.Router();
const UserDb = require("../models/Usuario");
const fs = require("fs");
const path = require("path");

// Middleware para proteger rotas
function checkAuth(req, res, next) {
  if (req.isAuthenticated()) return next();
  res.redirect("/login");
}

// Página perfil do usuário
router.get("/perfil", checkAuth, async (req, res) => {
  const user = req.user;
  let db = await UserDb.findOne({ id: req.user.discordId });
  if (!db) {
    db = await new UserDb({ id: req.user.discordId }).save();
  }

  const dir = path.join(__dirname, "..", "public", "personagem", "temas");
  const arquivos = fs.readdirSync(dir).filter(f => f.endsWith(".png"));

  const temas = [];
  if (arquivos.includes("0.png")) {
    temas.push({ nome: "0" });
  }

  const nomesPersonagens = (db.personagens || []).map(p => p.nome);
  arquivos.forEach((file) => {
    const nome = path.parse(file).name;
    if (nome !== "0" && nomesPersonagens.includes(nome)) {
      temas.push({ nome });
    }
  });

  res.render("user/perfil", {
    user,
    db,
    temas,
    temaAtual: db.perfil.tema || "0"
  });
});

// Atualizar tema do perfil
router.post("/perfil/tema", checkAuth, async (req, res) => {
  const { tema } = req.body;
  await UserDb.updateOne(
    { id: req.user.discordId },
    { "perfil.tema": tema }
  );
  res.redirect("/perfil");
});

// Recompensas diárias (GET)
router.get("/recompensas", checkAuth, async (req, res) => {
  let db = await UserDb.findOne({ id: req.user.discordId });

  if (!db) {
    let newuser = new UserDb({ id: req.user.discordId });
    await newuser.save();
    db = await UserDb.findOne({ id: req.user.discordId });
  }

  res.render("user/daily", { user: req.user, db });
});

// Recompensas diárias (POST)
router.post("/recompensas", checkAuth, async (req, res) => {
  try {
    const userId = req.user.discordId;
    const userDb = await UserDb.findOne({ id: userId });

    if (!userDb) {
      return res.status(404).json({ erro: "Usuário não encontrado." });
    }

    if (!userDb.level || userDb.level.ar < 16) {
      return res.status(403).json({ erro: "Você precisa ser AR 16 ou mais para resgatar." });
    }

    const agora = Date.now();
    const ultimoResgate = userDb.daily || 0;
    const tempoRestante = 86400000 - (agora - ultimoResgate); // 24h em ms

    if (tempoRestante > 0) {
      return res.status(429).json({
        erro: "Aguarde para resgatar novamente.",
        tempoRestante
      });
    }

    // Recompensa aleatória entre 60 e 300
    const recompensa = Math.floor(Math.random() * (300 - 60 + 1)) + 60;

    userDb.primogemas += recompensa;
    userDb.daily = agora;
    await userDb.save();

    return res.json({ sucesso: true, recompensa });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ erro: "Erro interno do servidor." });
  }
});

// Eventos
router.get("/eventos", checkAuth, (req, res) => {
  res.render("user/eventos", { user: req.user });
});

// Mochila
router.get("/mochila", checkAuth, (req, res) => {
  res.render("desenvolvimento", { user: req.user });
});

// Loja
router.get("/loja", checkAuth, (req, res) => {
  res.render("desenvolvimento", { user: req.user });
});

// Missões
router.get("/missoes", checkAuth, (req, res) => {
  res.render("desenvolvimento", { user: req.user });
});

// Ping (teste)
router.get("/ping", (req, res) => {
  res.send("pong");
});

module.exports = router;
