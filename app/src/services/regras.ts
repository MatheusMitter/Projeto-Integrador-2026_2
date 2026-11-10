// Regras de negócio. Funções puras, sem acesso a tela ou banco.
//
// Os tipos entram por `import type` de propósito: assim o arquivo não tem
// import que só existe em tempo de compilação, e os testes conseguem
// carregá-lo direto em Node, sem passo de build.

import { TIPOS_ENTRADA } from "../domain/tipos";
import type {
  Produto,
  ProdutoVisivel,
  ResumoEstoque,
  SituacaoEstoque,
  TipoMovimentacao,
  TipoPerfil,
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

  // deixa passar, mas avisa que vai ficar crítico. O texto evita "no
  // mínimo", que em português também quer dizer "pelo menos"
  const situacao = classificarEstoque(saldoResultante, estoqueMinimo);
  if (!entrada && situacao === "CRITICO") {
    const nivel =
      saldoResultante === 0
        ? "sem estoque"
        : saldoResultante < estoqueMinimo
          ? `com ${saldoResultante} unidades, abaixo do estoque mínimo (${estoqueMinimo})`
          : `com ${saldoResultante} unidades, no limite do estoque mínimo`;
    return {
      valido: true,
      aviso: `Atenção: o produto ficará ${nivel}.`,
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
export function podeVerFinanceiro(perfil: TipoPerfil): boolean {
  return perfil === "PROPRIETARIO";
}

// RN01: desativar produto (US09) e manter fornecedores (US15, US16) são
// operações do proprietário. Hoje coincide com o acesso financeiro, mas é
// outra permissão, e por isso outra função.
export function podeGerenciarCadastros(perfil: TipoPerfil): boolean {
  return perfil === "PROPRIETARIO";
}

// RN01, segunda camada: o custo não chega à tela do operador
export function produtoParaPerfil(
  produto: Produto,
  perfil: TipoPerfil,
): ProdutoVisivel {
  return podeVerFinanceiro(perfil) ? produto : { ...produto, precoCusto: null };
}

// RN08 — usa o preço de custo, não o de venda
export function valorEmEstoque(
  itens: { estoqueAtual: number; precoCusto: number }[],
): number {
  return itens.reduce((t, p) => t + p.estoqueAtual * p.precoCusto, 0);
}

/**
 * Indicadores do painel. Usa as mesmas funções da lista de produtos, para
 * o número do cartão e a lista filtrada pelo cartão não divergirem.
 */
export function resumirEstoque(
  produtos: Pick<Produto, "estoqueAtual" | "estoqueMinimo" | "precoCusto" | "dataValidade">[],
  hoje: Date = new Date(),
): ResumoEstoque {
  return {
    totalProdutos: produtos.length,
    valorTotalEstoque: valorEmEstoque(produtos),
    produtosCriticos: produtos.filter(
      (p) => classificarEstoque(p.estoqueAtual, p.estoqueMinimo) === "CRITICO",
    ).length,
    produtosVencendo: produtos.filter((p) => estaVencendo(p.dataValidade, hoje))
      .length,
  };
}

export function formatarReais(valor: number): string {
  return valor.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

// 31.8181 → "31,8%"
export function formatarPercentual(valor: number): string {
  return `${valor.toFixed(1).replace(".", ",")}%`;
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

/** Mesma janela que o painel usa na consulta de produtos vencendo. */
export const DIAS_ALERTA_VENCIMENTO = 15;

/**
 * Dias até a validade, contando em datas de calendário. Negativo se já
 * venceu, null se o produto não tem validade ou a data é inválida.
 */
export function diasParaVencer(
  validadeIso: string | null,
  hoje: Date = new Date(),
): number | null {
  if (!validadeIso) return null;
  const partes = validadeIso.trim().match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!partes) return null;
  const [, ano, mes, dia] = partes;
  const validade = Date.UTC(Number(ano), Number(mes) - 1, Number(dia));
  const base = Date.UTC(hoje.getFullYear(), hoje.getMonth(), hoje.getDate());
  return Math.round((validade - base) / 86_400_000);
}

export function estaVencendo(
  validadeIso: string | null,
  hoje: Date = new Date(),
): boolean {
  const dias = diasParaVencer(validadeIso, hoje);
  return dias !== null && dias <= DIAS_ALERTA_VENCIMENTO;
}

/**
 * "2026-09-30 14:32:05" (datetime do SQLite, em UTC) → "30/09/2026 às 11:32"
 * em Goiânia (UTC−3).
 * Sem isso o histórico mostra o timestamp cru na tela.
 */
export function formatarDataHora(valor: string): string {
  const partes = valor
    .trim()
    .match(/^(\d{4})-(\d{2})-(\d{2})[T ](\d{2}):(\d{2})/);
  if (!partes) return valor;
  const [, ano, mes, dia, hora, minuto] = partes.map(Number);
  // o banco grava em UTC; a tela mostra no fuso do aparelho, senão o
  // registro feito às 16h aparece como 19h em Goiânia
  const d = new Date(Date.UTC(ano, mes - 1, dia, hora, minuto));
  const dois = (n: number) => String(n).padStart(2, "0");
  return (
    `${dois(d.getDate())}/${dois(d.getMonth() + 1)}/${d.getFullYear()} ` +
    `às ${dois(d.getHours())}:${dois(d.getMinutes())}`
  );
}

// -------------------------------------------------------------- cadastros
//
// Validações de entrada dos formulários. Ficam aqui, e não nas telas, para
// valerem igual em qualquer caminho de gravação e poderem ser testadas.

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function emailValido(texto: string): boolean {
  return EMAIL.test(texto.trim());
}

export interface DadosCadastro {
  nome: string;
  email: string;
  senha: string;
  confirmacao: string;
}

export function validarCadastro(d: DadosCadastro): string | null {
  if (d.nome.trim().length < 3) return "Informe o nome completo.";
  if (!emailValido(d.email)) return "Informe um e-mail válido.";
  if (d.senha.length < 8) return "A senha precisa ter no mínimo 8 caracteres.";
  if (!/[a-zA-Z]/.test(d.senha) || !/[0-9]/.test(d.senha))
    return "A senha precisa conter letras e números.";
  if (d.senha !== d.confirmacao) return "As senhas não coincidem.";
  return null;
}

/**
 * Valor em reais digitado no formulário: "12,50", "1.234,56" ou "12.5".
 * Devolve null se estiver vazio ou não for um valor com até dois decimais,
 * em vez de virar zero em silêncio.
 */
export function lerValor(texto: string): number | null {
  let t = texto.trim();
  if (t.includes(",")) t = t.replace(/\./g, "").replace(",", ".");
  if (!/^\d+(\.\d{1,2})?$/.test(t)) return null;
  return Number(t);
}

export function lerInteiro(texto: string): number | null {
  const t = texto.trim();
  return /^\d+$/.test(t) ? Number(t) : null;
}

export interface EntradaProduto {
  nome: string;
  categoriaId: number | null;
  precoCusto: string;
  precoVenda: string;
  estoqueMinimo: string;
  quantidadeInicial: string;
  dataValidade: string;
}

export interface ValoresProduto {
  nome: string;
  categoriaId: number;
  // nulo quando quem grava não informa custo (RN01)
  precoCusto: number | null;
  precoVenda: number;
  estoqueMinimo: number;
  quantidadeInicial: number;
  dataValidade: string | null;
}

/**
 * Campos obrigatórios da US05: nome, categoria, preço de venda, estoque
 * mínimo e, no cadastro, quantidade inicial. O custo é obrigatório para
 * quem o vê; o operador não informa custo (RN01). Preços precisam ser
 * maiores que zero.
 */
export function validarProduto(
  e: EntradaProduto,
  opcoes: { informaCusto: boolean; editando: boolean },
): { valido: true; valores: ValoresProduto } | { valido: false; mensagem: string } {
  const falha = (mensagem: string) => ({ valido: false as const, mensagem });

  if (e.nome.trim().length < 2) return falha("Informe o nome do produto.");
  if (e.categoriaId === null) return falha("Selecione a categoria.");

  const custo = opcoes.informaCusto ? lerValor(e.precoCusto) : null;
  if (opcoes.informaCusto && (custo === null || custo <= 0))
    return falha("Informe o preço de custo, maior que zero.");

  const venda = lerValor(e.precoVenda);
  if (venda === null || venda <= 0)
    return falha("Informe o preço de venda, maior que zero.");

  const minimo = lerInteiro(e.estoqueMinimo);
  if (minimo === null) return falha("Informe o estoque mínimo (zero ou mais).");

  const inicial = opcoes.editando ? 0 : lerInteiro(e.quantidadeInicial);
  if (inicial === null)
    return falha("Informe a quantidade inicial (zero ou mais).");

  const erroValidade = validarDataValidade(e.dataValidade);
  if (erroValidade) return falha(erroValidade);

  return {
    valido: true,
    valores: {
      nome: e.nome.trim(),
      categoriaId: e.categoriaId,
      precoCusto: custo,
      precoVenda: venda,
      estoqueMinimo: minimo,
      quantidadeInicial: inicial,
      dataValidade: paraDataIso(e.dataValidade),
    },
  };
}

export function validarFornecedor(d: { nome: string; email: string }): string | null {
  if (d.nome.trim().length < 2) return "Informe o nome do fornecedor.";
  if (d.email.trim().length > 0 && !emailValido(d.email))
    return "Informe um e-mail válido ou deixe o campo em branco.";
  return null;
}
