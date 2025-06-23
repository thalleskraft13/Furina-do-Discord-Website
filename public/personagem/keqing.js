module.exports = {
  nome: "Keqing",
  grad1: [
    [0, "#1a0033"],
    [1, "#3d0066"]
  ],
  grad2: [
    [0, "#3d0066"],
    [1, "#d0aaff33"]
  ],
  bolha: (i) => {
    const cores = [
      "rgba(200, 160, 255, 0.3)",
      "rgba(150, 110, 255, 0.2)",
      "rgba(180, 120, 255, 0.15)"
    ];
    return cores[i % cores.length];
  },
  primaria: "#b77dff",
  sombra: "#9e4dff",
  texto: "#ffffff",
  gradNome: [
    [0, "#ffffff"],
    [1, "#ffffff"]
  ],
  fundoCaixa: "rgba(183, 125, 255, 0.2)",
  fundoRetanguloSuperior: "rgba(183, 125, 255, 0.4)",
  fundoRetanguloInferior: "rgba(50, 0, 100, 0.3)",
  fundoUID: "rgba(183, 125, 255, 0.3)",
  textoUID: "#ffffff",
  sombraCaixa: "#b77dff",
  fonteTitulo: "bold 36px 'Segoe UI'",
  fonteTexto: "20px 'Segoe UI'",
  fonteEstatisticas: "bold 30px 'Segoe UI'",
  fonteNome: "bold 70px 'Segoe UI'",
  corEstatisticas: "#dddddd",
  paddingCaixa: 30,
};
