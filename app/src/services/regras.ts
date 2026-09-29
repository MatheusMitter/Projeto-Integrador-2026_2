/**
 * Camada de negócio: as regras do domínio.
 *
 * Estas funções não conhecem tela nem banco. Recebem número, devolvem
 * decisão. É isso que permite testá-las sem abrir o aplicativo, e é o
 * motivo de a camada existir separada.
 *
 * As regras estão descritas em docs/N1-documento-de-projeto.md.
 */

import { SituacaoEstoque, TipoMovimentacao, TIPOS_ENTRADA } from "../domain/tipos";

/** Uma movimentação soma ou subtrai do saldo? */
export function ehEntrada(tipo: TipoMovimentacao): boolean {
  return (TIPOS_ENTRADA as readonly string[]).includes(tipo);
}

/**
 * RN07 — classifica o produto em relação ao estoque mínimo que o usuário
 * definiu.
 *
 * A faixa é relativa, não absoluta: 8 unidades pode ser excesso para um
 * item que sai uma vez por mês e falta para um que sai todo dia. Por isso
 * a comparação é sempre contra o mínimo.
 */
export function classificarEstoque(
  saldo: number,
  minimo: number,
): SituacaoEstoque {
  // Sem mínimo definido não há como classificar; trata como normal para
  // não marcar todo produto novo como crítico.
  if (minimo <= 0) return saldo > 0 ? "NORMAL" : "CRITICO";

  if (saldo <= minimo) return "CRITICO";
  if (saldo <= minimo * 1.5) return "BAIXO";
  if (saldo <= minimo * 3) return "NORMAL";
  return "EXCESSO";
}

export interface ResultadoValidacao {
  valido: boolean;
  /** Mensagem para o usuário. Diz o que fazer, não apenas que deu errado. */
  mensagem?: string;
  /** Aviso que não impede a gravação. */
  aviso?: string;
  saldoResultante: number;
}

/**
 * RN06 — a saída não pode exceder o estoque disponível.
 *
 * Validar aqui é conveniência: responde na hora e evita registro errado.
 * A garantia real é do servidor, porque dois aparelhos offline podem
 * registrar saídas que, somadas, estouram o saldo — e isso só aparece na
 * consolidação.
 */
export function validarMovimentacao(
  tipo: TipoMovimentacao,
  quantidade: number,
  saldoAtual: number,
  estoqueMinimo: number,
): ResultadoValidacao {
  if (!Number.isInteger(quantidade) || quantidade <= 0) {
    return {
      valido: false,
      mensagem: "Informe uma quantidade inteira maior que zero.",
      saldoResultante: saldoAtual,
    };
  }

  const entrada = ehEntrada(tipo);
  const saldoResultante = entrada
    ? saldoAtual + quantidade
    : saldoAtual - quantidade;

  if (!entrada && quantidade > saldoAtual) {
    return {
      valido: false,
      mensagem:
        `Não é possível registrar esta saída. A quantidade informada ` +
        `(${quantidade}) é maior que o estoque disponível (${saldoAtual}). ` +
        `Regra RN06.`,
      saldoResultante: saldoAtual,
    };
  }

  // Passa, mas avisa: o produto vai entrar em situação crítica (RN07).
  const situacao = classificarEstoque(saldoResultante, estoqueMinimo);
  if (!entrada && situacao === "CRITICO") {
    return {
      valido: true,
      aviso:
        `Atenção: o produto ficará com ${saldoResultante} unidades, ` +
        `no mínimo de ${estoqueMinimo} ou abaixo dele.`,
      saldoResultante,
    };
  }

  return { valido: true, saldoResultante };
}

/**
 * RN10 — margem de lucro sobre o preço de venda.
 * Devolve nulo quando não há preço de venda, em vez de dividir por zero.
 */
export function calcularMargem(
  precoCusto: number,
  precoVenda: number,
): { valor: number; percentual: number } | null {
  if (precoVenda <= 0) return null;
  const valor = precoVenda - precoCusto;
  return { valor, percentual: (valor / precoVenda) * 100 };
}

/**
 * RN03 — preço de venda abaixo do custo gera advertência, não bloqueio.
 * Liquidação e queima de estoque próximo ao vencimento são legítimas.
 */
export function avisoPreco(
  precoCusto: number,
  precoVenda: number,
): string | null {
  if (precoVenda > 0 && precoVenda < precoCusto) {
    return "O preço de venda está abaixo do custo. Você pode salvar assim, mas confira se é intencional.";
  }
  return null;
}

/**
 * RN01 — o perfil Operador não vê informação financeira.
 *
 * Aqui só decide; quem oculta é a tela. Centralizar a decisão evita que
 * uma tela nova esqueça a regra.
 */
export function podeVerFinanceiro(perfil: string): boolean {
  return perfil === "PROPRIETARIO";
}

/** RN08 — valor do estoque usa o preço de CUSTO: é capital imobilizado. */
export function valorEmEstoque(
  itens: { estoqueAtual: number; precoCusto: number }[],
): number {
  return itens.reduce((t, p) => t + p.estoqueAtual * p.precoCusto, 0);
}

export function formatarReais(valor: number): string {
  return valor.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}
