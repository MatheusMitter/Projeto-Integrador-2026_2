/**
 * Tema da aplicação.
 *
 * São os mesmos valores do protótipo (prototipo/styles.css). A paleta foi
 * ajustada para atender ao contraste mínimo de 4,5:1 da WCAG 2.1 nível AA,
 * exigido pelo requisito R11 — as cores originais reprovavam quando usadas
 * com texto branco.
 *
 * Razão de contraste de cada cor contra branco está em
 * docs/N1-memorial-prototipo.md.
 */

export const cores = {
  primaria: "#2E7D32", // 5,13:1
  primariaEscura: "#1B5E20", // 7,57:1
  primariaClara: "#E8F5E9",
  secundaria: "#1565C0", // 5,40:1
  secundariaClara: "#E3F2FD",
  perigo: "#C62828", // 5,90:1
  perigoClaro: "#FFEBEE",
  aviso: "#E65100", // 4,80:1
  avisoClaro: "#FFF3E0",

  branco: "#FFFFFF",
  cinza100: "#F5F5F5",
  cinza200: "#EEEEEE",
  cinza300: "#E0E0E0",
  cinza400: "#BDBDBD",
  // cinza600 é o tom mais claro admitido para TEXTO (4,60:1).
  // Tons acima servem apenas para borda e divisória.
  cinza600: "#757575",
  cinza700: "#616161",
  cinza800: "#424242",
  cinza900: "#212121",
} as const;

export const espaco = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
} as const;

export const fonte = {
  tituloGrande: 24,
  tituloMedio: 18,
  corpo: 14,
  legenda: 12,
} as const;

export const raio = {
  sm: 4,
  md: 8,
  lg: 12,
  completo: 9999,
} as const;

/**
 * Área mínima de toque, em pixels independentes de densidade.
 * Requisito RNF04. O operador registra saída durante o atendimento, às
 * vezes com uma mão ocupada: alvo pequeno gera toque errado, e toque errado
 * em movimentação de estoque gera dado incorreto.
 */
export const ALVO_TOQUE = 44;

/** Cor de fundo e de texto para cada situação de estoque (RN07). */
export const CORES_SITUACAO = {
  CRITICO: { fundo: cores.perigoClaro, texto: "#B71C1C" },
  BAIXO: { fundo: cores.avisoClaro, texto: "#BF360C" },
  NORMAL: { fundo: cores.primariaClara, texto: cores.primariaEscura },
  EXCESSO: { fundo: cores.secundariaClara, texto: "#0D47A1" },
} as const;
