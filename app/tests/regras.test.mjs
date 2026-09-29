// Testes das regras de negócio. Rodam sem emulador e sem banco.
// Executar: node --test tests/regras.test.mjs

import { test, describe } from "node:test";
import assert from "node:assert/strict";

// Cópia das funções de src/services/regras.ts. O original é TypeScript e
// importar exigiria compilar antes de rodar o teste.

const TIPOS_ENTRADA = ["COMPRA", "DEVOLUCAO_CLIENTE", "AJUSTE_ENTRADA"];

const ehEntrada = (tipo) => TIPOS_ENTRADA.includes(tipo);

function classificarEstoque(saldo, minimo) {
  if (minimo <= 0) return saldo > 0 ? "NORMAL" : "CRITICO";
  if (saldo <= minimo) return "CRITICO";
  if (saldo <= minimo * 1.5) return "BAIXO";
  if (saldo <= minimo * 3) return "NORMAL";
  return "EXCESSO";
}

function validarMovimentacao(tipo, quantidade, saldoAtual, estoqueMinimo) {
  if (!Number.isInteger(quantidade) || quantidade <= 0) {
    return { valido: false, mensagem: "quantidade inválida", saldoResultante: saldoAtual };
  }
  const entrada = ehEntrada(tipo);
  const saldoResultante = entrada ? saldoAtual + quantidade : saldoAtual - quantidade;

  if (!entrada && quantidade > saldoAtual) {
    return { valido: false, mensagem: "RN06", saldoResultante: saldoAtual };
  }
  const situacao = classificarEstoque(saldoResultante, estoqueMinimo);
  if (!entrada && situacao === "CRITICO") {
    return { valido: true, aviso: "ficará crítico", saldoResultante };
  }
  return { valido: true, saldoResultante };
}

function calcularMargem(precoCusto, precoVenda) {
  if (precoVenda <= 0) return null;
  const valor = precoVenda - precoCusto;
  return { valor, percentual: (valor / precoVenda) * 100 };
}

const podeVerFinanceiro = (perfil) => perfil === "PROPRIETARIO";

const valorEmEstoque = (itens) =>
  itens.reduce((t, p) => t + p.estoqueAtual * p.precoCusto, 0);

describe("RN06 — a saída não pode exceder o estoque disponível", () => {
  test("recusa saída maior que o saldo", () => {
    const r = validarMovimentacao("VENDA", 60, 50, 10);
    assert.equal(r.valido, false);
    assert.match(r.mensagem, /RN06/);
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

  test("avisa quando a saída deixa o produto crítico", () => {
    const r = validarMovimentacao("VENDA", 42, 50, 10);
    assert.equal(r.valido, true);
    assert.ok(r.aviso, "deveria avisar que ficará crítico");
  });

  test("não avisa quando o saldo permanece confortável", () => {
    const r = validarMovimentacao("VENDA", 5, 50, 10);
    assert.equal(r.aviso, undefined);
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
