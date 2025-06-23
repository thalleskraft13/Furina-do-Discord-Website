module.exports = {
  nome: "Furina",
  grad1: [
    [0, "#05182a"],
    [1, "#0f3e60"]
  ],
  grad2: [
    [0, "#0f3e60"],
    [1, "#d3e6f3dd"]
  ],
  bolha: (i) => {
    const tons = [
      "rgba(78, 201, 255, 0.25)",
      "rgba(78, 201, 255, 0.15)",
      "rgba(78, 201, 255, 0.10)"
    ];
    return tons[i % tons.length];
  },
  primaria: "#4ec9ff",
  sombra: "#4ec9ff",
  texto: "#ffffff",
  gradNome: [
    [0, "#ffffff"],
    [1, "#ffffff"]
  ],
  fundoCaixa: "rgba(78, 201, 255, 0.15)",
  fundoRetanguloSuperior: "rgba(78, 201, 255, 0.5)",
  fundoRetanguloInferior: "rgba(10, 20, 40, 0.3)",
  fundoUID: "rgba(78, 201, 255, 0.25)",
  textoUID: "#ffffff",
  sombraCaixa: "#4ec9ff",
  fonteTitulo: "bold 36px 'Segoe UI'",
  fonteTexto: "20px 'Segoe UI'",
  fonteEstatisticas: "bold 30px 'Segoe UI'",
  fonteNome: "bold 70px 'Segoe UI'",
  corEstatisticas: "#dddddd",
  paddingCaixa: 30,
};
