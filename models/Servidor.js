const { Schema, model } = require("mongoose");

module.exports = model("Servidores", new Schema({
  serverId: { type: String },
  logs: {
    react: {
      ativado: { type: Boolean, default: false}, 
      channel: { type: String }
    }
  }
}))