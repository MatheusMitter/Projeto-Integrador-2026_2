// Relatórios e pendências de sincronização contra o banco do aplicativo,
// num SQLite em memória (ver tests/apoio/expo-sqlite-node.mjs). Os testes
// rodam em ordem e partem do estado deixado pelo anterior.

import { test } from "node:test";
import assert from "node:assert/strict";

import { entrar } from "../src/services/authService.ts";
import { registrarMovimentacao } from "../src/services/estoqueService.ts";
import { montarRelatorio } from "../src/services/relatorioService.ts";
import { registrosNaoSincronizados } from "../src/services/sincronizacaoService.ts";

const REFRIGERANTE = 3; // 25 em estoque, custo 4,00

async function como(email) {
  const r = await entrar(email, "admin123");
  assert.equal(r.sucesso, true);
}

test("sem vendas, o ranking vem vazio", async () => {
  await como("proprietario@stockeasy.com");
  const { ranking } = await montarRelatorio(30);
  assert.deepEqual(ranking, []);
});

test("cada movimentação conta como pendente de envio", async () => {
  await como("proprietario@stockeasy.com");
  const antes = await registrosNaoSincronizados();

  const r = await registrarMovimentacao({
    produtoId: REFRIGERANTE,
    tipo: "VENDA",
    quantidade: 5,
  });

  assert.equal(r.sucesso, true);
  assert.equal(await registrosNaoSincronizados(), antes + 1);
});

test("o ranking mostra a venda e a evolução fecha com o valor do estoque", async () => {
  await como("proprietario@stockeasy.com");

  const relatorio = await montarRelatorio(30);

  assert.equal(relatorio.ranking.length, 1);
  assert.equal(relatorio.ranking[0].produtoId, REFRIGERANTE);
  assert.equal(relatorio.ranking[0].total, 5);
  const hoje = relatorio.serie.at(-1);
  assert.equal(hoje.diasAtras, 0);
  assert.equal(hoje.valor, 1141 - 5 * 4);
  assert.equal(relatorio.historico[0].tipo, "VENDA");
});

test("para o operador, a evolução vem em unidades, sem valor (RN01)", async () => {
  await como("operador@stockeasy.com");

  const { serie } = await montarRelatorio(30);

  assert.ok(serie.every((p) => p.valor === null));
  assert.equal(serie.at(-1).unidades, 50 + 30 + 20 + 40 + 20);
});
