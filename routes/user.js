// routes/user.js
const express = require("express");
const router = express.Router();
const UserDb = require("../models/Usuario");
const GuildaDb = require("../models/guilda");
const client = require("../botClient");
const path = require("path");
const fs = require("fs");

// Middleware de autenticação
function checkAuth(req, res, next) {
  if (req.isAuthenticated && req.isAuthenticated()) return next();
  return res.redirect("/login");
}

// PERFIL - GET
router.get("/perfil", checkAuth, async (req, res) => {
  try {
    let db = await UserDb.findOne({ id: req.user.discordId });
    if (!db) db = await new UserDb({ id: req.user.discordId }).save();

    // Leitura dos temas (imagens .png na pasta)
    const dir = path.join(__dirname, "..", "public", "personagem", "temas");
    const arquivos = fs.readdirSync(dir).filter(f => f.endsWith(".png"));

    const temas = [];
    if (arquivos.includes("0.png")) temas.push({ nome: "0" });

    const nomesPersonagens = (db.personagens || []).map(p => p.nome);
    arquivos.forEach(file => {
      const nome = path.parse(file).name;
      if (nome !== "0" && nomesPersonagens.includes(nome)) temas.push({ nome });
    });

    return res.render("user/perfil", {
      user: req.user,
      db,
      temas,
      temaAtual: db.perfil?.tema || "0"
    });
  } catch (err) {
    console.error(err);
    return res.status(500).send("Erro ao carregar perfil.");
  }
});

// PERFIL - POST tema
router.post("/perfil/tema", checkAuth, async (req, res) => {
  try {
    const { tema } = req.body;
    await UserDb.updateOne({ id: req.user.discordId }, { "perfil.tema": tema });
    return res.redirect("/perfil");
  } catch (err) {
    console.error(err);
    return res.status(500).send("Erro ao atualizar tema.");
  }
});

// GUILDA - GET página ejs
router.get("/guilda", checkAuth, async (req, res) => {
  try {
    const userId = req.user.discordId;
    const userdb = await UserDb.findOne({ id: userId });
    if (!userdb) return res.redirect("/login");

    if (!userdb.guilda || userdb.guilda === "0") {
      return res.render("user/guilda", {
        user: req.user,
        estaNaGuilda: false,
        guilda: null,
        membrosInfo: {}
      });
    }

    const guilda = await GuildaDb.findOne({ tag: userdb.guilda });
    if (!guilda) {
      userdb.guilda = "0";
      await userdb.save();
      return res.render("user/guilda", {
        user: req.user,
        estaNaGuilda: false,
        guilda: null,
        membrosInfo: {},
        erro: "Guilda não encontrada. Sua afiliação foi resetada."
      });
    }

    const isLider = guilda.dono === userId;
    const membrosInfo = {};

    await Promise.all(
      guilda.membros.map(async membro => {
        try {
          const user = await client.users.fetch(membro.id);
          membrosInfo[membro.id] = {
            username: user.username,
            id: user.id,
            avatar: user.displayAvatarURL({ format: "png", size: 128 })
          };
        } catch {
          membrosInfo[membro.id] = {
            username: "Desconhecido",
            id: membro.id,
            avatar: "https://cdn.discordapp.com/embed/avatars/0.png"
          };
        }
      })
    );

    return res.render("user/guilda", {
      user: req.user,
      estaNaGuilda: true,
      guilda,
      isLider,
      membrosInfo
    });
  } catch (err) {
    console.error("Erro ao carregar guilda:", err);
    return res.status(500).send("Erro ao carregar guilda.");
  }
});

// GUILDA - POST criar
router.post("/guilda/criar", checkAuth, async (req, res) => {
  try {
    const userId = req.user.discordId;
    const { nome, descricao } = req.body;

    if (!nome || nome.length < 3 || nome.length > 30)
      return res.status(400).json({ erro: "Nome inválido." });

    const userdb = await UserDb.findOne({ id: userId });
    if (!userdb) return res.status(404).json({ erro: "Usuário não encontrado." });
    if (userdb.guilda && userdb.guilda !== "0")
      return res.status(400).json({ erro: "Você já está em uma guilda." });

    const tag = Math.random().toString(36).substring(2, 6).toUpperCase();

    const nova = new GuildaDb({
      nome,
      tag,
      descricao,
      nivel: 1,
      xp: 0,
      primogemas: 0,
      mora: 0,
      dono: userId,
      membros: [{ id: userId, cargo: "Líder", entrouEm: Date.now() }],
      missoes: []
    });

    await nova.save();

    userdb.guilda = tag;
    await userdb.save();

    return res.json({ sucesso: true });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ erro: "Erro interno." });
  }
});

// GUILDA - POST sair
router.post("/guilda/sair", checkAuth, async (req, res) => {
  try {
    const userId = req.user.discordId;
    const userdb = await UserDb.findOne({ id: userId });
    if (!userdb) return res.status(404).json({ erro: "Usuário não encontrado." });
    if (!userdb.guilda || userdb.guilda === "0")
      return res.status(400).json({ erro: "Você não está em uma guilda." });

    const guilda = await GuildaDb.findOne({ tag: userdb.guilda });
    if (!guilda) {
      userdb.guilda = "0";
      await userdb.save();
      return res.json({ sucesso: true, mensagem: "Guilda não existia mais." });
    }

    const membro = guilda.membros.find(m => m.id === userId);
    if (!membro) {
      userdb.guilda = "0";
      await userdb.save();
      return res.json({ sucesso: true });
    }

    if (membro.cargo === "Líder") {
      return res.status(403).json({ erro: "Líder não pode sair sem transferir liderança." });
    }

    guilda.membros = guilda.membros.filter(m => m.id !== userId);

    if (guilda.membros.length === 0) {
      await GuildaDb.deleteOne({ _id: guilda._id });
    } else {
      await guilda.save();
    }

    userdb.guilda = "0";
    await userdb.save();

    return res.json({ sucesso: true, mensagem: "Você saiu da guilda." });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ erro: "Erro interno." });
  }
});

// GUILDA - POST deletar
router.post("/guilda/deletar", checkAuth, async (req, res) => {
  try {
    const userId = req.user.discordId;
    const userdb = await UserDb.findOne({ id: userId });
    if (!userdb) return res.status(404).json({ erro: "Usuário não encontrado." });
    if (!userdb.guilda || userdb.guilda === "0")
      return res.status(400).json({ erro: "Você não está em uma guilda." });

    const guilda = await GuildaDb.findOne({ tag: userdb.guilda });
    if (!guilda) {
      userdb.guilda = "0";
      await userdb.save();
      return res.json({ sucesso: true, mensagem: "Guilda não existia mais." });
    }

    if (guilda.dono !== userId) {
      return res.status(403).json({ erro: "Apenas o líder pode deletar a guilda." });
    }

    await GuildaDb.deleteOne({ _id: guilda._id });

    await UserDb.updateMany(
      { guilda: guilda.tag },
      { $set: { guilda: "0" } }
    );

    return res.json({ sucesso: true, mensagem: "Guilda apagada com sucesso." });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ erro: "Erro interno." });
  }
});

module.exports = router;
