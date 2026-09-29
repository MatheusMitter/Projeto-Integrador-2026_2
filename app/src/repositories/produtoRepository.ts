/**
 * Repositório de produtos — camada de persistência.
 *
 * Só executa SQL e converte o resultado em objeto de domínio. Não decide
 * o que é válido: quem decide é a camada de negócio. Essa separação é o
 * que o requisito R12 pede.
 *
 * Todas as consultas são parametrizadas. Concatenar valor em SQL abriria
 * injeção e impediria o reaproveitamento do plano de execução.
 */

import { obterBanco, gerarUuid } from "../database/conexao";
import { Produto, ResumoEstoque } from "../domain/tipos";

interface LinhaProduto {
  id: number;
  loja_id: number;
  nome: string;
  codigo_barras: string | null;
  categoria_id: number;
  fornecedor_id: number | null;
  preco_custo: number;
  preco_venda: number;
  estoque_atual: number;
  estoque_minimo: number;
  data_validade: string | null;
  ativo: number;
  categoria_nome?: string;
  fornecedor_nome?: string | null;
}

function paraProduto(l: LinhaProduto): Produto {
  return {
    id: l.id,
    lojaId: l.loja_id,
    nome: l.nome,
    codigoBarras: l.codigo_barras,
    categoriaId: l.categoria_id,
    fornecedorId: l.fornecedor_id,
    precoCusto: l.preco_custo,
    precoVenda: l.preco_venda,
    estoqueAtual: l.estoque_atual,
    estoqueMinimo: l.estoque_minimo,
    dataValidade: l.data_validade,
    ativo: l.ativo === 1,
    categoriaNome: l.categoria_nome,
    fornecedorNome: l.fornecedor_nome,
  };
}

const SELECAO = `
  SELECT p.*, c.nome AS categoria_nome, f.nome AS fornecedor_nome
    FROM produto p
    JOIN categoria c   ON c.id = p.categoria_id
    LEFT JOIN fornecedor f ON f.id = p.fornecedor_id
`;

/**
 * Lista os produtos ativos, com busca opcional por nome ou código.
 * O filtro de ativo implementa RN12: produto desativado sai das listagens
 * mas continua no banco, sustentando o histórico.
 */
export async function listar(termo = ""): Promise<Produto[]> {
  const db = await obterBanco();
  const busca = termo.trim();

  if (busca.length === 0) {
    const linhas = await db.getAllAsync<LinhaProduto>(
      `${SELECAO} WHERE p.ativo = 1 ORDER BY p.nome COLLATE NOCASE`,
    );
    return linhas.map(paraProduto);
  }

  const linhas = await db.getAllAsync<LinhaProduto>(
    `${SELECAO}
      WHERE p.ativo = 1
        AND (p.nome LIKE ? COLLATE NOCASE OR p.codigo_barras LIKE ?)
      ORDER BY p.nome COLLATE NOCASE`,
    [`%${busca}%`, `%${busca}%`],
  );
  return linhas.map(paraProduto);
}

export async function buscarPorId(id: number): Promise<Produto | null> {
  const db = await obterBanco();
  const linha = await db.getFirstAsync<LinhaProduto>(
    `${SELECAO} WHERE p.id = ?`,
    [id],
  );
  return linha ? paraProduto(linha) : null;
}

export async function buscarPorCodigoBarras(
  codigo: string,
): Promise<Produto | null> {
  const db = await obterBanco();
  const linha = await db.getFirstAsync<LinhaProduto>(
    `${SELECAO} WHERE p.codigo_barras = ? AND p.ativo = 1`,
    [codigo],
  );
  return linha ? paraProduto(linha) : null;
}

export interface DadosProduto {
  nome: string;
  codigoBarras: string | null;
  categoriaId: number;
  fornecedorId: number | null;
  precoCusto: number;
  precoVenda: number;
  estoqueMinimo: number;
  dataValidade: string | null;
}

/**
 * Insere o produto com saldo zero. A quantidade inicial entra por
 * movimentação, para o histórico explicar de onde veio o estoque.
 */
export async function inserir(
  dados: DadosProduto,
  lojaId = 1,
): Promise<number> {
  const db = await obterBanco();
  const r = await db.runAsync(
    `INSERT INTO produto
       (uuid, loja_id, nome, codigo_barras, categoria_id, fornecedor_id,
        preco_custo, preco_venda, estoque_atual, estoque_minimo, data_validade)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0, ?, ?)`,
    [
      gerarUuid(),
      lojaId,
      dados.nome.trim(),
      dados.codigoBarras?.trim() || null,
      dados.categoriaId,
      dados.fornecedorId,
      dados.precoCusto,
      dados.precoVenda,
      dados.estoqueMinimo,
      dados.dataValidade,
    ],
  );
  return r.lastInsertRowId;
}

export async function atualizar(
  id: number,
  dados: DadosProduto,
): Promise<void> {
  const db = await obterBanco();
  // O saldo não é alterado por aqui de propósito: mudança de estoque só
  // acontece por movimentação, senão o histórico deixa de fechar.
  await db.runAsync(
    `UPDATE produto
        SET nome = ?, codigo_barras = ?, categoria_id = ?, fornecedor_id = ?,
            preco_custo = ?, preco_venda = ?, estoque_minimo = ?,
            data_validade = ?, atualizado_em = datetime('now'),
            sincronizado = 0
      WHERE id = ?`,
    [
      dados.nome.trim(),
      dados.codigoBarras?.trim() || null,
      dados.categoriaId,
      dados.fornecedorId,
      dados.precoCusto,
      dados.precoVenda,
      dados.estoqueMinimo,
      dados.dataValidade,
      id,
    ],
  );
}

/** RN12 — desativa em vez de excluir, preservando o histórico. */
export async function desativar(id: number): Promise<void> {
  const db = await obterBanco();
  await db.runAsync(
    `UPDATE produto
        SET ativo = 0, atualizado_em = datetime('now'), sincronizado = 0
      WHERE id = ?`,
    [id],
  );
}

/** Indicadores do painel. Uma consulta em vez de somar em memória. */
export async function resumo(lojaId = 1): Promise<ResumoEstoque> {
  const db = await obterBanco();
  const l = await db.getFirstAsync<{
    total: number;
    valor: number | null;
    criticos: number;
    vencendo: number;
  }>(
    `SELECT COUNT(*) AS total,
            SUM(estoque_atual * preco_custo) AS valor,
            SUM(CASE WHEN estoque_atual <= estoque_minimo THEN 1 ELSE 0 END) AS criticos,
            SUM(CASE WHEN data_validade IS NOT NULL
                      AND date(data_validade) <= date('now', '+15 days')
                     THEN 1 ELSE 0 END) AS vencendo
       FROM produto
      WHERE ativo = 1 AND loja_id = ?`,
    [lojaId],
  );

  return {
    totalProdutos: l?.total ?? 0,
    valorTotalEstoque: l?.valor ?? 0,
    produtosCriticos: l?.criticos ?? 0,
    produtosVencendo: l?.vencendo ?? 0,
  };
}

/** Ranking de saídas do tipo VENDA — visão consolidada do requisito R9. */
export async function maisVendidos(
  limite = 5,
): Promise<{ nome: string; total: number }[]> {
  const db = await obterBanco();
  return db.getAllAsync<{ nome: string; total: number }>(
    `SELECT p.nome, SUM(m.quantidade) AS total
       FROM movimentacao m
       JOIN produto p ON p.id = m.produto_id
      WHERE m.tipo = 'VENDA'
      GROUP BY p.id, p.nome
      ORDER BY total DESC
      LIMIT ?`,
    [limite],
  );
}
