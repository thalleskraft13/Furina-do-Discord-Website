module.exports = {
  nome: "Qiqi",
  grad1: [
    [0, "#001033"],
    [1, "#1a2b66"]
  ],
  grad2: [
    [0, "#1a2b66"],
    [1, "#aaccff33"]
  ],
  bolha: (i) => {
    const cores = [
      "rgba(160, 210, 255, 0.25)",
      "rgba(100, 150, 200, 0.2)",
      "rgba(200, 230, 255, 0.15)"
    ];
    return cores[i % cores.length];
  },
  primaria: "#9ed6ff",
  sombra: "#5fa3ff",
  texto: "#ffffff",
  gradNome: [
    [0, "#ffffff"],
    [1, "#ffffff"]
  ],
  fundoCaixa: "rgba(158, 214, 255, 0.2)",
  fundoRetanguloSuperior: "rgba(158, 214, 255, 0.4)",
  fundoRetanguloInferior: "rgba(30, 60, 100, 0.3)",
  fundoUID: "rgba(158, 214, 255, 0.3)",
  textoUID: "#ffffff",
  sombraCaixa: "#9ed6ff",
  fonteTitulo: "bold 36px 'Segoe UI'",
  fonteTexto: "20px 'Segoe UI'",
  fonteEstatisticas: "bold 30px 'Segoe UI'",
  fonteNome: "bold 70px 'Segoe UI'",
  corEstatisticas: "#dddddd",
  paddingCaixa: 30,
};
