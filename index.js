const express = require("express");
const session = require("express-session");
const passport = require("./auth");
const mongoose = require("mongoose");
const MongoStore = require("connect-mongo");
const Servidor = require("./models/Servidor")
const UserDb = require("./models/Usuario");
const path = require("path");
require("dotenv").config();

const User = require("./models/User");
const client = require("./botClient");

const app = express();

// Conectar MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => console.log("🟢 MongoDB conectado"))
  .catch(err => console.error("🔴 Erro ao conectar MongoDB:", err));

// Sessão com MongoDB
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: process.env.MONGO_URI,
    collectionName: "sessions"
  }),
  cookie: {
    maxAge: 1000 * 60 * 60 * 24 * 7 // 7 dias
  }
}));

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static("public"));
app.use(passport.initialize());
app.use(passport.session());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Middleware para proteger rotas
function checkAuth(req, res, next) {
  if (req.isAuthenticated()) return next();
  res.redirect("/login");
}

// Rotas
app.get("/", (req, res) => {
  res.render("index", { user: req.user });
});

app.get("/comandos", (req, res) => {
  res.render("comandos", { user: req.user });
});

app.get("/termos", (req, res) => {
  res.render("termos", { user: req.user });
})

app.get("/privacidade", (req, res) => {
  res.render("política-de-privacidade", { user: req.user})
})

app.get("/login", passport.authenticate("discord"));

app.get("/auth/discord/callback", passport.authenticate("discord", {
  failureRedirect: "/"
}), (req, res) => {
  res.redirect("/dashboard");
});

app.get("/dashboard", checkAuth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.redirect("/login");

    res.render("dashboard", {
      user,
      guilds: user.guilds
    });
  } catch (err) {
    console.error("Erro ao carregar dashboard:", err);
    res.status(500).send("Erro ao carregar dashboard.");
  }
});

// Página do servidor /dashboard/:guildId
app.get("/dashboard/:guildId", checkAuth, async (req, res) => {
  const guildId = req.params.guildId;

  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.redirect("/login");

    // Verifica se usuário tem permissão nesse servidor
    const guildUser = user.guilds.find(g => g.id === guildId);

    // Verifica se o bot está nesse servidor
    const guildBot = client.guilds.cache.get(guildId);

    if (!guildUser) {
      return res.status(403).send("Você não tem permissão para acessar esse servidor.");
    }

    if (!guildBot) {
      // Link de convite do bot para o servidor
      const inviteUrl = `https://discord.com/oauth2/authorize?client_id=${process.env.CLIENT_ID}&scope=bot&permissions=8&guild_id=${guildId}&response_type=code&redirect_uri=${encodeURIComponent(process.env.CALLBACK_URL)}`;
      return res.redirect(inviteUrl);
    }

    // Renderiza página do servidor
    res.render("servidor/menu", {
      user,
      guild: guildUser
    });

  } catch (err) {
    console.error("Erro ao carregar dashboard com guild:", err);
    res.status(500).send("Erro ao carregar dashboard do servidor.");
  }
});

app.get("/logout", (req, res) => {
  req.logout(() => res.redirect("/"));
});

// Atualiza lista de servidores
app.get("/atualizar-servidores", checkAuth, async (req, res) => {
  res.redirect("/login");
});

// Página de enviar embed
app.get("/dashboard/:guildId/embed", checkAuth, async (req, res) => {
  const guildId = req.params.guildId;

  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.redirect("/login");

    const guildUser = user.guilds.find(g => g.id === guildId);
    const guildBot = client.guilds.cache.get(guildId);

    if (!guildUser || !guildBot) return res.status(403).send("Sem acesso.");

    // Filtra todos os canais de texto visíveis ao bot
    const channels = guildBot.channels.cache
      .filter(c => c.isTextBased() && c.viewable)
      .map(c => ({
        id: c.id,
        name: c.name,
        type: c.type
      }))
      .sort((a, b) => a.name.localeCompare(b.name));

    res.render("servidor/embed", {
      user,
      guild: guildUser,
      channels,
      error: null,
      success: null
    });
  } catch (err) {
    console.error("Erro ao carregar página de embed:", err);
    res.status(500).send("Erro ao carregar página de embed.");
  }
});

// POST para enviar embed
app.post("/dashboard/:guildId/embed", checkAuth, async (req, res) => {
  const { channelId, title, description, color, image, thumbnail, footer, author, content } = req.body;
  const guildId = req.params.guildId;

  if (!description) {
    return res.status(400).send("Descrição é obrigatória.");
  }

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
    if (!guild) return res.status(404).send("Servidor não encontrado.");

    const channel = guild.channels.cache.get(channelId);
    if (!channel || !channel.isTextBased()) {
      throw new Error("Canal inválido ou indisponível.");
    }

    const botMember = guild.members.me;
    if (!botMember) throw new Error("Não foi possível obter as permissões do bot.");

    const permissions = channel.permissionsFor(botMember);

    // Verifica se tem permissão de enviar mensagem OU permissão Administrator
    if (!permissions.has("SendMessages") && !permissions.has("Administrator")) {
      throw new Error(`Furina não pode enviar mensagens no canal #${channel.name}!`);
    }

    // Se tentar enviar mídia, verificar permissão EmbedLinks
    if ((image || thumbnail) && !permissions.has("EmbedLinks") && !permissions.has("Administrator")) {
      throw new Error(`Furina não tem permissão de inserir links ou mídias no canal #${channel.name}.`);
    }

    await channel.send({
      content: content || null,
      embeds: [embed]
    });

    // Carregar dados para renderizar novamente a página com sucesso
    const user = await User.findById(req.user._id);
    const guildUser = user.guilds.find(g => g.id === guildId);
    const guildBot = client.guilds.cache.get(guildId);
    const channels = guildBot.channels.cache
      .filter(c => c.isTextBased() && c.viewable)
      .map(c => ({ id: c.id, name: c.name, type: c.type }))
      .sort((a, b) => a.name.localeCompare(b.name));

    return res.render("servidor/embed", {
      user,
      guild: guildUser,
      channels,
      error: null,
      success: "Embed enviada com sucesso!"
    });

  } catch (err) {
    console.error("Erro ao enviar embed:", err);

    // Carregar dados para renderizar novamente a página com erro
    const user = await User.findById(req.user._id);
    const guildUser = user.guilds.find(g => g.id === guildId);
    const guildBot = client.guilds.cache.get(guildId);
    const channels = guildBot.channels.cache
      .filter(c => c.isTextBased() && c.viewable)
      .map(c => ({ id: c.id, name: c.name, type: c.type }))
      .sort((a, b) => a.name.localeCompare(b.name));

    return res.render("servidor/embed", {
      user,
      guild: guildUser,
      channels,
      error: err.message || "Erro inesperado ao enviar embed.",
      success: null
    });
  }
});



app.get("/dashboard/:guildId/logs", checkAuth, async (req, res) => {
  const guildId = req.params.guildId;

  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.redirect("/login");

    const guildUser = user.guilds.find(g => g.id === guildId);
    const guildBot = client.guilds.cache.get(guildId);

    if (!guildUser || !guildBot) return res.status(403).send("Sem acesso.");

    // Filtra todos os canais de texto visíveis ao bot
    const channels = guildBot.channels.cache
      .filter(c => c.isTextBased() && c.viewable)
      .map(c => ({
        id: c.id,
        name: c.name,
        type: c.type
      }))
      .sort((a, b) => a.name.localeCompare(b.name));

    // Busca ou cria documento Servidor
    let db = await Servidor.findOne({ serverId: guildId });

    if (!db) {
      // Cria documento novo, com serverId correto
      const novo = new Servidor({ serverId: guildId, logs: { react: false } });
      await novo.save();
      db = novo;
    }

    console.log(db.logs.react)

    // Envia status para o template: logs.react (boolean)
    res.render("servidor/logs", {
      user,
      guild: guildUser,
      channels,
      error: null,
      success: null,
      logs: db.logs.react
    });
  } catch (err) {
    console.error("Erro ao carregar página de logs:", err);
    res.status(500).send("Erro ao carregar página de logs.");
  }
});

app.post('/dashboard/:guildId/logs', async (req, res) => {
  const guildId = req.params.guildId;
  const { activated, selectedChannel } = req.body;
  console.log(activated, selectedChannel)

  try {
    let servidor = await Servidor.findOne({ serverId: guildId });

    if (!servidor) {
      // Cria novo documento se não existir
      servidor = new Servidor({
        serverId: guildId,
        logs: { react: { ativado: false, channel: null } }
      });
    }

    servidor.logs.react.ativado = activated;;
    servidor.logs.react.channel = selectedChannel || null;

    await servidor.save();

    res.redirect(`/dashboard/${guildId}/logs?success=1`);
  } catch (err) {
    console.error(err);
    res.redirect(`/dashboard/${guildId}/logs?error=Erro ao salvar configurações`);
  }
});


app.get("/mochila", (req, res) => {
   res.render("desenvolvimento", { user: req.user})
})

app.get("/recompensas", async(req, res) => {

 // console.log(req.user)

  let db = await UserDb.findOne({
    id: req.user.discordId
  })

  if (!db){
    let newuser = new UserDb({id: req.user.discordId})

    await newuser.save();

    db = await UserDb.findOne({
    id: req.user.discordId
  })
  }

  
   res.render("user/daily", { user: req.user, db: db})
})

app.post("/recompensas", async (req, res) => {
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
    const tempoRestante = 86400000 - (agora - ultimoResgate); // 24h - tempo passado

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

app.get("/eventos", (req, res) => {
   res.render("user/eventos", { user: req.user})
})

app.get("/loja", (req, res) => {
   res.render("desenvolvimento", { user: req.user})
})

app.get("/missoes", (req, res) => {
   res.render("desenvolvimento", { user: req.user})
})

app.use((req, res) => {
  res.status(404).render('nPagina'); 
});

app.listen(process.env.PORT, () => {
  console.log(`🚀 Servidor iniciado em http://localhost:${process.env.PORT}`);
});
