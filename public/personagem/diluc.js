module.exports = {
  nome: "Diluc",
  grad1: [
    [0, "#2b0000"],
    [1, "#550000"]
  ],
  grad2: [
    [0, "#550000"],
    [1, "#ffaaaa22"]
  ],
  bolha: (i) => {
    const cores = [
      "rgba(255, 100, 100, 0.3)",
      "rgba(200, 60, 60, 0.2)",
      "rgba(255, 140, 140, 0.15)"
    ];
    return cores[i % cores.length];
  },
  primaria: "#ff5555",
  sombra: "#aa2222",
  texto: "#ffffff",
  gradNome: [
    [0, "#ffffff"],
    [1, "#ffffff"]
  ],
  fundoCaixa: "rgba(255, 85, 85, 0.2)",
  fundoRetanguloSuperior: "rgba(255, 85, 85, 0.4)",
  fundoRetanguloInferior: "rgba(80, 0, 0, 0.3)",
  fundoUID: "rgba(255, 85, 85, 0.3)",
  textoUID: "#ffffff",
  sombraCaixa: "#ff5555",
  fonteTitulo: "bold 36px 'Segoe UI'",
  fonteTexto: "20px 'Segoe UI'",
  fonteEstatisticas: "bold 30px 'Segoe UI'",
  fonteNome: "bold 70px 'Segoe UI'",
  corEstatisticas: "#dddddd",
  paddingCaixa: 30,
};
