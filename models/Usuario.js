const { Schema, model } = require("mongoose");

const personagemSchema = new Schema({
  nome: { type: String, required: true },
  c: { type: Number, default: 0 }
});

module.exports = model("Usuarios", new Schema({
  id: { type: String, required: true },
  uid: { type: String, default: "0" },
  notificar: { type: Boolean, default: true },
  sobremim: { type: String, default: "teste" },
  primogemas: { type: Number, default: 0 },
  mora: { type: Number, default: 0 },
  daily: { type: Number, default: 0 },
  codigos: { type: Array, default: [] },

  level: {
    ar: { type: Number, default: 1 },
    xp: { type: Number, default: 0 },
    xpMax: { type: Number, default: 375 }
  },

  gacha: {
    pity: {
      five: { type: Number, default: 0 },
      four: { type: Number, default: 0 },
      garantia5: { type: Boolean, default: false }
    }
  },

  personagens: { type: [personagemSchema], default: []},
//userdb.regioes.mondstadt.exploracao.bausPreciosos + userdb.regioes.mondstadt.exploracao.bausComuns + userdb.regioes.mondstadt.exploracao.time
  regioes: {
    mondstadt: {
      reputacao: {
        nv: { type: Number, default: 0 },
        xp: { type: Number, default: 0 },
      },

      exploracao: {
        bausPreciosos: { type: Number, default: 0 },
        bausComuns: { type: Number, default: 0 },
        bausLuxuosos: { type: Number, default: 0 },
        time: { type: Number, default: 0 },
        resgatado: { type: Boolean, default: true },
        resgatar: { type: Boolean, default: false }
      },

      estatuaDosSetes: {
        nv: { type: Number, default: 0 },
        quantidade: { type: Number, default: 0 },
        anemoculus: { type: Number, default: 0 },
      }
    }
  },

  perfil: {
    tema: { type: String, default: "0"},
    sobremim: { type: String, default: "Use '/perfil sobremim' para alterar."}
  }


}));
