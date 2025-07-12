const express = require("express");
const router = express.Router();
const User = require("../models/User");
const client = require("../botClient");

function checkAuth(req, res, next) {
  if (req.isAuthenticated()) return next();
  res.redirect("/login");
}

router.get("/", checkAuth, async (req, res) => {
  const user = await User.findById(req.user._id);
  if (!user) return res.redirect("/login");
  res.render("dashboard", { user, guilds: user.guilds });
});

router.get("/:guildId", checkAuth, async (req, res) => {
  const guildId = req.params.guildId;
  const user = await User.findById(req.user._id);
  const guildUser = user.guilds.find(g => g.id === guildId);
  const guildBot = client.guilds.cache.get(guildId);

  if (!guildUser) return res.status(403).send("Sem permissão.");
  if (!guildBot) {
    const invite = `https://discord.com/oauth2/authorize?client_id=${process.env.CLIENT_ID}&scope=bot&permissions=8&guild_id=${guildId}&response_type=code&redirect_uri=${encodeURIComponent(process.env.CALLBACK_URL)}`;
    return res.redirect(invite);
  }

  res.render("servidor/menu", { user, guild: guildUser });
});

module.exports = router;
