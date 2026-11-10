// Acesso a dados de movimentação. O histórico só recebe inclusão: não há
// alteração nem exclusão de lançamento (RN05).

import { obterBanco, gerarUuid } from "../database/conexao";
import type { Movimentacao, TipoMovimentacao } from "../domain/tipos";

interface LinhaMovimentacao {
  id: number;
  uuid: string;
  produto_id: number;
  usuario_id: number;
  tipo: TipoMovimentacao;
  quantidade: number;
  saldo_apos: number;
  data_hora: string;
  observacoes: string | null;
  produto_nome?: string;
  usuario_nome?: string;
}

function paraMovimentacao(l: LinhaMovimentacao): Movimentacao {
  return {
    id: l.id,
    uuid: l.uuid,
    produtoId: l.produto_id,
    usuarioId: l.usuario_id,
    tipo: l.tipo,
    quantidade: l.quantidade,
    saldoApos: l.saldo_apos,
    dataHora: l.data_hora,
    observacoes: l.observacoes,
    produtoNome: l.produto_nome,
    usuarioNome: l.usuario_nome,
  };
}

const COLUNAS = `m.id, m.uuid, m.produto_id, m.usuario_id, m.tipo, m.quantidade,
                 m.saldo_apos, m.data_hora, m.observacoes`;

export async function inserir(m: {
  produtoId: number;
  usuarioId: number;
  tipo: TipoMovimentacao;
  quantidade: number;
  saldoApos: number;
  observacoes: string | null;
}): Promise<void> {
  const db = await obterBanco();
  await db.runAsync(
    `INSERT INTO movimentacao
       (uuid, produto_id, usuario_id, tipo, quantidade, saldo_apos, observacoes)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      gerarUuid(),
      m.produtoId,
      m.usuarioId,
      m.tipo,
      m.quantidade,
      m.saldoApos,
      m.observacoes,
    ],
  );
}

export async function historicoDoProduto(
  produtoId: number,
  limite = 10,
): Promise<Movimentacao[]> {
  const db = await obterBanco();
  const linhas = await db.getAllAsync<LinhaMovimentacao>(
    `SELECT ${COLUNAS}, u.nome AS usuario_nome
       FROM movimentacao m
       JOIN usuario u ON u.id = m.usuario_id
      WHERE m.produto_id = ?
      ORDER BY m.data_hora DESC, m.id DESC
      LIMIT ?`,
    [produtoId, limite],
  );
  return linhas.map(paraMovimentacao);
}

// histórico geral da loja, mais recente primeiro
export async function ultimas(limite = 5, lojaId = 1): Promise<Movimentacao[]> {
  const db = await obterBanco();
  const linhas = await db.getAllAsync<LinhaMovimentacao>(
    `SELECT ${COLUNAS}, p.nome AS produto_nome, u.nome AS usuario_nome
       FROM movimentacao m
       JOIN produto p ON p.id = m.produto_id
       JOIN usuario u ON u.id = m.usuario_id
      WHERE p.loja_id = ?
      ORDER BY m.data_hora DESC, m.id DESC
      LIMIT ?`,
    [lojaId, limite],
  );
  return linhas.map(paraMovimentacao);
}
