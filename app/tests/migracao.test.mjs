// Migração do banco local (src/database/migracoes.ts). Cada teste monta um
// banco como os criados antes do controle de versão, com o código de barras
// único também entre os desativados, e confere a passagem para a RN04
// (versão 1) e para a sincronização, com uuid padrão e senha só como resumo
// (versão 2).

import { test } from "node:test";
import assert from "node:assert/strict";

import { openDatabaseAsync } from "./apoio/expo-sqlite-node.mjs";
import { conferirSenha, ehUuid } from "../src/database/cripto.ts";
import { CARGA_INICIAL, ESQUEMA } from "../src/database/esquema.ts";
import { migrar, VERSAO_ESQUEMA } from "../src/database/migracoes.ts";

// a tabela de produto como era na versão 0
const PRODUTO_VERSAO_0 = `
CREATE TABLE produto (
  id             INTEGER PRIMARY KEY AUTOINCREMENT,
  uuid           TEXT    NOT NULL UNIQUE,
  loja_id        INTEGER NOT NULL REFERENCES loja(id),
  nome           TEXT    NOT NULL,
  codigo_barras  TEXT,
  categoria_id   INTEGER NOT NULL REFERENCES categoria(id),
  fornecedor_id  INTEGER REFERENCES fornecedor(id),
  preco_custo    REAL    NOT NULL CHECK (preco_custo >= 0),
  preco_venda    REAL    NOT NULL CHECK (preco_venda >= 0),
  estoque_atual  INTEGER NOT NULL DEFAULT 0 CHECK (estoque_atual >= 0),
  estoque_minimo INTEGER NOT NULL DEFAULT 0 CHECK (estoque_minimo >= 0),
  data_validade  TEXT,
  ativo          INTEGER NOT NULL DEFAULT 1,
  criado_em      TEXT    NOT NULL DEFAULT (datetime('now')),
  atualizado_em  TEXT    NOT NULL DEFAULT (datetime('now')),
  sincronizado   INTEGER NOT NULL DEFAULT 0,
  UNIQUE (loja_id, codigo_barras)
);`;

const REFRIGERANTE = 3;

function inserirProduto(db, uuid, nome, codigo) {
  return db.runAsync(
    `INSERT INTO produto
       (uuid, loja_id, nome, codigo_barras, categoria_id, preco_custo, preco_venda)
     VALUES (?, 1, ?, ?, 1, 1, 2)`,
    [uuid, nome, codigo],
  );
}

// Carga inicial, uma movimentação, o Refrigerante desativado e um produto
// apagado depois de criado, para o contador de id ficar à frente do maior id.
async function bancoNaVersao0() {
  const db = await openDatabaseAsync();
  await db.execAsync(ESQUEMA);
  await db.execAsync("DROP TABLE produto;");
  await db.execAsync(PRODUTO_VERSAO_0);
  await db.execAsync(CARGA_INICIAL);
  await db.runAsync("UPDATE produto SET estoque_atual = 25 WHERE id = ?", [REFRIGERANTE]);
  await db.runAsync(
    `INSERT INTO movimentacao (uuid, produto_id, usuario_id, tipo, quantidade, saldo_apos)
     VALUES ('mov-0001', ?, 1, 'COMPRA', 25, 25)`,
    [REFRIGERANTE],
  );
  await db.runAsync("UPDATE produto SET ativo = 0 WHERE id = ?", [REFRIGERANTE]);
  await inserirProduto(db, "prod-apagado", "Apagado", null);
  await db.runAsync("DELETE FROM produto WHERE uuid = 'prod-apagado'");
  await db.execAsync("PRAGMA user_version = 0;");
  return db;
}

// mesma sequência de abrir(), em src/database/conexao.ts
async function abrir(db) {
  await db.execAsync("PRAGMA foreign_keys = ON;");
  await migrar(db);
  await db.execAsync(ESQUEMA);
  await db.execAsync(`PRAGMA user_version = ${VERSAO_ESQUEMA};`);
}

// uuid e sincronizado_em ficam fora da comparação: a versão 2 troca o uuid
// antigo pelo formato padrão e acrescenta a coluna; o resto chega igual
const COLUNAS_COMPARADAS = `id, loja_id, nome, codigo_barras, categoria_id, fornecedor_id,
  preco_custo, preco_venda, estoque_atual, estoque_minimo, data_validade, ativo,
  criado_em, atualizado_em, sincronizado`;
const todos = (db) => db.getAllAsync(`SELECT ${COLUNAS_COMPARADAS} FROM produto ORDER BY id`);

const TABELAS_COM_UUID = ["loja", "usuario", "categoria", "fornecedor", "produto", "movimentacao"];

async function uuidsESenhas(db) {
  const uuids = [];
  for (const t of TABELAS_COM_UUID) {
    for (const l of await db.getAllAsync(`SELECT uuid FROM ${t} ORDER BY id`)) uuids.push(l.uuid);
  }
  const senhas = (await db.getAllAsync("SELECT senha_hash FROM usuario ORDER BY id")).map((l) => l.senha_hash);
  return { uuids, senhas };
}

test("banco antigo migra sem perder produto nem movimentação", async () => {
  const db = await bancoNaVersao0();
  const antes = await todos(db);

  await abrir(db);

  assert.deepEqual(await todos(db), antes);
  assert.deepEqual(await db.getAllAsync("PRAGMA foreign_key_check"), []);
  // a única movimentação do banco antigo; o uuid dela muda na versão 2
  const mov = await db.getFirstAsync(
    "SELECT produto_id FROM movimentacao ORDER BY id LIMIT 1",
  );
  assert.equal(mov.produto_id, REFRIGERANTE);
  assert.equal((await db.getFirstAsync("PRAGMA user_version")).user_version, VERSAO_ESQUEMA);
  assert.equal((await db.getFirstAsync("PRAGMA foreign_keys")).foreign_keys, 1);
});

test("depois da migração, o código do desativado fica livre e o do ativo não (RN04)", async () => {
  const db = await bancoNaVersao0();
  await abrir(db);

  const novo = await inserirProduto(db, "prod-novo", "Refrigerante Cola 2L", "7891234567892");
  // 6 foi o produto apagado: o contador não volta atrás
  assert.equal(novo.lastInsertRowId, 7);

  await assert.rejects(
    inserirProduto(db, "prod-repetido", "Arroz repetido", "7891234567890"),
    /UNIQUE/,
  );
});

test("migração interrompida antes de gravar a versão roda de novo sem estragar nada", async () => {
  const db = await bancoNaVersao0();
  await migrar(db);
  const depoisDaPrimeira = await todos(db);

  // a versão ainda é 0, então a próxima abertura migra outra vez
  await abrir(db);

  assert.deepEqual(await todos(db), depoisDaPrimeira);
});

test("banco novo já nasce na versão atual, com o índice parcial da RN04", async () => {
  const db = await openDatabaseAsync();

  await abrir(db);

  assert.equal((await db.getFirstAsync("PRAGMA user_version")).user_version, VERSAO_ESQUEMA);
  const indice = await db.getFirstAsync(
    "SELECT sql FROM sqlite_master WHERE name = 'uq_produto_loja_codigo'",
  );
  assert.match(indice.sql, /WHERE ativo = 1/);
});

test("versão 2: uuid no formato padrão, senha só como resumo e o login com a mesma senha", async () => {
  const db = await bancoNaVersao0();

  await abrir(db);

  const { uuids, senhas } = await uuidsESenhas(db);
  assert.ok(uuids.length > 0);
  assert.ok(uuids.every(ehUuid), "algum uuid ficou fora do formato padrão");
  assert.equal(new Set(uuids).size, uuids.length);
  assert.ok(senhas.every((s) => s.startsWith("sha256$")), "alguma senha ficou em texto puro");
  // a senha de teste da carga inicial continua a mesma para quem entra
  assert.equal(await conferirSenha("admin123", senhas[0]), true);
  assert.equal(await conferirSenha("errada", senhas[0]), false);
});

test("versão 2: colunas e tabelas da sincronização existem, com a linha única do estado", async () => {
  const db = await bancoNaVersao0();

  await abrir(db);

  for (const t of ["categoria", "fornecedor", "produto", "movimentacao"]) {
    const colunas = (await db.getAllAsync(`PRAGMA table_info(${t})`)).map((c) => c.name);
    assert.ok(colunas.includes("sincronizado_em"), `${t} sem sincronizado_em`);
  }
  const estado = await db.getAllAsync("SELECT id, loja_uuid, corte FROM sincronizacao");
  assert.deepEqual(estado.map((l) => ({ ...l })), [{ id: 1, loja_uuid: null, corte: null }]);
  await db.runAsync("INSERT INTO preferencia (chave, valor) VALUES ('dias_vencimento', '30')");
});

test("versão 2 rodada de novo não troca uuid nem resumo já convertidos", async () => {
  const db = await bancoNaVersao0();
  await abrir(db);
  const antes = await uuidsESenhas(db);

  // simula a abertura seguinte de um banco que parou antes de gravar a versão
  await db.execAsync("PRAGMA user_version = 1;");
  await abrir(db);

  assert.deepEqual(await uuidsESenhas(db), antes);
});
