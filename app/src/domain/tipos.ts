// Tipos das entidades do domínio.

export type TipoPerfil = "PROPRIETARIO" | "OPERADOR";

export interface Usuario {
  id: number;
  lojaId: number;
  nome: string;
  email: string;
  tipoPerfil: TipoPerfil;
  ativo: boolean;
}

export interface Categoria {
  id: number;
  lojaId: number;
  nome: string;
  ativo: boolean;
}

export interface Fornecedor {
  id: number;
  lojaId: number;
  nome: string;
  telefone: string | null;
  email: string | null;
  ativo: boolean;
}

export interface Produto {
  id: number;
  lojaId: number;
  nome: string;
  codigoBarras: string | null;
  categoriaId: number;
  fornecedorId: number | null;
  precoCusto: number;
  precoVenda: number;
  estoqueAtual: number;
  estoqueMinimo: number;
  dataValidade: string | null;
  ativo: boolean;
  // vêm de junção, para a listagem não precisar de várias consultas
  categoriaNome?: string;
  fornecedorNome?: string | null;
}

/** Tipos de entrada e de saída, conforme a restrição CHECK do banco. */
export const TIPOS_ENTRADA = [
  "COMPRA",
  "DEVOLUCAO_CLIENTE",
  "AJUSTE_ENTRADA",
] as const;

export const TIPOS_SAIDA = [
  "VENDA",
  "PERDA",
  "VENCIMENTO",
  "DEVOLUCAO_FORNECEDOR",
  "AJUSTE_SAIDA",
] as const;

export type TipoEntrada = (typeof TIPOS_ENTRADA)[number];
export type TipoSaida = (typeof TIPOS_SAIDA)[number];
export type TipoMovimentacao = TipoEntrada | TipoSaida;

export interface Movimentacao {
  id: number;
  uuid: string;
  produtoId: number;
  usuarioId: number;
  tipo: TipoMovimentacao;
  quantidade: number;
  saldoApos: number;
  dataHora: string;
  observacoes: string | null;
  produtoNome?: string;
  usuarioNome?: string;
}

/** Situação do estoque em relação ao mínimo — regra RN07. */
export type SituacaoEstoque = "CRITICO" | "BAIXO" | "NORMAL" | "EXCESSO";

export interface ResumoEstoque {
  totalProdutos: number;
  valorTotalEstoque: number;
  produtosCriticos: number;
  produtosVencendo: number;
}

/** Rótulos para exibição. Ficam aqui para tela e relatório não divergirem. */
export const ROTULO_TIPO: Record<TipoMovimentacao, string> = {
  COMPRA: "Compra de fornecedor",
  DEVOLUCAO_CLIENTE: "Devolução de cliente",
  AJUSTE_ENTRADA: "Ajuste de inventário",
  VENDA: "Venda",
  PERDA: "Perda",
  VENCIMENTO: "Vencimento",
  DEVOLUCAO_FORNECEDOR: "Devolução a fornecedor",
  AJUSTE_SAIDA: "Ajuste de inventário",
};

export const ROTULO_SITUACAO: Record<SituacaoEstoque, string> = {
  CRITICO: "Estoque crítico",
  BAIXO: "Estoque baixo",
  NORMAL: "Estoque normal",
  EXCESSO: "Estoque em excesso",
};
