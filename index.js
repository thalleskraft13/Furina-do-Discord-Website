const express = require("express");
const session = require("express-session");
const passport = require("./auth");
const mongoose = require("mongoose");
const MongoStore = require("connect-mongo");
const path = require("path");
//const fetch = require("node-fetch"); // para atualizações de guilds
require("dotenv").config();

const User = require("./models/User");

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

// Middleware para proteger rotas
function checkAuth(req, res, next) {
  if (req.isAuthenticated()) return next();
  res.redirect("/login");
}

// Rotas
app.get("/", (req, res) => {
  res.render("index", { user: req.user});
});

app.get("/comandos", (req,res) => {
  res.render("comandos.ejs", { user: req.user})
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
      guilds: user.guilds // já estão filtradas
    });
  } catch (err) {
    console.error("Erro ao carregar dashboard:", err);
    res.status(500).send("Erro ao carregar dashboard.");
  }
});

app.get("/logout", (req, res) => {
  req.logout(() => res.redirect("/"));
});

// Atualiza lista de servidores sem precisar logar novamente
app.get("/atualizar-servidores", checkAuth, async (req, res) => {
  try {
    const response = await fetch("https://discord.com/api/users/@me/guilds", {
      headers: {
        Authorization: `Bearer ${req.user.accessToken}`
      }
    });

    const guilds = await response.json();

    const filtered = guilds.filter(g => {
      const perms = BigInt(g.permissions);
      return (
        (perms & BigInt(0x00000008n)) || // ADMINISTRATOR
        (perms & BigInt(0x00000020n))    // MANAGE_GUILD
      );
    });

    const user = await User.findById(req.user._id);
    user.guilds = filtered.map(g => ({
      id: g.id,
      name: g.name,
      icon: g.icon,
      permissions: g.permissions
    }));
    await user.save();

    res.redirect("/dashboard");
  } catch (err) {
    console.error("Erro ao atualizar servidores:", err);
    res.status(500).send("Erro ao atualizar servidores.");
  }
});

// Iniciar servidor
app.listen(process.env.PORT, () => {
  console.log(`🚀 Servidor iniciado em http://localhost:${process.env.PORT}`);
});
