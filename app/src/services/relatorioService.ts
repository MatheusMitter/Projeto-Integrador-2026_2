// Relatórios e ranking do painel. RN01: para o operador, a evolução sai só
// em unidades; o valor em reais não deixa esta camada.

import type { Movimentacao } from "../domain/tipos";
import * as movimentacaoRepo from "../repositories/movimentacaoRepository";
import * as relatorioRepo from "../repositories/relatorioRepository";
import type {
  ItemBaixoGiro,
  ItemRanking,
} from "../repositories/relatorioRepository";
import { sessaoAtual } from "./authService";
import { podeVerFinanceiro } from "./regras";

export type { ItemBaixoGiro, ItemRanking };

export interface PontoRelatorio {
  diasAtras: number;
  unidades: number;
  // nulo para o operador (RN01)
  valor: number | null;
}

export interface Relatorio {
  ranking: ItemRanking[];
  giro: ItemBaixoGiro[];
  serie: PontoRelatorio[];
  historico: Movimentacao[];
}

export async function montarRelatorio(dias: number): Promise<Relatorio> {
  const [ranking, giro, serie, historico] = await Promise.all([
    relatorioRepo.maisVendidos(5, dias),
    relatorioRepo.baixoGiro(dias),
    relatorioRepo.evolucao(dias),
    movimentacaoRepo.ultimas(5),
  ]);
  const verFinanceiro = podeVerFinanceiro(sessaoAtual()?.tipoPerfil ?? "OPERADOR");
  return {
    ranking,
    giro,
    serie: verFinanceiro ? serie : serie.map((p) => ({ ...p, valor: null })),
    historico,
  };
}

// ranking do painel: o histórico inteiro, não um período
export function maisVendidos(limite = 5): Promise<ItemRanking[]> {
  return relatorioRepo.maisVendidos(limite);
}
