module.exports = {
  nome: "Mona",
  grad1: [
    [0, "#1a0033"],
    [1, "#3b0066"]
  ],
  grad2: [
    [0, "#3b0066"],
    [1, "#a060ff22"]
  ],
  bolha: (i) => {
    const cores = [
      "rgba(160, 96, 255, 0.3)",
      "rgba(100, 60, 180, 0.2)",
      "rgba(200, 150, 255, 0.15)"
    ];
    return cores[i % cores.length];
  },
  primaria: "#a060ff",
  sombra: "#6e30aa",
  texto: "#ffffff",
  gradNome: [
    [0, "#ffffff"],
    [1, "#ffffff"]
  ],
  fundoCaixa: "rgba(160, 96, 255, 0.2)",
  fundoRetanguloSuperior: "rgba(160, 96, 255, 0.4)",
  fundoRetanguloInferior: "rgba(60, 0, 120, 0.3)",
  fundoUID: "rgba(160, 96, 255, 0.3)",
  textoUID: "#ffffff",
  sombraCaixa: "#a060ff",
  fonteTitulo: "bold 36px 'Segoe UI'",
  fonteTexto: "20px 'Segoe UI'",
  fonteEstatisticas: "bold 30px 'Segoe UI'",
  fonteNome: "bold 70px 'Segoe UI'",
  corEstatisticas: "#dddddd",
  paddingCaixa: 30,
};
