const express = require("express");
const router = express.Router();
const Servidor = require("../models/Servidor");
const User = require("../models/User");
const MsgModel = require("../models/msg");
const client = require("../botClient");

function checkAuth(req, res, next) {
  if (req.isAuthenticated()) return next();
  res.redirect("/login");
}

// EMBED
router.get("/:guildId/embed", checkAuth, async (req, res) => {
  const guildId = req.params.guildId;
  const user = await User.findById(req.user._id);
  const guildUser = user.guilds.find(g => g.id === guildId);
  const guildBot = client.guilds.cache.get(guildId);

  if (!guildUser || !guildBot) return res.status(403).send("Sem acesso.");

  const channels = guildBot.channels.cache
    .filter(c => c.isTextBased() && c.viewable)
    .map(c => ({ id: c.id, name: c.name }))
    .sort((a, b) => a.name.localeCompare(b.name));

  res.render("servidor/embed", {
    user,
    guild: guildUser,
    channels,
    error: null,
    success: null
  });
});

router.post("/:guildId/embed", checkAuth, async (req, res) => {
  const { channelId, title, description, color, image, thumbnail, footer, author, content } = req.body;
  const guildId = req.params.guildId;

  if (!description) return res.status(400).send("Descrição é obrigatória.");

  const embed = {
    title: title || undefined,
    description,
    color: color ? parseInt(color.replace("#", ""), 16) : undefined,
    image: image ? { url: image } : undefined,
    thumbnail: thumbnail ? { url: thumbnail } : undefined,
    footer: footer ? { text: footer } : undefined,
    author: author ? { name: author } : undefined,
  };

  try {
    const guild = client.guilds.cache.get(guildId);
    const channel = guild.channels.cache.get(channelId);
    const botMember = guild.members.me;

    const permissions = channel.permissionsFor(botMember);
    if (!permissions.has("SendMessages") && !permissions.has("Administrator"))
      throw new Error(`Sem permissão para enviar no canal #${channel.name}`);
    if ((image || thumbnail) && !permissions.has("EmbedLinks") && !permissions.has("Administrator"))
      throw new Error(`Sem permissão para embeds em #${channel.name}`);

    await channel.send({ content: content || null, embeds: [embed] });

    const user = await User.findById(req.user._id);
    const guildUser = user.guilds.find(g => g.id === guildId);
    const channels = guild.channels.cache
      .filter(c => c.isTextBased() && c.viewable)
      .map(c => ({ id: c.id, name: c.name }))
      .sort((a, b) => a.name.localeCompare(b.name));

    res.render("servidor/embed", {
      user,
      guild: guildUser,
      channels,
      error: null,
      success: "Embed enviada com sucesso!"
    });
  } catch (err) {
    console.error("Erro ao enviar embed:", err);
    const user = await User.findById(req.user._id);
    const guildUser = user.guilds.find(g => g.id === guildId);
    const guildBot = client.guilds.cache.get(guildId);
    const channels = guildBot.channels.cache
      .filter(c => c.isTextBased() && c.viewable)
      .map(c => ({ id: c.id, name: c.name }))
      .sort((a, b) => a.name.localeCompare(b.name));

    res.render("servidor/embed", {
      user,
      guild: guildUser,
      channels,
      error: err.message || "Erro ao enviar embed.",
      success: null
    });
  }
});

// LOGS
router.get("/:guildId/logs", checkAuth, async (req, res) => {
  const guildId = req.params.guildId;
  const user = await User.findById(req.user._id);
  const guildUser = user.guilds.find(g => g.id === guildId);
  const guildBot = client.guilds.cache.get(guildId);

  if (!guildUser || !guildBot) return res.status(403).send("Sem acesso.");

  let db = await Servidor.findOne({ serverId: guildId });
  if (!db) {
    db = await new Servidor({ serverId: guildId, logs: { react: false } }).save();
  }

  const channels = guildBot.channels.cache
    .filter(c => c.isTextBased() && c.viewable)
    .map(c => ({ id: c.id, name: c.name }))
    .sort((a, b) => a.name.localeCompare(b.name));

  res.render("servidor/logs", {
    user,
    guild: guildUser,
    channels,
    logs: db.logs.react,
    error: null,
    success: null
  });
});

router.post("/:guildId/logs", async (req, res) => {
  const guildId = req.params.guildId;
  const { activated, selectedChannel } = req.body;

  try {
    let servidor = await Servidor.findOne({ serverId: guildId });
    if (!servidor) {
      servidor = new Servidor({ serverId: guildId, logs: { react: { ativado: false, channel: null } } });
    }

    servidor.logs.react.ativado = activated;
    servidor.logs.react.channel = selectedChannel || null;
    await servidor.save();

    res.redirect(`/dashboard/${guildId}/logs?success=1`);
  } catch (err) {
    console.error(err);
    res.redirect(`/dashboard/${guildId}/logs?error=Erro ao salvar configurações`);
  }
});

// MENSAGEM AUTOMÁTICA
router.get("/:guildId/mensagem-automatica", checkAuth, async (req, res) => {
  const { guildId } = req.params;
  const mensagens = await MsgModel.find({ serverId: guildId });

  res.render("servidor/mensagem-automatica", {
    user: req.user,
    guild: { id: guildId, name: req.guildName || "Servidor" },
    mensagens,
    success: req.query.success,
    error: req.query.error,
    deleted: req.query.deleted,
  });
});

router.post("/:guildId/mensagem-automatica", async (req, res) => {
  const { guildId } = req.params;
  const { action, chaveDeMsg, resposta } = req.body;

  try {
    if (action === "create") {
      if (!chaveDeMsg || !resposta) {
        return res.redirect(`/dashboard/${guildId}/mensagem-automatica?error=Todos os campos são obrigatórios`);
      }
      const existente = await MsgModel.findOne({ serverId: guildId, chaveDeMsg });
      if (existente) {
        return res.redirect(`/dashboard/${guildId}/mensagem-automatica?error=Já existe uma mensagem com essa chave`);
      }
      await MsgModel.create({ serverId: guildId, chaveDeMsg, resposta });
      return res.redirect(`/dashboard/${guildId}/mensagem-automatica?success=Mensagem criada com sucesso`);
    }

    if (action === "edit") {
      const editada = await MsgModel.findOneAndUpdate(
        { serverId: guildId, chaveDeMsg },
        { resposta },
        { new: true }
      );
      if (!editada) {
        return res.redirect(`/dashboard/${guildId}/mensagem-automatica?error=Mensagem não encontrada`);
      }
      return res.redirect(`/dashboard/${guildId}/mensagem-automatica?success=Mensagem editada com sucesso`);
    }

    if (action === "delete") {
      const deletada = await MsgModel.findOneAndDelete({ serverId: guildId, chaveDeMsg });
      if (!deletada) {
        return res.redirect(`/dashboard/${guildId}/mensagem-automatica?error=Mensagem não encontrada para deletar`);
      }
      return res.redirect(`/dashboard/${guildId}/mensagem-automatica?deleted=Mensagem deletada com sucesso`);
    }

    return res.redirect(`/dashboard/${guildId}/mensagem-automatica?error=Ação inválida`);
  } catch (err) {
    console.error("Erro ao salvar mensagem automática:", err);
    return res.redirect(`/dashboard/${guildId}/mensagem-automatica?error=Erro interno do servidor`);
  }
});

module.exports = router;
