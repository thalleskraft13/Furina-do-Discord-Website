module.exports = {
  nome: "0",
  grad1: [
    [0, "#1e1f22"],
    [1, "#2b2d31"]
  ],
  grad2: [
    [0, "#2b2d31"],
    [1, "#3c3f45"]
  ],
  bolha: (i) => {
    const cores = [
      "rgba(114, 137, 218, 0.25)", // tom do blurple
      "rgba(88, 101, 242, 0.2)",
      "rgba(78, 93, 148, 0.15)"
    ];
    return cores[i % cores.length];
  },
  primaria: "#5865F2", // Discord blurple
  sombra: "#404eed", // sombra mais intensa do blurple
  texto: "#ffffff",
  gradNome: [
    [0, "#ffffff"],
    [1, "#ffffff"]
  ],
  fundoCaixa: "rgba(88, 101, 242, 0.1)",
  fundoRetanguloSuperior: "rgba(88, 101, 242, 0.15)",
  fundoRetanguloInferior: "rgba(30, 33, 36, 0.4)",
  fundoUID: "rgba(88, 101, 242, 0.2)",
  textoUID: "#ffffff",
  sombraCaixa: "#5865F2",
  fonteTitulo: "bold 36px 'Segoe UI'",
  fonteTexto: "20px 'Segoe UI'",
  fonteEstatisticas: "bold 30px 'Segoe UI'",
  fonteNome: "bold 70px 'Segoe UI'",
  corEstatisticas: "#cccccc",
  paddingCaixa: 30,
};
