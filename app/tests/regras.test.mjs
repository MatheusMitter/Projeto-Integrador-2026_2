// Testes das regras de negócio. Rodam sem emulador e sem banco.
// Executar: npm test
//
// As funções são importadas de src/services/regras.ts, não copiadas. A
// versão anterior deste arquivo mantinha uma cópia em JavaScript, e as
// cópias já haviam divergido do original — a suíte passava sempre e não
// detectava regressão. Node carrega o TypeScript removendo os tipos
// (v22.18 ou superior), então não há passo de build.

import { test, describe } from "node:test";
import assert from "node:assert/strict";

import {
  calcularMargem,
  classificarEstoque,
  avisoPreco,
  diasParaVencer,
  ehEntrada,
  emailValido,
  estaVencendo,
  formatarDataHora,
  formatarPercentual,
  formatarReais,
  lerInteiro,
  lerValor,
  paraDataBr,
  paraDataIso,
  podeGerenciarCadastros,
  podeVerFinanceiro,
  produtoParaPerfil,
  resumirEstoque,
  validarCadastro,
  validarDataValidade,
  validarFornecedor,
  validarMovimentacao,
  validarProduto,
  valorEmEstoque,
} from "../src/services/regras.ts";

describe("RN06 — a saída não pode exceder o estoque disponível", () => {
  test("recusa saída maior que o saldo", () => {
    const r = validarMovimentacao("VENDA", 60, 50, 10);
    assert.equal(r.valido, false);
    // a mensagem precisa dizer ao usuário o que ele pediu e o que existe
    assert.match(r.mensagem, /60/);
    assert.match(r.mensagem, /50/);
  });

  test("aceita saída igual ao saldo, deixando zero", () => {
    const r = validarMovimentacao("VENDA", 50, 50, 10);
    assert.equal(r.valido, true);
    assert.equal(r.saldoResultante, 0);
  });

  test("aceita saída menor que o saldo", () => {
    const r = validarMovimentacao("VENDA", 7, 50, 10);
    assert.equal(r.valido, true);
    assert.equal(r.saldoResultante, 43);
  });

  test("entrada nunca é limitada pelo saldo", () => {
    const r = validarMovimentacao("COMPRA", 9999, 0, 10);
    assert.equal(r.valido, true);
    assert.equal(r.saldoResultante, 9999);
  });

  test("recusa quantidade zero, negativa ou fracionada", () => {
    for (const q of [0, -5, 1.5]) {
      assert.equal(validarMovimentacao("VENDA", q, 50, 10).valido, false);
    }
  });

  test("saldo não muda quando a movimentação é recusada", () => {
    const r = validarMovimentacao("VENDA", 60, 50, 10);
    assert.equal(r.saldoResultante, 50);
  });
});

describe("RN07 — classificação da situação de estoque", () => {
  test("saldo igual ao mínimo é crítico", () => {
    assert.equal(classificarEstoque(10, 10), "CRITICO");
  });

  test("saldo abaixo do mínimo é crítico", () => {
    assert.equal(classificarEstoque(3, 10), "CRITICO");
  });

  test("até uma vez e meia o mínimo é baixo", () => {
    assert.equal(classificarEstoque(15, 10), "BAIXO");
  });

  test("até três vezes o mínimo é normal", () => {
    assert.equal(classificarEstoque(30, 10), "NORMAL");
  });

  test("acima de três vezes o mínimo é excesso", () => {
    assert.equal(classificarEstoque(31, 10), "EXCESSO");
  });

  test("a mesma quantidade muda de situação conforme o mínimo", () => {
    assert.equal(classificarEstoque(8, 20), "CRITICO");
    assert.equal(classificarEstoque(8, 2), "EXCESSO");
  });

  test("sem mínimo definido, só distingue ter e não ter", () => {
    assert.equal(classificarEstoque(5, 0), "NORMAL");
    assert.equal(classificarEstoque(0, 0), "CRITICO");
  });

  test("avisa quando a saída deixa o produto crítico", () => {
    const r = validarMovimentacao("VENDA", 42, 50, 10);
    assert.equal(r.valido, true);
    assert.ok(r.aviso, "deveria avisar que ficará crítico");
    assert.match(r.aviso, /8/);
  });

  test("o aviso diz se o saldo fica abaixo, no limite ou sem estoque", () => {
    assert.match(
      validarMovimentacao("VENDA", 42, 50, 10).aviso,
      /8 unidades, abaixo do estoque mínimo \(10\)/,
    );
    assert.match(
      validarMovimentacao("VENDA", 40, 50, 10).aviso,
      /10 unidades, no limite do estoque mínimo/,
    );
    assert.match(validarMovimentacao("VENDA", 50, 50, 10).aviso, /sem estoque/);
    assert.match(validarMovimentacao("PERDA", 3, 3, 0).aviso, /sem estoque/);
  });

  test("o aviso não usa \"no mínimo\", que também quer dizer \"pelo menos\"", () => {
    for (const qtd of [40, 42, 50]) {
      assert.doesNotMatch(validarMovimentacao("VENDA", qtd, 50, 10).aviso, /no mínimo/);
    }
  });

  test("não avisa quando o saldo permanece confortável", () => {
    const r = validarMovimentacao("VENDA", 5, 50, 10);
    assert.equal(r.aviso, undefined);
  });
});

describe("classificação de entrada e saída", () => {
  test("os tipos de entrada somam ao estoque", () => {
    for (const t of ["COMPRA", "DEVOLUCAO_CLIENTE", "AJUSTE_ENTRADA"]) {
      assert.equal(ehEntrada(t), true, `${t} deveria ser entrada`);
    }
  });

  test("os tipos de saída subtraem do estoque", () => {
    for (const t of [
      "VENDA",
      "PERDA",
      "VENCIMENTO",
      "DEVOLUCAO_FORNECEDOR",
      "AJUSTE_SAIDA",
    ]) {
      assert.equal(ehEntrada(t), false, `${t} deveria ser saída`);
    }
  });
});

describe("RN10 — margem de lucro", () => {
  test("calcula valor e percentual sobre o preço de venda", () => {
    const m = calcularMargem(15, 22);
    assert.equal(m.valor, 7);
    assert.ok(Math.abs(m.percentual - 31.8181) < 0.01);
  });

  test("devolve nulo sem preço de venda, em vez de dividir por zero", () => {
    assert.equal(calcularMargem(10, 0), null);
  });

  test("margem negativa quando a venda é menor que o custo", () => {
    assert.ok(calcularMargem(20, 10).valor < 0);
  });
});

describe("RN03 — venda abaixo do custo avisa, mas não impede", () => {
  test("avisa quando a venda fica abaixo do custo", () => {
    assert.ok(avisoPreco(15, 10));
  });

  test("não avisa quando a venda cobre o custo", () => {
    assert.equal(avisoPreco(15, 22), null);
  });

  test("não avisa sem preço de venda informado", () => {
    assert.equal(avisoPreco(15, 0), null);
  });
});

describe("RN01 — segregação de acesso por perfil", () => {
  test("proprietário acessa informação financeira", () => {
    assert.equal(podeVerFinanceiro("PROPRIETARIO"), true);
  });

  test("operador não acessa informação financeira", () => {
    assert.equal(podeVerFinanceiro("OPERADOR"), false);
  });
});

describe("RN08 — valor total do estoque", () => {
  test("soma quantidade vezes preço de custo", () => {
    const total = valorEmEstoque([
      { estoqueAtual: 10, precoCusto: 15 },
      { estoqueAtual: 5, precoCusto: 6.5 },
    ]);
    assert.equal(total, 182.5);
  });

  test("usa o custo, não o preço de venda", () => {
    const itens = [{ estoqueAtual: 2, precoCusto: 10, precoVenda: 30 }];
    assert.equal(valorEmEstoque(itens), 20);
  });

  test("estoque vazio vale zero", () => {
    assert.equal(valorEmEstoque([]), 0);
  });
});

describe("conversão de datas entre a tela e o banco", () => {
  test("converte DD/MM/AAAA para o formato do banco", () => {
    assert.equal(paraDataIso("30/11/2026"), "2026-11-30");
  });

  test("converte o formato do banco para exibição", () => {
    assert.equal(paraDataBr("2026-11-30"), "30/11/2026");
  });

  test("a conversão de ida e volta preserva a data", () => {
    assert.equal(paraDataBr(paraDataIso("09/03/2027")), "09/03/2027");
  });

  test("campo vazio significa produto sem validade, não erro", () => {
    assert.equal(paraDataIso(""), null);
    assert.equal(paraDataIso("   "), null);
    assert.equal(validarDataValidade(""), null);
    assert.equal(paraDataBr(null), "");
  });

  test("recusa data inexistente em vez de normalizar em silêncio", () => {
    assert.equal(paraDataIso("31/02/2026"), null);
    assert.equal(paraDataIso("32/01/2026"), null);
    assert.equal(paraDataIso("01/13/2026"), null);
  });

  test("recusa formato fora do padrão brasileiro", () => {
    assert.equal(paraDataIso("2026-11-30"), null);
    assert.equal(paraDataIso("30/11/26"), null);
    assert.equal(paraDataIso("amanhã"), null);
  });

  test("aceita 29 de fevereiro apenas em ano bissexto", () => {
    assert.equal(paraDataIso("29/02/2028"), "2028-02-29");
    assert.equal(paraDataIso("29/02/2027"), null);
  });

  test("data inválida produz mensagem de erro para o usuário", () => {
    assert.match(validarDataValidade("31/02/2026"), /DD\/MM\/AAAA/);
  });

  test("formata o timestamp do banco no fuso do aparelho", () => {
    // o banco grava em UTC; o esperado é calculado no fuso de quem roda o
    // teste, para a suíte passar em qualquer máquina
    const local = new Date(Date.UTC(2026, 8, 30, 14, 32));
    const dois = (n) => String(n).padStart(2, "0");
    const esperado =
      `${dois(local.getDate())}/${dois(local.getMonth() + 1)}/${local.getFullYear()} ` +
      `às ${dois(local.getHours())}:${dois(local.getMinutes())}`;
    assert.equal(formatarDataHora("2026-09-30 14:32:05"), esperado);
  });

  test("em Goiânia, 14:32 UTC aparece como 11:32", () => {
    const fusoAnterior = process.env.TZ;
    process.env.TZ = "America/Sao_Paulo";
    try {
      assert.equal(formatarDataHora("2026-09-30 14:32:05"), "30/09/2026 às 11:32");
    } finally {
      process.env.TZ = fusoAnterior;
    }
  });

  test("timestamp fora do padrão é devolvido como veio, sem quebrar", () => {
    assert.equal(formatarDataHora("sem data"), "sem data");
  });
});

describe("Alerta de vencimento — mesma janela de 15 dias do painel", () => {
  const hoje = new Date(2026, 9, 8); // 08/10/2026, hora local

  test("conta dias de calendário até a validade", () => {
    assert.equal(diasParaVencer("2026-10-12", hoje), 4);
    assert.equal(diasParaVencer("2026-10-08", hoje), 0);
  });

  test("produto já vencido tem dias negativos e continua em alerta", () => {
    assert.equal(diasParaVencer("2026-10-01", hoje), -7);
    assert.equal(estaVencendo("2026-10-01", hoje), true);
  });

  test("15 dias ou menos está vencendo; 16 não está", () => {
    assert.equal(estaVencendo("2026-10-23", hoje), true);
    assert.equal(estaVencendo("2026-10-24", hoje), false);
  });

  test("produto sem validade nunca entra no alerta", () => {
    assert.equal(diasParaVencer(null, hoje), null);
    assert.equal(estaVencendo(null, hoje), false);
  });
});

describe("RN01 — o custo não chega à tela do operador", () => {
  const produto = {
    id: 1,
    lojaId: 1,
    nome: "Arroz Tipo 1 5kg",
    codigoBarras: null,
    categoriaId: 1,
    fornecedorId: null,
    precoCusto: 15,
    precoVenda: 22,
    estoqueAtual: 10,
    estoqueMinimo: 5,
    dataValidade: null,
    ativo: true,
  };

  test("operador recebe o produto sem o custo", () => {
    assert.equal(produtoParaPerfil(produto, "OPERADOR").precoCusto, null);
  });

  test("proprietário recebe o produto completo", () => {
    assert.equal(produtoParaPerfil(produto, "PROPRIETARIO").precoCusto, 15);
  });

  test("filtrar não altera o produto original", () => {
    produtoParaPerfil(produto, "OPERADOR");
    assert.equal(produto.precoCusto, 15);
  });

  test("desativar produto e manter fornecedor são do proprietário", () => {
    assert.equal(podeGerenciarCadastros("PROPRIETARIO"), true);
    assert.equal(podeGerenciarCadastros("OPERADOR"), false);
  });
});

describe("Painel — indicadores pelas mesmas regras da lista", () => {
  const hoje = new Date(2026, 9, 8); // 08/10/2026, hora local
  const produtos = [
    // no mínimo: crítico
    { estoqueAtual: 10, estoqueMinimo: 10, precoCusto: 2, dataValidade: null },
    // vence em 12 dias
    { estoqueAtual: 40, estoqueMinimo: 10, precoCusto: 1.5, dataValidade: "2026-10-20" },
    // sem mínimo e zerado: crítico; vence em 84 dias
    { estoqueAtual: 0, estoqueMinimo: 0, precoCusto: 9, dataValidade: "2026-12-31" },
  ];

  test("conta produtos, críticos e vencendo", () => {
    const r = resumirEstoque(produtos, hoje);
    assert.equal(r.totalProdutos, 3);
    assert.equal(r.produtosCriticos, 2);
    assert.equal(r.produtosVencendo, 1);
  });

  test("valor do estoque pelo preço de custo (RN08)", () => {
    assert.equal(resumirEstoque(produtos, hoje).valorTotalEstoque, 80);
  });

  test("sem produtos, tudo zerado", () => {
    assert.deepEqual(resumirEstoque([], hoje), {
      totalProdutos: 0,
      valorTotalEstoque: 0,
      produtosCriticos: 0,
      produtosVencendo: 0,
    });
  });
});

describe("Criar conta — validação de entrada (RF01)", () => {
  const valido = {
    nome: "Maria Souza",
    email: "maria@loja.com",
    senha: "segredo123",
    confirmacao: "segredo123",
  };

  test("aceita dados completos", () => {
    assert.equal(validarCadastro(valido), null);
  });

  test("recusa nome curto", () => {
    assert.match(validarCadastro({ ...valido, nome: "Ma" }), /nome/);
  });

  test("recusa e-mail inválido", () => {
    assert.match(validarCadastro({ ...valido, email: "maria@loja" }), /e-mail/);
  });

  test("senha precisa de 8 caracteres, com letras e números", () => {
    assert.match(
      validarCadastro({ ...valido, senha: "abc12", confirmacao: "abc12" }),
      /8 caracteres/,
    );
    assert.match(
      validarCadastro({ ...valido, senha: "sóletras!", confirmacao: "sóletras!" }),
      /letras e números/,
    );
  });

  test("recusa confirmação diferente da senha", () => {
    assert.match(validarCadastro({ ...valido, confirmacao: "outra123" }), /não coincidem/);
  });

  test("espaços nas pontas não invalidam o e-mail", () => {
    assert.equal(emailValido("  maria@loja.com "), true);
  });
});

describe("Valores digitados nos formulários", () => {
  test("aceita vírgula ou ponto como separador decimal", () => {
    assert.equal(lerValor("12,50"), 12.5);
    assert.equal(lerValor("12.5"), 12.5);
    assert.equal(lerValor("1.234,56"), 1234.56);
  });

  test("vazio ou inválido vira nulo, não zero", () => {
    for (const t of ["", "  ", "abc", "-5", "12,345", "1,2,3"]) {
      assert.equal(lerValor(t), null, `"${t}"`);
    }
  });

  test("inteiro aceita só dígitos", () => {
    assert.equal(lerInteiro("15"), 15);
    for (const t of ["", "1.5", "-1", "dez"]) {
      assert.equal(lerInteiro(t), null, `"${t}"`);
    }
  });
});

describe("Cadastro de produto — validação (US05 e RN01)", () => {
  const base = {
    nome: "Leite Integral 1L",
    categoriaId: 1,
    precoCusto: "4,20",
    precoVenda: "6,50",
    estoqueMinimo: "10",
    quantidadeInicial: "24",
    dataValidade: "30/11/2026",
  };
  const dono = { informaCusto: true, editando: false };

  test("aceita produto completo e devolve os valores convertidos", () => {
    const r = validarProduto(base, dono);
    assert.equal(r.valido, true);
    assert.deepEqual(r.valores, {
      nome: "Leite Integral 1L",
      categoriaId: 1,
      precoCusto: 4.2,
      precoVenda: 6.5,
      estoqueMinimo: 10,
      quantidadeInicial: 24,
      dataValidade: "2026-11-30",
    });
  });

  test("preço de venda é obrigatório e maior que zero", () => {
    for (const precoVenda of ["", "0", "abc"]) {
      const r = validarProduto({ ...base, precoVenda }, dono);
      assert.equal(r.valido, false);
      assert.match(r.mensagem, /venda/);
    }
  });

  test("o proprietário precisa informar o custo", () => {
    const r = validarProduto({ ...base, precoCusto: "" }, dono);
    assert.equal(r.valido, false);
    assert.match(r.mensagem, /custo/);
  });

  test("o operador grava sem custo, e o que vier no campo é ignorado", () => {
    const r = validarProduto(
      { ...base, precoCusto: "999" },
      { informaCusto: false, editando: false },
    );
    assert.equal(r.valido, true);
    assert.equal(r.valores.precoCusto, null);
  });

  test("na edição a quantidade inicial não se aplica", () => {
    const r = validarProduto(
      { ...base, quantidadeInicial: "" },
      { informaCusto: true, editando: true },
    );
    assert.equal(r.valido, true);
    assert.equal(r.valores.quantidadeInicial, 0);
  });

  test("recusa nome, categoria, mínimo, quantidade e validade inválidos", () => {
    assert.match(validarProduto({ ...base, nome: "L" }, dono).mensagem, /nome/);
    assert.match(validarProduto({ ...base, categoriaId: null }, dono).mensagem, /categoria/);
    assert.match(validarProduto({ ...base, estoqueMinimo: "-1" }, dono).mensagem, /mínimo/);
    assert.match(
      validarProduto({ ...base, quantidadeInicial: "" }, dono).mensagem,
      /quantidade inicial/,
    );
    assert.match(
      validarProduto({ ...base, dataValidade: "31/02/2026" }, dono).mensagem,
      /DD\/MM\/AAAA/,
    );
  });

  test("validade em branco é aceita", () => {
    const r = validarProduto({ ...base, dataValidade: "" }, dono);
    assert.equal(r.valido, true);
    assert.equal(r.valores.dataValidade, null);
  });
});

describe("Fornecedor — validação de entrada", () => {
  test("nome é obrigatório", () => {
    assert.match(validarFornecedor({ nome: " ", email: "" }), /nome/);
  });

  test("e-mail é opcional, mas se informado precisa ser válido", () => {
    assert.equal(validarFornecedor({ nome: "Atacadão", email: "" }), null);
    assert.equal(
      validarFornecedor({ nome: "Atacadão", email: "compras@atacadao.com.br" }),
      null,
    );
    assert.match(validarFornecedor({ nome: "Atacadão", email: "compras" }), /e-mail/);
  });
});

describe("Formatação de valores na tela", () => {
  test("reais no padrão brasileiro", () => {
    assert.match(formatarReais(1234.5), /^R\$\s1\.234,50$/);
  });

  test("percentual com vírgula e uma casa", () => {
    assert.equal(formatarPercentual(31.8181), "31,8%");
  });
});
