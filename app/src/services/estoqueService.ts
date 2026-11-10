// Movimentação de estoque. O saldo do produto e o histórico são gravados
// na mesma transação, senão os dois ficam diferentes.

import { emTransacao } from "../database/conexao";
import type { Movimentacao, TipoMovimentacao } from "../domain/tipos";
import * as movimentacaoRepo from "../repositories/movimentacaoRepository";
import * as produtoRepo from "../repositories/produtoRepository";
import { sessaoAtual } from "./authService";
import { validarMovimentacao } from "./regras";

export interface PedidoMovimentacao {
  produtoId: number;
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
 * Lê o saldo, valida, atualiza o produto e grava o histórico. Só pode ser
 * chamada dentro de emTransacao: registrarMovimentacao abre a sua, e o
 * cadastro de produto usa esta mesma função dentro da transação dele. No
 * servidor a leitura do saldo vai usar FOR UPDATE para travar a linha;
 * aqui o SQLite já serializa as escritas.
 */
export async function aplicarMovimentacao(
  pedido: PedidoMovimentacao,
  usuarioId: number,
): Promise<ResultadoMovimentacao> {
  // 1. saldo atual
  const produto = await produtoRepo.lerSaldo(pedido.produtoId);
  if (!produto) {
    return { sucesso: false, mensagem: "Produto não encontrado ou desativado." };
  }

  // 2. validação das regras
  const validacao = validarMovimentacao(
    pedido.tipo,
    pedido.quantidade,
    produto.estoqueAtual,
    produto.estoqueMinimo,
  );
  if (!validacao.valido) {
    return { sucesso: false, mensagem: validacao.mensagem };
  }

  // 3 e 4. saldo novo e atualização do produto
  const saldo = validacao.saldoResultante;
  await produtoRepo.gravarSaldo(pedido.produtoId, saldo);

  // 5. histórico, com o saldo resultante gravado
  await movimentacaoRepo.inserir({
    produtoId: pedido.produtoId,
    usuarioId,
    tipo: pedido.tipo,
    quantidade: pedido.quantidade,
    saldoApos: saldo,
    observacoes: pedido.observacoes?.trim() || null,
  });

  return { sucesso: true, aviso: validacao.aviso, saldoResultante: saldo };
}

export async function registrarMovimentacao(
  pedido: PedidoMovimentacao,
): Promise<ResultadoMovimentacao> {
  // RN05: o responsável vem da sessão, nunca de um valor padrão
  const usuario = sessaoAtual();
  if (!usuario) {
    return {
      sucesso: false,
      mensagem: "Sua sessão foi encerrada. Entre de novo para registrar.",
    };
  }

  try {
    return await emTransacao(() => aplicarMovimentacao(pedido, usuario.id));
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

export function historicoDoProduto(
  produtoId: number,
  limite = 10,
): Promise<Movimentacao[]> {
  return movimentacaoRepo.historicoDoProduto(produtoId, limite);
}
