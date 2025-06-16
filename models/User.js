
const mongoose = require("mongoose");

const guildSchema = new mongoose.Schema({
  id: String,
  name: String,
  icon: String,
  permissions: Number
});

const userSchema = new mongoose.Schema({
  discordId: String,
  username: String,
  discriminator: String,
  avatar: String,
  locale: String,
  mfaEnabled: Boolean,
  premiumType: Number,
  guilds: [guildSchema]
});

module.exports = mongoose.model("User", userSchema);
