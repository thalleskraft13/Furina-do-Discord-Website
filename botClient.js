// botClient.js
const { Client, GatewayIntentBits } = require("discord.js");
require("dotenv").config();

const client = new Client({
  intents: [GatewayIntentBits.Guilds] 
});

client.login(process.env.BOT_TOKEN);

client.once("ready", () => {
  console.log(`🤖 Bot conectado como ${client.user.tag}`);
});

module.exports = client;
