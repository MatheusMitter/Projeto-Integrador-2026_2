// Acesso a dados de produto. Consultas sempre parametrizadas.

import { obterBanco, gerarUuid } from "../database/conexao";
import type { Produto } from "../domain/tipos";

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

// Colunas nomeadas em vez de p.*: o esquema tem colunas de controle
// (uuid, criado_em, atualizado_em, sincronizado) que o domínio não usa, e
// trazê-las para depois descartar no mapeamento esconde o que a consulta
// realmente devolve.
const SELECAO = `
  SELECT p.id, p.loja_id, p.nome, p.codigo_barras, p.categoria_id,
         p.fornecedor_id, p.preco_custo, p.preco_venda, p.estoque_atual,
         p.estoque_minimo, p.data_validade, p.ativo,
         c.nome AS categoria_nome, f.nome AS fornecedor_nome
    FROM produto p
    JOIN categoria c   ON c.id = p.categoria_id
    LEFT JOIN fornecedor f ON f.id = p.fornecedor_id
`;

// ativo = 1 por causa da RN12: desativado sai da lista mas fica no banco
export async function listar(termo = "", lojaId = 1): Promise<Produto[]> {
  const db = await obterBanco();
  const busca = termo.trim();

  if (busca.length === 0) {
    const linhas = await db.getAllAsync<LinhaProduto>(
      `${SELECAO} WHERE p.ativo = 1 AND p.loja_id = ?
        ORDER BY p.nome COLLATE NOCASE`,
      [lojaId],
    );
    return linhas.map(paraProduto);
  }

  const linhas = await db.getAllAsync<LinhaProduto>(
    `${SELECAO}
      WHERE p.ativo = 1 AND p.loja_id = ?
        AND (p.nome LIKE ? COLLATE NOCASE OR p.codigo_barras LIKE ?)
      ORDER BY p.nome COLLATE NOCASE`,
    [lojaId, `%${busca}%`, `%${busca}%`],
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

export interface DadosProduto {
  nome: string;
  codigoBarras: string | null;
  categoriaId: number;
  fornecedorId: number | null;
  // nulo quando quem grava não informa custo (operador, RN01)
  precoCusto: number | null;
  precoVenda: number;
  estoqueMinimo: number;
  dataValidade: string | null;
}

// Entra com saldo zero; a quantidade inicial vem por movimentação. Sem
// custo informado, o custo fica zero até o proprietário completar.
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
      dados.nome,
      dados.codigoBarras,
      dados.categoriaId,
      dados.fornecedorId,
      dados.precoCusto ?? 0,
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
  // acontece por movimentação, senão o histórico deixa de fechar. Custo
  // nulo mantém o que está gravado.
  await db.runAsync(
    `UPDATE produto
        SET nome = ?, codigo_barras = ?, categoria_id = ?, fornecedor_id = ?,
            preco_custo = COALESCE(?, preco_custo), preco_venda = ?,
            estoque_minimo = ?, data_validade = ?,
            atualizado_em = datetime('now'), sincronizado = 0
      WHERE id = ?`,
    [
      dados.nome,
      dados.codigoBarras,
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

// RN12
export async function desativar(id: number): Promise<void> {
  const db = await obterBanco();
  await db.runAsync(
    `UPDATE produto
        SET ativo = 0, atualizado_em = datetime('now'), sincronizado = 0
      WHERE id = ?`,
    [id],
  );
}

// Saldo de produto ativo, lido dentro da transação da movimentação
export async function lerSaldo(
  id: number,
): Promise<{ estoqueAtual: number; estoqueMinimo: number } | null> {
  const db = await obterBanco();
  const l = await db.getFirstAsync<{ estoque_atual: number; estoque_minimo: number }>(
    "SELECT estoque_atual, estoque_minimo FROM produto WHERE id = ? AND ativo = 1",
    [id],
  );
  return l ? { estoqueAtual: l.estoque_atual, estoqueMinimo: l.estoque_minimo } : null;
}

export async function gravarSaldo(id: number, saldo: number): Promise<void> {
  const db = await obterBanco();
  await db.runAsync(
    `UPDATE produto
        SET estoque_atual = ?, atualizado_em = datetime('now'), sincronizado = 0
      WHERE id = ?`,
    [saldo, id],
  );
}
