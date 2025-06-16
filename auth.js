const passport = require("passport");
const DiscordStrategy = require("passport-discord").Strategy;
const User = require("./models/User");
require("dotenv").config();

passport.serializeUser((user, done) => {
  // Serializa apenas o MongoDB _id como string
  done(null, user._id.toString());
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

passport.use(new DiscordStrategy({
  clientID: process.env.CLIENT_ID,
  clientSecret: process.env.CLIENT_SECRET,
  callbackURL: process.env.CALLBACK_URL,
  scope: ["identify", "guilds"]
}, async (accessToken, refreshToken, profile, done) => {
  try {
    // Filtra guilds onde o usuário tem permissão ADMINISTRATOR ou MANAGE_GUILD
    const filteredGuilds = profile.guilds?.filter(guild => {
      const perms = BigInt(guild.permissions);
      return (
        (perms & BigInt(0x00000008n)) || // ADMINISTRATOR
        (perms & BigInt(0x00000020n))    // MANAGE_GUILD
      );
    }) || [];

    let user = await User.findOne({ discordId: profile.id });

    const dataToUpdate = {
      username: profile.username,
      discriminator: profile.discriminator,
      avatar: profile.avatar,
      locale: profile.locale,
      mfaEnabled: profile.mfa_enabled,
      premiumType: profile.premium_type,
      guilds: filteredGuilds.map(g => ({
        id: g.id,
        name: g.name,
        icon: g.icon,
        permissions: g.permissions
      })),
      accessToken // opcional: salvar token no banco para atualizar guilds depois
    };

    if (user) {
      Object.assign(user, dataToUpdate);
      await user.save();
    } else {
      user = await User.create({
        discordId: profile.id,
        ...dataToUpdate
      });
    }

    // Retorna o objeto Mongoose para o serializeUser funcionar corretamente
    return done(null, user);

  } catch (err) {
    console.error("Erro na estratégia Discord:", err);
    return done(err, null);
  }
}));

module.exports = passport;
