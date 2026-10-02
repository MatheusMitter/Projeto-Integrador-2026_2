// Movimentação de estoque. O saldo do produto e o histórico são gravados
// na mesma transação, senão os dois ficam diferentes.

import { obterBanco, gerarUuid } from "../database/conexao";
import { Movimentacao, TipoMovimentacao } from "../domain/tipos";
import { validarMovimentacao } from "./regras";

export interface PedidoMovimentacao {
  produtoId: number;
  usuarioId: number;
  tipo: TipoMovimentacao;
  quantidade: number;
  observacoes?: string | null;
}

export interface ResultadoMovimentacao {
  sucesso: boolean;
  mensagem?: string;
  aviso?: string;
  saldoResultante?: number;
}

// Lê o saldo, valida, atualiza o produto e grava o histórico — tudo numa
// transação. No servidor o SELECT vai usar FOR UPDATE para travar a linha;
// aqui o SQLite já serializa as escritas.
export async function registrarMovimentacao(
  pedido: PedidoMovimentacao,
): Promise<ResultadoMovimentacao> {
  const db = await obterBanco();

  try {
    let resultado: ResultadoMovimentacao = { sucesso: false };

    await db.withTransactionAsync(async () => {
      // 1. saldo atual
      const produto = await db.getFirstAsync<{
        estoque_atual: number;
        estoque_minimo: number;
        nome: string;
      }>(
        "SELECT estoque_atual, estoque_minimo, nome FROM produto WHERE id = ? AND ativo = 1",
        [pedido.produtoId],
      );

      if (!produto) {
        resultado = {
          sucesso: false,
          mensagem: "Produto não encontrado ou desativado.",
        };
        return;
      }

      // 2. validação das regras
      const validacao = validarMovimentacao(
        pedido.tipo,
        pedido.quantidade,
        produto.estoque_atual,
        produto.estoque_minimo,
      );

      if (!validacao.valido) {
        resultado = { sucesso: false, mensagem: validacao.mensagem };
        // sair sem gravar desfaz a transação
        return;
      }

      // 3 e 4. saldo novo e atualização do produto
      const saldo = validacao.saldoResultante;
      await db.runAsync(
        `UPDATE produto
            SET estoque_atual = ?, atualizado_em = datetime('now'), sincronizado = 0
          WHERE id = ?`,
        [saldo, pedido.produtoId],
      );

      // 5. histórico, com o saldo resultante gravado
      await db.runAsync(
        `INSERT INTO movimentacao
           (uuid, produto_id, usuario_id, tipo, quantidade, saldo_apos, observacoes)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          gerarUuid(),
          pedido.produtoId,
          pedido.usuarioId,
          pedido.tipo,
          pedido.quantidade,
          saldo,
          pedido.observacoes?.trim() || null,
        ],
      );

      resultado = {
        sucesso: true,
        aviso: validacao.aviso,
        saldoResultante: saldo,
      };
    });

    return resultado;
  } catch (erro) {
    // se caiu aqui, o CHECK do banco pegou algo que passou da validação
    const texto = erro instanceof Error ? erro.message : String(erro);
    if (texto.includes("CHECK") || texto.includes("constraint")) {
      return {
        sucesso: false,
        mensagem:
          "A operação deixaria o estoque negativo e foi recusada pelo banco de dados.",
      };
    }
    return {
      sucesso: false,
      mensagem: "Não foi possível registrar a movimentação. Tente novamente.",
    };
  }
}

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

export async function historicoDoProduto(
  produtoId: number,
  limite = 10,
): Promise<Movimentacao[]> {
  const db = await obterBanco();
  const linhas = await db.getAllAsync<LinhaMovimentacao>(
    `SELECT m.*, u.nome AS usuario_nome
       FROM movimentacao m
       JOIN usuario u ON u.id = m.usuario_id
      WHERE m.produto_id = ?
      ORDER BY m.data_hora DESC, m.id DESC
      LIMIT ?`,
    [produtoId, limite],
  );
  return linhas.map(paraMovimentacao);
}

/**
 * Quantos registros locais ainda não foram enviados ao servidor.
 *
 * O envio em si só existe a partir do Ciclo 3. Até lá este número nunca
 * diminui, porque nada marca `sincronizado = 1` — e é exatamente isso que
 * a coluna deve indicar hoje: tudo o que está no aparelho está só aqui. A
 * coluna já entrou no esquema para não exigir migração do banco depois.
 */
export async function registrosNaoSincronizados(): Promise<number> {
  const db = await obterBanco();
  const l = await db.getFirstAsync<{ total: number }>(
    `SELECT (SELECT COUNT(*) FROM produto      WHERE sincronizado = 0)
          + (SELECT COUNT(*) FROM movimentacao WHERE sincronizado = 0)
          + (SELECT COUNT(*) FROM fornecedor   WHERE sincronizado = 0)
          + (SELECT COUNT(*) FROM categoria    WHERE sincronizado = 0) AS total`,
  );
  return l?.total ?? 0;
}
