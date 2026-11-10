// Acesso a dados de categoria e fornecedor.

import { obterBanco, gerarUuid } from "../database/conexao";
import type { Categoria, Fornecedor } from "../domain/tipos";

// ---------------------------------------------------------------- categoria

export async function listarCategorias(lojaId = 1): Promise<Categoria[]> {
  const db = await obterBanco();
  const linhas = await db.getAllAsync<{
    id: number;
    loja_id: number;
    nome: string;
    ativo: number;
  }>(
    `SELECT id, loja_id, nome, ativo FROM categoria
      WHERE ativo = 1 AND loja_id = ? ORDER BY nome COLLATE NOCASE`,
    [lojaId],
  );
  return linhas.map((l) => ({
    id: l.id,
    lojaId: l.loja_id,
    nome: l.nome,
    ativo: l.ativo === 1,
  }));
}

// --------------------------------------------------------------- fornecedor

interface LinhaFornecedor {
  id: number;
  loja_id: number;
  nome: string;
  telefone: string | null;
  email: string | null;
  ativo: number;
}

function paraFornecedor(l: LinhaFornecedor): Fornecedor {
  return {
    id: l.id,
    lojaId: l.loja_id,
    nome: l.nome,
    telefone: l.telefone,
    email: l.email,
    ativo: l.ativo === 1,
  };
}

export async function listarFornecedores(lojaId = 1): Promise<Fornecedor[]> {
  const db = await obterBanco();
  const linhas = await db.getAllAsync<LinhaFornecedor>(
    `SELECT id, loja_id, nome, telefone, email, ativo FROM fornecedor
      WHERE ativo = 1 AND loja_id = ? ORDER BY nome COLLATE NOCASE`,
    [lojaId],
  );
  return linhas.map(paraFornecedor);
}

// produtos ativos vinculados, usado pela RN13
export async function contarProdutosDoFornecedor(
  fornecedorId: number,
): Promise<number> {
  const db = await obterBanco();
  const l = await db.getFirstAsync<{ total: number }>(
    "SELECT COUNT(*) AS total FROM produto WHERE fornecedor_id = ? AND ativo = 1",
    [fornecedorId],
  );
  return l?.total ?? 0;
}

// a mesma contagem para a lista inteira, numa consulta só
export async function contarProdutosPorFornecedor(
  lojaId = 1,
): Promise<Record<number, number>> {
  const db = await obterBanco();
  const linhas = await db.getAllAsync<{ fornecedor_id: number; total: number }>(
    `SELECT fornecedor_id, COUNT(*) AS total FROM produto
      WHERE fornecedor_id IS NOT NULL AND ativo = 1 AND loja_id = ?
      GROUP BY fornecedor_id`,
    [lojaId],
  );
  const mapa: Record<number, number> = {};
  for (const l of linhas) mapa[l.fornecedor_id] = l.total;
  return mapa;
}

export interface DadosFornecedor {
  nome: string;
  telefone: string | null;
  email: string | null;
}

export async function inserirFornecedor(
  dados: DadosFornecedor,
  lojaId = 1,
): Promise<number> {
  const db = await obterBanco();
  const r = await db.runAsync(
    `INSERT INTO fornecedor (uuid, loja_id, nome, telefone, email)
     VALUES (?, ?, ?, ?, ?)`,
    [gerarUuid(), lojaId, dados.nome, dados.telefone, dados.email],
  );
  return r.lastInsertRowId;
}

export async function atualizarFornecedor(
  id: number,
  dados: DadosFornecedor,
): Promise<void> {
  const db = await obterBanco();
  await db.runAsync(
    `UPDATE fornecedor
        SET nome = ?, telefone = ?, email = ?, sincronizado = 0
      WHERE id = ?`,
    [dados.nome, dados.telefone, dados.email, id],
  );
}

// RN12: fornecedor não é apagado, é desativado e sai das listas
export async function desativarFornecedor(id: number): Promise<void> {
  const db = await obterBanco();
  await db.runAsync(
    "UPDATE fornecedor SET ativo = 0, sincronizado = 0 WHERE id = ?",
    [id],
  );
}
