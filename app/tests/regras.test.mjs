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
  ehEntrada,
  formatarDataHora,
  paraDataBr,
  paraDataIso,
  podeVerFinanceiro,
  validarDataValidade,
  validarMovimentacao,
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

  test("formata o timestamp do banco para leitura", () => {
    assert.equal(
      formatarDataHora("2026-09-30 14:32:05"),
      "30/09/2026 às 14:32",
    );
  });

  test("timestamp fora do padrão é devolvido como veio, sem quebrar", () => {
    assert.equal(formatarDataHora("sem data"), "sem data");
  });
});
