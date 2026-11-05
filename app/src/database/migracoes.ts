// Migrações do banco local. O ESQUEMA só cria o que falta (CREATE ... IF NOT
// EXISTS), então mudar uma tabela que já existe no aparelho exige migração.
// A versão fica no próprio arquivo do banco (PRAGMA user_version); banco
// criado antes deste controle está na versão 0.
//
// Cada migração guarda o formato da tabela da época dela, mesmo que repita o
// ESQUEMA: se a tabela mudar de novo, a migração antiga continua válida.

import type { SQLiteDatabase } from "expo-sqlite";
import { ehResumo, ehUuid, novoUuid, resumirSenha } from "./cripto";

export const VERSAO_ESQUEMA = 2;

/**
 * Leva um banco antigo até a versão atual. Roda antes do ESQUEMA, que depois
 * cria o que faltar, como os índices. Banco novo não passa por aqui: o
 * ESQUEMA já o cria na versão atual.
 */
export async function migrar(db: SQLiteDatabase): Promise<void> {
  const linha = await db.getFirstAsync<{ user_version: number }>(
    "PRAGMA user_version",
  );
  const versao = linha?.user_version ?? 0;
  if (versao >= VERSAO_ESQUEMA) return;

  const produto = await db.getFirstAsync<{ name: string }>(
    "SELECT name FROM sqlite_master WHERE type = 'table' AND name = 'produto'",
  );
  if (!produto) return;

  if (versao < 1) await codigoDeBarrasUnicoSoEntreAtivos(db);
  if (versao < 2) await prepararSincronizacao(db);
}

const TABELAS_QUE_SINCRONIZAM = ["categoria", "fornecedor", "produto", "movimentacao"];
const TABELAS_COM_UUID = ["loja", "usuario", ...TABELAS_QUE_SINCRONIZAM];

// Versão 2 (R6b e DA11). Coluna com o instante do aceite do servidor nas
// tabelas que sincronizam, tabelas da sincronização e das preferências, uuid
// no formato que a retaguarda aceita e senha guardada só como resumo. Cada
// passo confere antes de agir, para a migração poder rodar de novo se for
// interrompida antes de gravar a versão.
async function prepararSincronizacao(db: SQLiteDatabase): Promise<void> {
  await db.withTransactionAsync(async () => {
    for (const tabela of TABELAS_QUE_SINCRONIZAM) {
      const colunas = await db.getAllAsync<{ name: string }>(
        `PRAGMA table_info(${tabela})`,
      );
      if (!colunas.some((c) => c.name === "sincronizado_em")) {
        await db.execAsync(`ALTER TABLE ${tabela} ADD COLUMN sincronizado_em TEXT;`);
      }
    }
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS sincronizacao (
        id               INTEGER PRIMARY KEY CHECK (id = 1),
        loja_uuid        TEXT,
        corte            TEXT,
        ultimo_resultado TEXT,
        ultimo_em        TEXT
      );
      INSERT OR IGNORE INTO sincronizacao (id) VALUES (1);
      CREATE TABLE IF NOT EXISTS preferencia (
        chave TEXT PRIMARY KEY,
        valor TEXT NOT NULL
      );
    `);
    await normalizarUuidsESenhas(db);
  });
}

/**
 * Troca o uuid fora do formato padrão por um aleatório e a senha em texto
 * puro pelo resumo. Serve à migração e à carga inicial; quem chama abre a
 * transação. As chaves estrangeiras usam o id, então trocar o uuid não quebra
 * nenhuma ligação.
 */
export async function normalizarUuidsESenhas(db: SQLiteDatabase): Promise<void> {
  for (const tabela of TABELAS_COM_UUID) {
    const linhas = await db.getAllAsync<{ id: number; uuid: string }>(
      `SELECT id, uuid FROM ${tabela}`,
    );
    for (const l of linhas) {
      if (!ehUuid(l.uuid)) {
        await db.runAsync(`UPDATE ${tabela} SET uuid = ? WHERE id = ?`, [novoUuid(), l.id]);
      }
    }
  }
  const usuarios = await db.getAllAsync<{ id: number; senha_hash: string }>(
    "SELECT id, senha_hash FROM usuario",
  );
  for (const u of usuarios) {
    if (!ehResumo(u.senha_hash)) {
      await db.runAsync("UPDATE usuario SET senha_hash = ? WHERE id = ?", [
        await resumirSenha(u.senha_hash),
        u.id,
      ]);
    }
  }
}

const COLUNAS_PRODUTO = `id, uuid, loja_id, nome, codigo_barras, categoria_id,
  fornecedor_id, preco_custo, preco_venda, estoque_atual, estoque_minimo,
  data_validade, ativo, criado_em, atualizado_em, sincronizado`;

// Versão 1 (RN04). O UNIQUE (loja_id, codigo_barras) da tabela valia também
// para produto desativado, e o app não reativa produto: o código ficava preso.
// O SQLite não remove restrição de tabela, então ela é refeita com os mesmos
// dados, no procedimento da documentação do SQLite ("Making Other Kinds Of
// Table Schema Changes", em ALTER TABLE). O índice novo vem do ESQUEMA.
async function codigoDeBarrasUnicoSoEntreAtivos(db: SQLiteDatabase): Promise<void> {
  // com a chave estrangeira ligada, apagar a tabela antiga esbarraria nas
  // movimentações; e o PRAGMA não tem efeito dentro de transação
  await db.execAsync("PRAGMA foreign_keys = OFF;");
  try {
    await db.withTransactionAsync(async () => {
      const contador = await db.getFirstAsync<{ seq: number }>(
        "SELECT seq FROM sqlite_sequence WHERE name = 'produto'",
      );
      await db.execAsync(`
        CREATE TABLE produto_novo (
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
          sincronizado   INTEGER NOT NULL DEFAULT 0
        );
        INSERT INTO produto_novo (${COLUNAS_PRODUTO})
          SELECT ${COLUNAS_PRODUTO} FROM produto;
        DROP TABLE produto;
        ALTER TABLE produto_novo RENAME TO produto;
      `);
      // a tabela refeita recomeçaria a contagem pelo maior id que sobrou, e o
      // id de um produto apagado voltaria a ser usado, o que o AUTOINCREMENT
      // existe para impedir
      if (contador) {
        await db.runAsync(
          "UPDATE sqlite_sequence SET seq = MAX(seq, ?) WHERE name = 'produto'",
          [contador.seq],
        );
      }
      // as movimentações continuam apontando para produtos que existem
      const quebradas = await db.getAllAsync("PRAGMA foreign_key_check");
      if (quebradas.length > 0) {
        throw new Error("Migração do produto deixou referência quebrada.");
      }
    });
  } finally {
    await db.execAsync("PRAGMA foreign_keys = ON;");
  }
}
