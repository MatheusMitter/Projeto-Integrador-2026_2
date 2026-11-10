// Migração do banco local (src/database/migracoes.ts). Cada teste monta um
// banco como os criados antes do controle de versão, com o código de barras
// único também entre os desativados, e confere a passagem para a RN04.

import { test } from "node:test";
import assert from "node:assert/strict";

import { openDatabaseAsync } from "./apoio/expo-sqlite-node.mjs";
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

const todos = (db) => db.getAllAsync("SELECT * FROM produto ORDER BY id");

test("banco antigo migra sem perder produto nem movimentação", async () => {
  const db = await bancoNaVersao0();
  const antes = await todos(db);

  await abrir(db);

  assert.deepEqual(await todos(db), antes);
  assert.deepEqual(await db.getAllAsync("PRAGMA foreign_key_check"), []);
  const mov = await db.getFirstAsync(
    "SELECT produto_id FROM movimentacao WHERE uuid = 'mov-0001'",
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
