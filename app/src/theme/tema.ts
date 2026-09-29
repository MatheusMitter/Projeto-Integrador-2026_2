// Mesmos valores do protótipo em prototipo/styles.css.
// Cores escolhidas para passar no contraste mínimo de 4,5:1 com texto branco.

export const cores = {
  primaria: "#2E7D32",
  primariaEscura: "#1B5E20",
  primariaClara: "#E8F5E9",
  secundaria: "#1565C0",
  secundariaClara: "#E3F2FD",
  perigo: "#C62828",
  perigoClaro: "#FFEBEE",
  aviso: "#E65100",
  avisoClaro: "#FFF3E0",

  branco: "#FFFFFF",
  cinza100: "#F5F5F5",
  cinza200: "#EEEEEE",
  cinza300: "#E0E0E0",
  cinza400: "#BDBDBD",
  // cinza600 é o mais claro que dá para usar em texto; acima disso só borda
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

// tamanho mínimo de área tocável
export const ALVO_TOQUE = 44;

export const CORES_SITUACAO = {
  CRITICO: { fundo: cores.perigoClaro, texto: "#B71C1C" },
  BAIXO: { fundo: cores.avisoClaro, texto: "#BF360C" },
  NORMAL: { fundo: cores.primariaClara, texto: cores.primariaEscura },
  EXCESSO: { fundo: cores.secundariaClara, texto: "#0D47A1" },
} as const;
