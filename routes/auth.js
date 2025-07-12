const express = require("express");
const router = express.Router();
const passport = require("../auth");

// Rota para iniciar login com Discord
router.get("/login", passport.authenticate("discord"));

// Callback do Discord após autenticação
router.get("/auth/discord/callback",
  passport.authenticate("discord", { failureRedirect: "/" }),
  (req, res) => {
    // Autenticado com sucesso, redireciona para dashboard
    res.redirect("/dashboard");
  }
);

// Logout
router.get("/logout", (req, res, next) => {
  req.logout(err => {
    if (err) return next(err);
    res.redirect("/");
  });
});

module.exports = router;
