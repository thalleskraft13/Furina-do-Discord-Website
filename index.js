const express = require("express");
const session = require("express-session");
const passport = require("./auth");
const mongoose = require("mongoose");
const MongoStore = require("connect-mongo");
const path = require("path");
const dotenv = require("dotenv");
const client = require("./botClient");

dotenv.config();
const app = express();

// Conexão com MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log("🟢 MongoDB conectado"))
.catch(err => console.error("🔴 Erro ao conectar MongoDB:", err));

// Configuração da sessão com MongoDB
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

// Middlewares gerais
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static("public"));
app.use(passport.initialize());
app.use(passport.session());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Rotas principais
app.use("/", require("./routes/index"));
app.use("/", require("./routes/auth"));            // login, logout, callback
app.use("/dashboard", require("./routes/dashboard"));
app.use("/dashboard", require("./routes/servidor"));
 // embed, logs, mensagem-automatica etc
app.use("/", require("./routes/user"));  // todas rotas do usuário no nível raiz
app.use("/", require("./routes/topggWebhook"));


// Página 404 - captura tudo que não bate com rotas acima
app.use((req, res) => {
  res.status(404).render("nPagina", { user: req.user });
});

// Inicia servidor
app.listen(process.env.PORT, () => {
  console.log(`🚀 Servidor iniciado em http://localhost:${process.env.PORT}`);
});
