module.exports = {
  nome: "Arlecchino",
  grad1: [
    [0, "#0a0000"],
    [1, "#330000"]
  ],
  grad2: [
    [0, "#330000"],
    [1, "#660000dd"]
  ],
  bolha: (i) => {
    const cores = [
      "rgba(180, 20, 20, 0.3)",
      "rgba(110, 10, 10, 0.2)",
      "rgba(255, 50, 50, 0.15)"
    ];
    return cores[i % cores.length];
  },
  primaria: "#d92020",
  sombra: "#a51515",
  texto: "#ffffff",
  gradNome: [
    [0, "#ffffff"],
    [1, "#ffffff"]
  ],
  fundoCaixa: "rgba(215, 32, 32, 0.3)",
  fundoRetanguloSuperior: "rgba(215, 32, 32, 0.5)",
  fundoRetanguloInferior: "rgba(110, 10, 10, 0.3)",
  fundoUID: "rgba(180, 20, 20, 0.4)",
  textoUID: "#ffffff",
  sombraCaixa: "#d92020",
  fonteTitulo: "bold 36px 'Segoe UI'",
  fonteTexto: "20px 'Segoe UI'",
  fonteEstatisticas: "bold 30px 'Segoe UI'",
  fonteNome: "bold 70px 'Segoe UI'",
  corEstatisticas: "#dddddd",
  paddingCaixa: 30,
};
