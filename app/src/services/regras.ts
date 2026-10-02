// Regras de negócio. Funções puras, sem acesso a tela ou banco.
//
// Os tipos entram por `import type` de propósito: assim o arquivo não tem
// import que só existe em tempo de compilação, e os testes conseguem
// carregá-lo direto em Node, sem passo de build.

import { TIPOS_ENTRADA } from "../domain/tipos";
import type { SituacaoEstoque, TipoMovimentacao } from "../domain/tipos";

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

// ------------------------------------------------------------------ datas
//
// O banco guarda data em ISO (AAAA-MM-DD), porque é o formato que o SQLite
// compara e ordena como texto. A tela usa DD/MM/AAAA, que é o que o
// comerciante lê na embalagem. A conversão vive aqui, em função pura, para
// os dois lados não divergirem.

/** "30/11/2026" → "2026-11-30". Devolve null se estiver vazio ou inválido. */
export function paraDataIso(texto: string): string | null {
  const limpo = texto.trim();
  if (limpo.length === 0) return null;

  const partes = limpo.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (!partes) return null;

  const [, dia, mes, ano] = partes;
  const iso = `${ano}-${mes}-${dia}`;

  // rejeita 31/02: o Date normaliza silenciosamente, então conferimos a volta
  const d = new Date(`${iso}T00:00:00`);
  if (Number.isNaN(d.getTime())) return null;
  if (
    d.getFullYear() !== Number(ano) ||
    d.getMonth() + 1 !== Number(mes) ||
    d.getDate() !== Number(dia)
  ) {
    return null;
  }

  return iso;
}

/** "2026-11-30" → "30/11/2026". Campo vazio vira string vazia. */
export function paraDataBr(iso: string | null): string {
  if (!iso) return "";
  const partes = iso.trim().match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!partes) return "";
  const [, ano, mes, dia] = partes;
  return `${dia}/${mes}/${ano}`;
}

/**
 * Valida o campo de validade. Vazio é aceito: nem todo produto tem
 * validade, e obrigar uma data inventada é pior que não ter o dado.
 */
export function validarDataValidade(texto: string): string | null {
  if (texto.trim().length === 0) return null;
  if (paraDataIso(texto) === null) {
    return "Informe a validade no formato DD/MM/AAAA, ou deixe em branco.";
  }
  return null;
}

/**
 * "2026-09-30 14:32:05" (datetime do SQLite, em UTC) → "30/09/2026 às 14:32".
 * Sem isso o histórico mostra o timestamp cru na tela.
 */
export function formatarDataHora(valor: string): string {
  const partes = valor
    .trim()
    .match(/^(\d{4})-(\d{2})-(\d{2})[T ](\d{2}):(\d{2})/);
  if (!partes) return valor;
  const [, ano, mes, dia, hora, minuto] = partes;
  return `${dia}/${mes}/${ano} às ${hora}:${minuto}`;
}
