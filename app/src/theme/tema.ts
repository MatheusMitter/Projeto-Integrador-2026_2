// Tokens visuais. Paleta, raios e espaçamentos seguem o Figma da equipe.
//
// Três desvios do Figma, todos por acessibilidade (R11):
// - o verde e o âmbar do Figma não passam com texto branco em fonte
//   pequena (mínimo de 4,5:1), então badges e textos usam os tons "Texto",
//   mais escuros; o tom original fica para número grande e elemento não
//   textual;
// - a escala de fonte do Figma (corpo 12, rótulo 10, badge 9) foi
//   ampliada, porque em celular esses tamanhos ficam ilegíveis;
// - a borda dos campos é mais escura que a dos cards (ver bordaCampo).

export const cores = {
  primaria: "#2450D6",
  primariaPressionada: "#1B3FAE",
  primariaSuave: "#E4EAFC",
  sobrePrimaria: "#FFFFFF",

  fundo: "#F3F5F9",
  superficie: "#FFFFFF",
  texto: "#111A2E",
  textoSuave: "#5E6B85",
  borda: "#DDE3EF",
  // A borda do Figma tem 1,3:1 sobre o fundo. Serve para card, mas campo
  // de texto precisa de 3:1 para ser percebido como campo (WCAG 1.4.11).
  bordaCampo: "#7D8AA3",

  sucesso: "#16915A",
  sucessoTexto: "#12804F",
  sucessoSuave: "#E3F4EC",
  sobreSucessoSuave: "#0D6B41", // texto sobre sucessoSuave, 5,8:1
  aviso: "#C98208",
  avisoTexto: "#9F6500",
  avisoSuave: "#FBF1DD",
  sobreAvisoSuave: "#7A4D00", // texto sobre avisoSuave, 6,5:1
  perigo: "#CF3A3A",
  perigoTexto: "#A12A2A", // o perigo puro dá 4,45:1 sobre o fundo
  perigoSuave: "#FBE7E7",
} as const;

export const espaco = {
  xs: 4,
  sm: 8,
  md: 14, // margem lateral da tela no Figma
  lg: 20,
  xl: 28,
} as const;

export const fonte = {
  destaque: 28,
  titulo: 22,
  tituloVoltar: 18,
  kpi: 24,
  corpo: 15,
  botao: 15,
  rotulo: 13,
  legenda: 13,
  badge: 11,
  aba: 11,
} as const;

export const raio = {
  miniatura: 6,
  padrao: 8,
  grande: 12, // logo e FAB
  completo: 999,
} as const;

// Área mínima tocável. O Figma desenha botão com ~38px; a diretriz do
// Android pede 48dp, e o polegar do comerciante agradece.
export const ALVO_TOQUE = 48;

export const CORES_SITUACAO = {
  CRITICO: { fundo: cores.perigo, texto: cores.sobrePrimaria },
  BAIXO: { fundo: cores.avisoTexto, texto: cores.sobrePrimaria },
  NORMAL: { fundo: cores.sucessoTexto, texto: cores.sobrePrimaria },
  EXCESSO: { fundo: cores.primaria, texto: cores.sobrePrimaria },
} as const;
