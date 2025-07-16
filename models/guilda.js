const mongoose = require("mongoose");

const MembroSchema = new mongoose.Schema({
  id: { type: String, required: true }, // ID do usuário
  entrouEm: { type: Date, default: Date.now },
  cargo: { type: String, enum: ['Líder', 'Oficial', 'Membro'], default: 'Membro' }
});

const MissaoDiariaSchema = new mongoose.Schema({
  tipo: { type: String, required: true }, // Ex: mensagens, exploracoes, doacoes
  objetivo: { type: Number, required: true },
  progresso: { type: Number, default: 0 },
  recompensa: {
    mora: { type: Number, default: 0 },
    primogemas: { type: Number, default: 0 },
    xp: { type: Number, default: 0 }
  },
  iniciada: { type: Date, default: Date.now }, // quando a missão foi gerada
  expira: { type: Date, required: true }, // quando a missão expira
  concluida: { type: Boolean, default: false }
});

module.exports = mongoose.model("Guilda", new mongoose.Schema({
  nome: { type: String, required: true, unique: true },
  descricao: { type: String, default: "" },
  dono: { type: String, required: true }, // ID do criador da guilda

  tag: { type: String, required: true, unique: true }, // ID curto público da guilda, ex: "LYUE"

  membros: [MembroSchema], // até 4 membros por guilda

  nivel: { type: Number, default: 1 },
  xp: { type: Number, default: 0 },

  mora: { type: Number, default: 0 },
  primogemas: { type: Number, default: 0 },

  missoes: [MissaoDiariaSchema], // lista de missões diárias

  criacao: { type: Date, default: Date.now }
}));
