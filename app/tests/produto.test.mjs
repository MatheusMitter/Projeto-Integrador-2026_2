// Cadastro e consulta de produto contra o banco do aplicativo, num SQLite em
// memória (ver tests/apoio/expo-sqlite-node.mjs). Os testes rodam em ordem e
// partem do estado deixado pelo anterior.

import { test } from "node:test";
import assert from "node:assert/strict";

import { obterBanco } from "../src/database/conexao.ts";
import { entrar } from "../src/services/authService.ts";
import {
  buscarProduto,
  desativarProduto,
  listarProdutos,
  resumoDoEstoque,
  salvarProduto,
} from "../src/services/produtoService.ts";

const REFRIGERANTE = 3; // custo 4,00, venda 7,50

async function como(email) {
  const r = await entrar(email, "admin123");
  assert.equal(r.sucesso, true);
}

async function linha(sql, valores = []) {
  const db = await obterBanco();
  return db.getFirstAsync(sql, valores);
}

function formulario(campos = {}) {
  return {
    nome: "Café Torrado 500g",
    codigoBarras: "7890000000017",
    categoriaId: 1,
    fornecedorId: 3,
    precoCusto: "12,00",
    precoVenda: "18,90",
    estoqueMinimo: "5",
    quantidadeInicial: "12",
    dataValidade: "",
    ...campos,
  };
}

test("o operador recebe produtos sem custo e resumo sem valor do estoque (RN01)", async () => {
  await como("operador@stockeasy.com");

  const produtos = await listarProdutos();
  assert.equal(produtos.length, 5);
  assert.ok(produtos.every((p) => p.precoCusto === null));

  const resumo = await resumoDoEstoque();
  assert.equal(resumo.valorTotalEstoque, null);
  assert.equal(resumo.totalProdutos, 5);
});

test("o proprietário vê o valor do estoque pelo custo (RN08) e o produto vencendo", async () => {
  await como("proprietario@stockeasy.com");

  const resumo = await resumoDoEstoque();
  // 50 × 15 + 30 × 6,50 + 25 × 4 + 40 × 1,80 + 20 × 1,20
  assert.equal(resumo.valorTotalEstoque, 1141);
  // a validade do Sabonete é relativa ao dia da carga: sempre em 12 dias
  assert.equal(resumo.produtosVencendo, 1);
  assert.equal((await buscarProduto(REFRIGERANTE)).precoCusto, 4);
});

test("cadastro com estoque inicial grava produto e entrada juntos", async () => {
  await como("proprietario@stockeasy.com");

  const r = await salvarProduto(formulario());
  assert.equal(r.sucesso, true, r.mensagem);

  const produto = await linha(
    "SELECT id, estoque_atual, preco_custo FROM produto WHERE codigo_barras = ?",
    ["7890000000017"],
  );
  assert.equal(produto.estoque_atual, 12);
  assert.equal(produto.preco_custo, 12);

  const entrada = await linha(
    "SELECT tipo, quantidade, saldo_apos FROM movimentacao WHERE produto_id = ?",
    [produto.id],
  );
  assert.deepEqual({ ...entrada }, { tipo: "COMPRA", quantidade: 12, saldo_apos: 12 });
});

test("código de barras repetido é recusado sem deixar produto nem entrada (RN04)", async () => {
  await como("proprietario@stockeasy.com");
  const antes = await linha("SELECT COUNT(*) AS total FROM movimentacao");

  const r = await salvarProduto(formulario({ nome: "Outro café" }));

  assert.equal(r.sucesso, false);
  assert.match(r.mensagem, /RN04/);
  const iguais = await linha(
    "SELECT COUNT(*) AS total FROM produto WHERE codigo_barras = ?",
    ["7890000000017"],
  );
  assert.equal(iguais.total, 1);
  const depois = await linha("SELECT COUNT(*) AS total FROM movimentacao");
  assert.equal(depois.total, antes.total);
});

test("o operador edita a venda e o custo continua no banco (RN01)", async () => {
  await como("operador@stockeasy.com");

  const r = await salvarProduto(
    formulario({
      nome: "Refrigerante Cola 2L",
      codigoBarras: "7891234567892",
      categoriaId: 2,
      fornecedorId: 2,
      precoCusto: "",
      precoVenda: "7,90",
      estoqueMinimo: "20",
    }),
    REFRIGERANTE,
  );

  assert.equal(r.sucesso, true, r.mensagem);
  const p = await linha(
    "SELECT preco_custo, preco_venda FROM produto WHERE id = ?",
    [REFRIGERANTE],
  );
  assert.equal(p.preco_venda, 7.9);
  assert.equal(p.preco_custo, 4);
});

test("só o proprietário desativa; o desativado sai da lista e fica no banco (RN12)", async () => {
  await como("operador@stockeasy.com");
  const negado = await desativarProduto(REFRIGERANTE);
  assert.equal(negado.sucesso, false);
  assert.match(negado.mensagem, /proprietário/);

  await como("proprietario@stockeasy.com");
  assert.equal((await desativarProduto(REFRIGERANTE)).sucesso, true);

  const nomes = (await listarProdutos()).map((p) => p.nome);
  assert.ok(!nomes.includes("Refrigerante Cola 2L"));
  const p = await linha("SELECT ativo FROM produto WHERE id = ?", [REFRIGERANTE]);
  assert.equal(p.ativo, 0);
});

test("o código de barras do produto desativado pode ser usado de novo (RN04)", async () => {
  await como("proprietario@stockeasy.com");

  // o Refrigerante foi desativado no teste anterior e não aparece em lista
  // nenhuma: se o código continuasse preso, ninguém saberia por quê
  const r = await salvarProduto(
    formulario({ nome: "Refrigerante Cola 2L", codigoBarras: "7891234567892" }),
  );

  assert.equal(r.sucesso, true, r.mensagem);
  const mesmos = await linha(
    "SELECT COUNT(*) AS total, SUM(ativo) AS ativos FROM produto WHERE codigo_barras = ?",
    ["7891234567892"],
  );
  assert.deepEqual({ ...mesmos }, { total: 2, ativos: 1 });
});
