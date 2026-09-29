/**
 * Serviço de estoque — camada de negócio.
 *
 * É aqui que a movimentação acontece. O ponto importante deste arquivo é a
 * transação: atualizar o saldo do produto e gravar o histórico precisam
 * ocorrer de forma indivisível.
 *
 * Se a primeira escrita acontecer e a segunda falhar, o saldo passa a
 * divergir do histórico e a auditoria exigida por RN05 se perde — o estoque
 * diria 45 e a soma dos lançamentos diria 50, sem nada explicando a
 * diferença.
 */

import { obterBanco, gerarUuid } from "../database/conexao";
import { Movimentacao, TipoMovimentacao } from "../domain/tipos";
import { ehEntrada, validarMovimentacao } from "./regras";

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

/**
 * Registra uma movimentação de estoque.
 *
 * Sequência dentro da transação:
 *   1. lê o saldo atual do produto
 *   2. valida RN06 contra o saldo lido
 *   3. calcula o saldo resultante
 *   4. atualiza o produto
 *   5. grava a movimentação com o saldo resultante
 *   6. confirma, ou desfaz tudo em caso de erro
 *
 * Sobre concorrência: no servidor o passo 1 usa SELECT ... FOR UPDATE para
 * bloquear a linha, impedindo que duas movimentações simultâneas leiam o
 * mesmo saldo. O SQLite serializa as escritas por natureza, então aqui a
 * transação já garante o mesmo efeito.
 */
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
        // Sair da função sem gravar nada desfaz a transação.
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
    // A restrição CHECK do banco é a última barreira. Se chegou aqui, algum
    // caminho de código tentou gravar saldo negativo apesar da validação.
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

/** Histórico de um produto, do mais recente para o mais antigo. */
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

/** Histórico geral, usado na tela de movimentações. */
export async function historicoGeral(limite = 50): Promise<Movimentacao[]> {
  const db = await obterBanco();
  const linhas = await db.getAllAsync<LinhaMovimentacao>(
    `SELECT m.*, p.nome AS produto_nome, u.nome AS usuario_nome
       FROM movimentacao m
       JOIN produto p ON p.id = m.produto_id
       JOIN usuario u ON u.id = m.usuario_id
      ORDER BY m.data_hora DESC, m.id DESC
      LIMIT ?`,
    [limite],
  );
  return linhas.map(paraMovimentacao);
}

/**
 * Quantos registros aguardam envio ao servidor.
 *
 * A sincronização em si entra no Ciclo 3. A marcação já existe desde agora
 * porque acrescentar a coluna depois exigiria migração do banco de quem já
 * estivesse usando o aplicativo.
 */
export async function pendentesDeSincronizacao(): Promise<number> {
  const db = await obterBanco();
  const l = await db.getFirstAsync<{ total: number }>(
    `SELECT (SELECT COUNT(*) FROM produto      WHERE sincronizado = 0)
          + (SELECT COUNT(*) FROM movimentacao WHERE sincronizado = 0)
          + (SELECT COUNT(*) FROM fornecedor   WHERE sincronizado = 0) AS total`,
  );
  return l?.total ?? 0;
}

export { ehEntrada };
