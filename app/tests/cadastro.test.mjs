// Fornecedores e contas de usuário contra o banco do aplicativo, num SQLite
// em memória (ver tests/apoio/expo-sqlite-node.mjs). Os testes rodam em ordem
// e partem do estado deixado pelo anterior.

import { test } from "node:test";
import assert from "node:assert/strict";

import { obterBanco } from "../src/database/conexao.ts";
import { cadastrar, entrar } from "../src/services/authService.ts";
import {
  excluirFornecedor,
  listarFornecedores,
  salvarFornecedor,
} from "../src/services/cadastroService.ts";

// carga inicial: ABC com 3 produtos, XYZ com 2, Atacadão sem nenhum
const ABC = 1;
const ATACADAO = 3;

async function como(email) {
  const r = await entrar(email, "admin123");
  assert.equal(r.sucesso, true);
}

test("o operador não altera fornecedores (RN01)", async () => {
  await como("operador@stockeasy.com");

  const r = await salvarFornecedor(
    { nome: "Fornecedor Novo", telefone: "", email: "" },
    null,
  );
  assert.equal(r.sucesso, false);
  assert.match(r.mensagem, /proprietário/);
  assert.equal((await excluirFornecedor(ATACADAO)).sucesso, false);
});

test("fornecedor com e-mail inválido é recusado", async () => {
  await como("proprietario@stockeasy.com");

  const r = await salvarFornecedor(
    { nome: "Fornecedor Novo", telefone: "", email: "sem-arroba" },
    null,
  );
  assert.equal(r.sucesso, false);
  assert.match(r.mensagem, /e-mail válido/);
});

test("fornecedor com produtos vinculados não é excluído (RN13)", async () => {
  await como("proprietario@stockeasy.com");

  const r = await excluirFornecedor(ABC);

  assert.equal(r.sucesso, false);
  assert.match(r.mensagem, /3 produto\(s\)/);
  const { vinculados } = await listarFornecedores();
  assert.equal(vinculados[ABC], 3);
});

test("fornecedor sem vínculo é desativado, não apagado (RN12)", async () => {
  await como("proprietario@stockeasy.com");

  assert.equal((await excluirFornecedor(ATACADAO)).sucesso, true);

  const { fornecedores } = await listarFornecedores();
  assert.ok(!fornecedores.some((f) => f.id === ATACADAO));
  const db = await obterBanco();
  const f = await db.getFirstAsync("SELECT ativo FROM fornecedor WHERE id = ?", [
    ATACADAO,
  ]);
  assert.equal(f.ativo, 0);
});

test("e-mail já cadastrado não cria outra conta (RN02)", async () => {
  const r = await cadastrar({
    nome: "Outra Pessoa",
    email: "Operador@StockEasy.com",
    senha: "segredo123",
    confirmacao: "segredo123",
  });
  assert.equal(r.sucesso, false);
  assert.match(r.mensagem, /Já existe/);
});

test("quem se cadastra numa loja que já tem dono entra como operador", async () => {
  const r = await cadastrar({
    nome: "Maria Caixa",
    email: "maria@stockeasy.com",
    senha: "segredo123",
    confirmacao: "segredo123",
  });
  assert.equal(r.sucesso, true, r.mensagem);
  assert.equal(r.usuario.tipoPerfil, "OPERADOR");

  const login = await entrar("maria@stockeasy.com", "segredo123");
  assert.equal(login.sucesso, true);
});
