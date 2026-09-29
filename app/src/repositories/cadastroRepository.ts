// Acesso a dados de categoria e fornecedor.

import { obterBanco, gerarUuid } from "../database/conexao";
import { Categoria, Fornecedor } from "../domain/tipos";

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

// usado pela RN13
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

export async function inserirFornecedor(
  dados: { nome: string; telefone?: string; email?: string },
  lojaId = 1,
): Promise<number> {
  const db = await obterBanco();
  const r = await db.runAsync(
    `INSERT INTO fornecedor (uuid, loja_id, nome, telefone, email)
     VALUES (?, ?, ?, ?, ?)`,
    [
      gerarUuid(),
      lojaId,
      dados.nome.trim(),
      dados.telefone?.trim() || null,
      dados.email?.trim() || null,
    ],
  );
  return r.lastInsertRowId;
}

export async function atualizarFornecedor(
  id: number,
  dados: { nome: string; telefone?: string; email?: string },
): Promise<void> {
  const db = await obterBanco();
  await db.runAsync(
    `UPDATE fornecedor
        SET nome = ?, telefone = ?, email = ?, sincronizado = 0
      WHERE id = ?`,
    [
      dados.nome.trim(),
      dados.telefone?.trim() || null,
      dados.email?.trim() || null,
      id,
    ],
  );
}

// RN13. Checa aqui para dar mensagem melhor, mas a chave estrangeira
// no banco também impede.
export async function excluirFornecedor(
  id: number,
): Promise<{ sucesso: boolean; mensagem?: string }> {
  const vinculados = await contarProdutosDoFornecedor(id);
  if (vinculados > 0) {
    return {
      sucesso: false,
      mensagem:
        `Não é possível excluir: ${vinculados} produto(s) ainda estão ` +
        `vinculados a este fornecedor. Reatribua ou desative esses ` +
        `produtos antes de excluí-lo. Regra RN13.`,
    };
  }

  const db = await obterBanco();
  try {
    await db.runAsync("DELETE FROM fornecedor WHERE id = ?", [id]);
    return { sucesso: true };
  } catch {
    return {
      sucesso: false,
      mensagem: "O fornecedor está referenciado por outros registros.",
    };
  }
}
