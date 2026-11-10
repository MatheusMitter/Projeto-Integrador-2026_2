// Consulta ao Open Food Facts com o fetch simulado: nenhum teste acessa a
// rede. O serviço devolve null em toda situação que não seja "encontrado".

import { test } from "node:test";
import assert from "node:assert/strict";

import {
  buscarPorCodigo,
  casarCategoria,
} from "../src/services/produtoExternoService.ts";

function respondendo(status, corpo) {
  return async () => ({ ok: status === 200, status, json: async () => corpo });
}

test("produto encontrado: nome em português tem prioridade", async () => {
  const fetchFalso = respondendo(200, {
    status: 1,
    product: {
      product_name: "Coca-Cola",
      product_name_pt: "Refrigerante Cola",
      categories_tags: ["en:beverages", "pt:bebidas"],
      image_front_url: "https://exemplo/foto.jpg",
    },
  });
  const r = await buscarPorCodigo("7894900011517", fetchFalso);
  assert.deepEqual(r, {
    nome: "Refrigerante Cola",
    categoria: "bebidas",
    fotoUrl: "https://exemplo/foto.jpg",
  });
});

test("sem nome em português, usa o nome geral", async () => {
  const r = await buscarPorCodigo("7894900011517", respondendo(200, {
    status: 1,
    product: { product_name: "Arroz Tipo 1" },
  }));
  assert.equal(r?.nome, "Arroz Tipo 1");
  assert.equal(r?.categoria, undefined);
});

test("código desconhecido (status 0) devolve null", async () => {
  const r = await buscarPorCodigo("0000000000000", respondendo(200, { status: 0 }));
  assert.equal(r, null);
});

test("erro HTTP devolve null", async () => {
  const r = await buscarPorCodigo("7894900011517", respondendo(500, {}));
  assert.equal(r, null);
});

test("falha de rede devolve null", async () => {
  const r = await buscarPorCodigo("7894900011517", async () => {
    throw new TypeError("Network request failed");
  });
  assert.equal(r, null);
});

test("tempo esgotado devolve null", async () => {
  // simula um servidor que só responde quando o sinal de aborto chega
  const lento = (_url, opcoes) =>
    new Promise((_resolver, rejeitar) => {
      opcoes.signal.addEventListener("abort", () => rejeitar(new Error("aborted")));
    });
  const inicio = Date.now();
  const r = await buscarPorCodigo("7894900011517", lento);
  assert.equal(r, null);
  assert.ok(Date.now() - inicio >= 4900, "esperou o limite de 5 s");
});

test("código curto demais não consulta", async () => {
  let chamou = false;
  const r = await buscarPorCodigo("123", async () => {
    chamou = true;
    return { ok: true, json: async () => ({}) };
  });
  assert.equal(r, null);
  assert.equal(chamou, false);
});

test("categoria sugerida casa com a local, sem acento e sem caixa", () => {
  const locais = [
    { id: 1, lojaId: 1, nome: "Alimentos", ativo: true },
    { id: 2, lojaId: 1, nome: "Bebidas", ativo: true },
    { id: 3, lojaId: 1, nome: "Higiene", ativo: true },
  ];
  assert.equal(casarCategoria("bebidas", locais)?.id, 2);
  assert.equal(casarCategoria("Bebidas Gaseificadas", locais)?.id, 2);
  assert.equal(casarCategoria("higiene pessoal", locais)?.id, 3);
  assert.equal(casarCategoria("brinquedos", locais), null);
  assert.equal(casarCategoria(undefined, locais), null);
});
