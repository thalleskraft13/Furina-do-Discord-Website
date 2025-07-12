const express = require("express");
const router = express.Router();
const Usuarios = require("../models/Usuario"); 
const client = require("../botClient");
const { EmbedBuilder } = require("discord.js");

// Rota do webhook top.gg para votos
router.post("/topgg/voto", async (req, res) => {
  try {
    // Verifica o token do cabeçalho Authorization
    const tokenRecebido = req.headers.authorization;
    if (tokenRecebido !== process.env.topgg) {
      return res.status(403).send("Token inválido.");
    }

    const userId = req.body.user;

    if (!userId) return res.status(400).send("User ID is required.");

    let userDb = await Usuarios.findOne({ id: userId });

    if (!userDb) {
      userDb = new Usuarios({ id: userId, primogemas: 0 });
    }

    // Adiciona 10x 160 primogemas (1600)
    userDb.primogemas += 160 * 10;

    await userDb.save();

    // Pega o usuário no client
    const user = await client.users.fetch(userId).catch(() => null);

    // Embed para DM
    const embedDM = new EmbedBuilder()
      .setColor("#0a75ad")
      .setTitle("✨ Obrigada pelo voto! ✨")
      .setDescription(
        "Querido viajante, sua bondade ilumina nossos caminhos! 🌊\n" +
        "Por sua gentileza, aqui estão **1600 Primogemas** para fortalecer sua jornada.\n" +
        "Que a maré da sorte esteja sempre a seu favor, e que nunca lhe falte a inspiração para conquistar novas aventuras.\n" +
        "Fique comigo, e juntos dominaremos as correntes do destino."
      )
      .setFooter({ text: "Furina te agradece com todo seu coração 💙" });

    // Embed para log público
    const embedLog = new EmbedBuilder()
      .setColor("#0a75ad")
      .setTitle("📢 Novo voto recebido!")
      .setDescription(
        `O navegante [**${user ? user.username : "Usuário desconhecido"}**](https://discord.com/users/${userId}) acaba de lançar sua bênção sobre nós!\n` +
        "Seu voto é como uma brisa fresca que traz energias poderosas para nossas águas.\n" +
        "Que as ondas da fortuna te levem longe, bravo viajante!"
      );

    // Enviar DM ao usuário se possível
    if (user) {
      user.send({ embeds: [embedDM] }).catch(() => {
        console.log(`Não foi possível enviar DM para o usuário ${userId}.`);
      });
    }

    // Enviar embed no canal público (log)
    const logChannel = await client.channels.fetch("1393573260729384960").catch(() => null);
    if (logChannel && logChannel.isTextBased()) {
      logChannel.send({ embeds: [embedLog] }).catch(console.error);
    }

    res.status(200).send("Voto registrado com sucesso!");
  } catch (error) {
    console.error("Erro ao processar voto do Top.gg:", error);
    res.status(500).send("Erro interno ao processar voto.");
  }
});

module.exports = router;
