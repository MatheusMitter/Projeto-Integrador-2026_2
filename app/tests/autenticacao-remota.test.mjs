// Login e criação de conta com a retaguarda (src/services/authService.ts),
// contra o banco do aplicativo em memória e uma retaguarda simulada. Os
// testes rodam em ordem e partem do estado deixado pelo anterior (AC6b.1).

import { test } from "node:test";
import assert from "node:assert/strict";

import { definirRedeParaTeste } from "./apoio/expo-network-node.mjs";
import { derrubarServidor, instalarServidorFalso } from "./apoio/servidor-falso.mjs";
import { obterBanco } from "../src/database/conexao.ts";
import { cadastrar, entrar } from "../src/services/authService.ts";
import { lerToken } from "../src/services/sessaoRemota.ts";

const LOJA_DO_SERVIDOR = "11111111-2222-4333-8444-555555555555";
const OUTRA_LOJA = "99999999-2222-4333-8444-555555555555";
const DONA = "aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee";

function contaDoServidor({ token, email, nome = "Dona da Loja", perfil = "PROPRIETARIO", loja = LOJA_DO_SERVIDOR }) {
  return {
    token,
    usuario: { uuid: DONA, nome, email, perfil },
    loja: { uuid: loja, nome: "Mercearia da Dona" },
  };
}

async function linha(sql, parametros = []) {
  return (await obterBanco()).getFirstAsync(sql, parametros);
}

const NOVA_CONTA = {
  nome: "Dona da Loja",
  email: "dona@exemplo.com",
  senha: "segredo123",
  confirmacao: "segredo123",
};

test("sem internet, o login é local e confere o resumo da senha", async () => {
  definirRedeParaTeste(false);
  const chamadas = instalarServidorFalso({});

  assert.equal((await entrar("operador@stockeasy.com", "admin123")).sucesso, true);
  assert.equal((await entrar("operador@stockeasy.com", "errada")).sucesso, false);
  assert.equal(chamadas.length, 0);
  const guardada = await linha("SELECT senha_hash FROM usuario WHERE email = 'operador@stockeasy.com'");
  assert.notEqual(guardada.senha_hash, "admin123");
});

test("com internet, quem cria conta no aparelho ainda sem loja no servidor é a dona da loja de lá", async () => {
  definirRedeParaTeste(true);
  const chamadas = instalarServidorFalso({
    "POST /auth/registrar": ({ corpo }) => ({
      status: 201,
      corpo: contaDoServidor({ token: "token-da-dona", email: corpo.email }),
    }),
  });

  const r = await cadastrar(NOVA_CONTA);

  assert.equal(r.sucesso, true, r.mensagem);
  assert.equal(r.usuario.tipoPerfil, "PROPRIETARIO");
  // a loja vai com o nome que já está no aparelho
  assert.equal(chamadas[0].corpo.nomeLoja, "Mercearia Modelo");
  assert.equal(await lerToken(), "token-da-dona");
  assert.equal((await linha("SELECT loja_uuid FROM sincronizacao")).loja_uuid, LOJA_DO_SERVIDOR);
  const loja = await linha("SELECT uuid, nome FROM loja WHERE id = 1");
  assert.deepEqual({ ...loja }, { uuid: LOJA_DO_SERVIDOR, nome: "Mercearia da Dona" });
  const usuario = await linha("SELECT uuid, senha_hash FROM usuario WHERE email = 'dona@exemplo.com'");
  assert.equal(usuario.uuid, DONA);
  assert.match(usuario.senha_hash, /^sha256\$/);
});

test("com a loja já ligada ao servidor, conta nova fica só no aparelho, como operador", async () => {
  const chamadas = instalarServidorFalso({});

  const r = await cadastrar({ ...NOVA_CONTA, nome: "Caixa Nova", email: "caixa@exemplo.com" });

  assert.equal(r.sucesso, true, r.mensagem);
  assert.equal(r.usuario.tipoPerfil, "OPERADOR");
  assert.equal(chamadas.length, 0);
});

test("conta de outra loja é recusada e o token do aparelho não muda", async () => {
  instalarServidorFalso({
    "POST /auth/login": ({ corpo }) => ({
      corpo: contaDoServidor({ token: "token-de-fora", email: corpo.email, loja: OUTRA_LOJA }),
    }),
  });

  const r = await entrar("dona@exemplo.com", "segredo123");

  assert.equal(r.sucesso, false);
  assert.match(r.mensagem, /outra loja/);
  assert.equal(await lerToken(), "token-da-dona");
});

test("o servidor não conhece a conta do aparelho: entra pelo caminho local, sem token novo", async () => {
  instalarServidorFalso({
    "POST /auth/login": () => ({ status: 401, corpo: { mensagem: "E-mail ou senha inválidos." } }),
  });

  const r = await entrar("operador@stockeasy.com", "admin123");

  assert.equal(r.sucesso, true);
  assert.equal(await lerToken(), "token-da-dona");
});

test("login com internet renova o token, e depois a mesma senha entra sem rede", async () => {
  instalarServidorFalso({
    "POST /auth/login": ({ corpo }) => ({ corpo: contaDoServidor({ token: "token-novo", email: corpo.email }) }),
  });

  assert.equal((await entrar("  Dona@Exemplo.com ", "segredo123")).sucesso, true);
  assert.equal(await lerToken(), "token-novo");

  definirRedeParaTeste(false);
  assert.equal((await entrar("dona@exemplo.com", "segredo123")).sucesso, true);
  assert.equal((await entrar("dona@exemplo.com", "errada")).sucesso, false);
});

test("servidor sem resposta no login: entra pelo caminho local", async () => {
  definirRedeParaTeste(true);
  derrubarServidor();

  const r = await entrar("dona@exemplo.com", "segredo123");

  assert.equal(r.sucesso, true);
  assert.equal(r.usuario.tipoPerfil, "PROPRIETARIO");
});

test("criar conta com e-mail que já existe no servidor avisa e não cria nada", async () => {
  // aparelho ainda sem loja no servidor, para a criação passar por lá
  await (await obterBanco()).runAsync("UPDATE sincronizacao SET loja_uuid = NULL");
  instalarServidorFalso({
    "POST /auth/registrar": () => ({ status: 409, corpo: { mensagem: "Já existe uma conta com este e-mail." } }),
  });

  const r = await cadastrar({ ...NOVA_CONTA, nome: "Pessoa Repetida", email: "repetida@exemplo.com" });

  assert.equal(r.sucesso, false);
  assert.match(r.mensagem, /no servidor/);
  assert.equal(await linha("SELECT id FROM usuario WHERE email = 'repetida@exemplo.com'"), null);
});

test("com internet, servidor sem resposta ao criar conta: avisa e não cria a conta só no aparelho", async () => {
  // aparelho ainda sem loja no servidor, como no teste anterior
  derrubarServidor();

  const r = await cadastrar({ ...NOVA_CONTA, nome: "Pessoa Sem Resposta", email: "semresposta@exemplo.com" });

  assert.equal(r.sucesso, false);
  assert.match(r.mensagem, /não respondeu a tempo/);
  assert.equal(await linha("SELECT id FROM usuario WHERE email = 'semresposta@exemplo.com'"), null);
});

test("sem internet, criar conta continua só no aparelho, como antes", async () => {
  definirRedeParaTeste(false);
  const chamadas = instalarServidorFalso({});

  const r = await cadastrar({ ...NOVA_CONTA, nome: "Pessoa Sem Rede", email: "semrede@exemplo.com" });

  assert.equal(r.sucesso, true, r.mensagem);
  assert.equal(chamadas.length, 0);
});
