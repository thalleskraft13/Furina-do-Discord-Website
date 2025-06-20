const { Schema, model } = require("mongoose");

module.exports = model("Msg-Automatica", new Schema({
  serverId: { type: String },
  chaveDeMsg: { type: String },
  resposta: { type: String }
}))