// Regras de negócio. Funções puras, sem acesso a tela ou banco.

import {
  SituacaoEstoque,
  TipoMovimentacao,
  TIPOS_ENTRADA,
} from "../domain/tipos";

export function ehEntrada(tipo: TipoMovimentacao): boolean {
  return (TIPOS_ENTRADA as readonly string[]).includes(tipo);
}

// RN07
export function classificarEstoque(
  saldo: number,
  minimo: number,
): SituacaoEstoque {
  // sem mínimo definido não dá para classificar
  if (minimo <= 0) return saldo > 0 ? "NORMAL" : "CRITICO";

  if (saldo <= minimo) return "CRITICO";
  if (saldo <= minimo * 1.5) return "BAIXO";
  if (saldo <= minimo * 3) return "NORMAL";
  return "EXCESSO";
}

export interface ResultadoValidacao {
  valido: boolean;
  mensagem?: string;
  aviso?: string;
  saldoResultante: number;
}

// RN06
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
        `(${quantidade}) é maior que o estoque disponível (${saldoAtual}).`,
      saldoResultante: saldoAtual,
    };
  }

  // deixa passar, mas avisa que vai ficar crítico
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

// RN10
export function calcularMargem(
  precoCusto: number,
  precoVenda: number,
): { valor: number; percentual: number } | null {
  if (precoVenda <= 0) return null;
  const valor = precoVenda - precoCusto;
  return { valor, percentual: (valor / precoVenda) * 100 };
}

// RN03 — avisa, mas não impede de salvar
export function avisoPreco(
  precoCusto: number,
  precoVenda: number,
): string | null {
  if (precoVenda > 0 && precoVenda < precoCusto) {
    return "O preço de venda está abaixo do custo. Você pode salvar assim, mas confira se é intencional.";
  }
  return null;
}

// RN01
export function podeVerFinanceiro(perfil: string): boolean {
  return perfil === "PROPRIETARIO";
}

// RN08 — usa o preço de custo, não o de venda
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
