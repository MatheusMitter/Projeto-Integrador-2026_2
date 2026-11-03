// Consultas de relatório: ranking, baixo giro e evolução, por período em
// dias.
//
// data_hora é gravada com datetime('now'), em UTC, então o corte do
// período também é calculado em UTC, pelo próprio SQLite.

import { obterBanco } from "../database/conexao";

export interface ItemRanking {
  produtoId: number;
  nome: string;
  total: number;
}

// sem período, o ranking cobre o histórico inteiro (é o do painel)
export async function maisVendidos(
  limite = 5,
  dias?: number,
  lojaId = 1,
): Promise<ItemRanking[]> {
  const db = await obterBanco();
  const corte = dias === undefined ? "" : "AND m.data_hora >= datetime('now', ?)";
  const parametros =
    dias === undefined ? [lojaId, limite] : [lojaId, `-${dias} days`, limite];
  return db.getAllAsync<ItemRanking>(
    `SELECT p.id AS produtoId, p.nome, SUM(m.quantidade) AS total
       FROM movimentacao m
       JOIN produto p ON p.id = m.produto_id
      WHERE m.tipo = 'VENDA'
        AND p.loja_id = ?
        ${corte}
      GROUP BY p.id, p.nome
      ORDER BY total DESC
      LIMIT ?`,
    parametros,
  );
}

export interface ItemBaixoGiro {
  produtoId: number;
  nome: string;
  estoqueAtual: number;
  diasParado: number;
}

/**
 * Produtos com estoque e sem venda no período. Os dias parados contam da
 * última venda ou, se nunca vendeu, do cadastro — é o capital que está
 * imobilizado há mais tempo. Produto cadastrado dentro do período ainda
 * não teve tempo de girar, então não entra.
 */
export async function baixoGiro(
  dias: number,
  limite = 5,
  lojaId = 1,
): Promise<ItemBaixoGiro[]> {
  const db = await obterBanco();
  return db.getAllAsync<ItemBaixoGiro>(
    `SELECT p.id AS produtoId, p.nome, p.estoque_atual AS estoqueAtual,
            CAST(julianday('now') - julianday(COALESCE(MAX(m.data_hora), p.criado_em))
                 AS INTEGER) AS diasParado
       FROM produto p
       LEFT JOIN movimentacao m ON m.produto_id = p.id AND m.tipo = 'VENDA'
      WHERE p.ativo = 1 AND p.loja_id = ? AND p.estoque_atual > 0
      GROUP BY p.id
     HAVING COALESCE(MAX(m.data_hora), p.criado_em) < datetime('now', ?)
      ORDER BY diasParado DESC
      LIMIT ?`,
    [lojaId, `-${dias} days`, limite],
  );
}

export interface PontoEvolucao {
  diasAtras: number;
  valor: number;
  unidades: number;
}

/**
 * Estoque em pontos igualmente espaçados do período.
 *
 * O saldo de cada produto numa data é o saldo_apos da última movimentação
 * até ali: é para isso que a coluna existe. Não precisa de tabela de
 * fotografia diária. Produto desativado sai da série inteira, o que
 * subestima o passado, e é aceitável num relatório de tendência.
 */
export async function evolucao(
  dias: number,
  pontos = 6,
  lojaId = 1,
): Promise<PontoEvolucao[]> {
  const db = await obterBanco();
  const saldoNaData = `COALESCE((
      SELECT m.saldo_apos FROM movimentacao m
       WHERE m.produto_id = p.id AND m.data_hora <= datetime('now', ?)
       ORDER BY m.data_hora DESC, m.id DESC
       LIMIT 1), 0)`;

  const serie: PontoEvolucao[] = [];
  for (let i = pontos - 1; i >= 0; i--) {
    const diasAtras = Math.round((dias * i) / (pontos - 1));
    const corte = `-${diasAtras} days`;
    const l = await db.getFirstAsync<{ valor: number | null; unidades: number | null }>(
      `SELECT SUM(p.preco_custo * ${saldoNaData}) AS valor,
              SUM(${saldoNaData}) AS unidades
         FROM produto p
        WHERE p.ativo = 1 AND p.loja_id = ?`,
      [corte, corte, lojaId],
    );
    serie.push({
      diasAtras,
      valor: l?.valor ?? 0,
      unidades: l?.unidades ?? 0,
    });
  }
  return serie;
}
