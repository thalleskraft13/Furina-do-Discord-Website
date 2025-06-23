module.exports = {
  nome: "Jean",
  grad1: [
    [0, "#002533"],
    [1, "#005566"]
  ],
  grad2: [
    [0, "#005566"],
    [1, "#e0f7ff33"]
  ],
  bolha: (i) => {
    const cores = [
      "rgba(100, 200, 255, 0.25)",
      "rgba(60, 160, 200, 0.2)",
      "rgba(140, 220, 255, 0.15)"
    ];
    return cores[i % cores.length];
  },
  primaria: "#64c8ff",
  sombra: "#2d90b0",
  texto: "#ffffff",
  gradNome: [
    [0, "#ffffff"],
    [1, "#ffffff"]
  ],
  fundoCaixa: "rgba(100, 200, 255, 0.2)",
  fundoRetanguloSuperior: "rgba(100, 200, 255, 0.4)",
  fundoRetanguloInferior: "rgba(20, 80, 100, 0.3)",
  fundoUID: "rgba(100, 200, 255, 0.3)",
  textoUID: "#ffffff",
  sombraCaixa: "#64c8ff",
  fonteTitulo: "bold 36px 'Segoe UI'",
  fonteTexto: "20px 'Segoe UI'",
  fonteEstatisticas: "bold 30px 'Segoe UI'",
  fonteNome: "bold 70px 'Segoe UI'",
  corEstatisticas: "#dddddd",
  paddingCaixa: 30,
};
