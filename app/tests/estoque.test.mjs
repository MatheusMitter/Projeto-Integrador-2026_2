// Movimentação de estoque contra o banco do aplicativo: mesmo esquema, mesma
// carga inicial e mesmos repositórios, num SQLite em memória (ver
// tests/apoio/expo-sqlite-node.mjs). Os testes rodam em ordem e partem do
// estado deixado pelo anterior.

import { test } from "node:test";
import assert from "node:assert/strict";

import { obterBanco } from "../src/database/conexao.ts";
import { encerrarSessao, entrar } from "../src/services/authService.ts";
import {
  historicoDoProduto,
  registrarMovimentacao,
} from "../src/services/estoqueService.ts";
import { desativarProduto } from "../src/services/produtoService.ts";

// carga inicial: Refrigerante com 25 em estoque e mínimo 20
const REFRIGERANTE = 3;
const DETERGENTE = 4;

async function saldo(produtoId) {
  const db = await obterBanco();
  const linha = await db.getFirstAsync(
    "SELECT estoque_atual FROM produto WHERE id = ?",
    [produtoId],
  );
  return linha.estoque_atual;
}

async function totalMovimentacoes() {
  const db = await obterBanco();
  const linha = await db.getFirstAsync(
    "SELECT COUNT(*) AS total FROM movimentacao",
  );
  return linha.total;
}

async function comoProprietario() {
  const r = await entrar("proprietario@stockeasy.com", "admin123");
  assert.equal(r.sucesso, true);
  return r.usuario;
}

test("sem sessão, nada é registrado (RN05)", async () => {
  encerrarSessao();
  const antes = await totalMovimentacoes();

  const r = await registrarMovimentacao({
    produtoId: REFRIGERANTE,
    tipo: "VENDA",
    quantidade: 1,
  });

  assert.equal(r.sucesso, false);
  assert.match(r.mensagem, /sessão/);
  assert.equal(await totalMovimentacoes(), antes);
});

test("login aceita e-mail com maiúscula e espaço; erro não revela se o e-mail existe", async () => {
  const senhaErrada = await entrar("proprietario@stockeasy.com", "errada");
  const emailInexistente = await entrar("ninguem@stockeasy.com", "admin123");
  assert.equal(senhaErrada.sucesso, false);
  assert.equal(senhaErrada.mensagem, emailInexistente.mensagem);

  const certo = await entrar("  Proprietario@StockEasy.com ", "admin123");
  assert.equal(certo.sucesso, true);
  assert.equal(certo.usuario.tipoPerfil, "PROPRIETARIO");
});

test("saída maior que o estoque é recusada e não grava nada (RN06)", async () => {
  await comoProprietario();
  const antes = await totalMovimentacoes();

  const r = await registrarMovimentacao({
    produtoId: REFRIGERANTE,
    tipo: "VENDA",
    quantidade: 30,
  });

  assert.equal(r.sucesso, false);
  assert.match(r.mensagem, /maior que o estoque disponível \(25\)/);
  assert.equal(await saldo(REFRIGERANTE), 25);
  assert.equal(await totalMovimentacoes(), antes);
});

test("venda válida baixa o saldo e grava o histórico com o responsável (RN05)", async () => {
  const usuario = await comoProprietario();

  const r = await registrarMovimentacao({
    produtoId: REFRIGERANTE,
    tipo: "VENDA",
    quantidade: 5,
    observacoes: "  balcão  ",
  });

  assert.equal(r.sucesso, true);
  assert.equal(r.saldoResultante, 20);
  assert.match(r.aviso, /no limite do estoque mínimo/);
  assert.equal(await saldo(REFRIGERANTE), 20);

  const [ultima] = await historicoDoProduto(REFRIGERANTE, 1);
  assert.equal(ultima.tipo, "VENDA");
  assert.equal(ultima.quantidade, 5);
  assert.equal(ultima.saldoApos, 20);
  assert.equal(ultima.usuarioId, usuario.id);
  assert.equal(ultima.observacoes, "balcão");
});

test("entrada soma ao saldo", async () => {
  await comoProprietario();

  const r = await registrarMovimentacao({
    produtoId: REFRIGERANTE,
    tipo: "COMPRA",
    quantidade: 5,
  });

  assert.equal(r.sucesso, true);
  assert.equal(r.aviso, undefined);
  assert.equal(await saldo(REFRIGERANTE), 25);
});

test("falha no meio da transação desfaz a baixa do saldo", async () => {
  await comoProprietario();
  const antes = await totalMovimentacoes();

  // tipo fora da lista passa pela validação como saída, baixa o saldo e só
  // então é recusado pelo CHECK da tabela de movimentação
  const r = await registrarMovimentacao({
    produtoId: REFRIGERANTE,
    tipo: "INEXISTENTE",
    quantidade: 2,
  });

  assert.equal(r.sucesso, false);
  assert.equal(await saldo(REFRIGERANTE), 25);
  assert.equal(await totalMovimentacoes(), antes);
});

test("produto desativado não aceita movimentação (RN12)", async () => {
  await comoProprietario();
  assert.equal((await desativarProduto(DETERGENTE)).sucesso, true);

  const r = await registrarMovimentacao({
    produtoId: DETERGENTE,
    tipo: "VENDA",
    quantidade: 1,
  });

  assert.equal(r.sucesso, false);
  assert.match(r.mensagem, /desativado/);
  assert.equal(await saldo(DETERGENTE), 40);
});
