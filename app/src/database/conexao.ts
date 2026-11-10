// Abertura do banco local. Uma conexão só, reaproveitada.

import * as SQLite from "expo-sqlite";
import { CARGA_INICIAL, ENTRADAS_INICIAIS, ESQUEMA } from "./esquema";
import { migrar, VERSAO_ESQUEMA } from "./migracoes";

const NOME_BANCO = "stockeasy.db";

let abertura: Promise<SQLite.SQLiteDatabase> | null = null;

// A conexão só passa a valer com esquema e carga prontos. Se algo falhar no
// meio, a próxima chamada tenta do zero, em vez de reaproveitar um banco
// pela metade.
export function obterBanco(): Promise<SQLite.SQLiteDatabase> {
  if (!abertura) {
    abertura = abrir().catch((erro) => {
      abertura = null;
      throw erro;
    });
  }
  return abertura;
}

async function abrir(): Promise<SQLite.SQLiteDatabase> {
  const db = await SQLite.openDatabaseAsync(NOME_BANCO);
  try {
    // no SQLite isso vem desligado por conexão
    await db.execAsync("PRAGMA foreign_keys = ON;");
    // banco antigo é ajustado primeiro; o ESQUEMA depois cria o que faltar
    await migrar(db);
    await db.execAsync(ESQUEMA);
    await db.execAsync(`PRAGMA user_version = ${VERSAO_ESQUEMA};`);
    await popularSeVazio(db);
    return db;
  } catch (erro) {
    await db.closeAsync().catch(() => undefined);
    throw erro;
  }
}

/**
 * Executa a tarefa numa transação. Os repositórios usam esta mesma conexão,
 * então tudo o que gravam durante a tarefa é confirmado ou desfeito junto.
 */
export async function emTransacao<T>(tarefa: () => Promise<T>): Promise<T> {
  const db = await obterBanco();
  let resultado!: T;
  await db.withTransactionAsync(async () => {
    resultado = await tarefa();
  });
  return resultado;
}

async function popularSeVazio(db: SQLite.SQLiteDatabase): Promise<void> {
  const linha = await db.getFirstAsync<{ total: number }>(
    "SELECT COUNT(*) AS total FROM loja",
  );
  if ((linha?.total ?? 0) > 0) return;

  // numa transação só: carga interrompida não deixa o banco pela metade
  await db.withTransactionAsync(async () => {
    await db.execAsync(CARGA_INICIAL);

    // usa a conexão direto em vez dos repositórios: eles pedem o banco a
    // obterBanco(), que ainda está terminando de abrir
    for (const entrada of ENTRADAS_INICIAIS) {
      await db.runAsync(
        "UPDATE produto SET estoque_atual = estoque_atual + ? WHERE id = ?",
        [entrada.quantidade, entrada.produtoId],
      );
      const p = await db.getFirstAsync<{ estoque_atual: number }>(
        "SELECT estoque_atual FROM produto WHERE id = ?",
        [entrada.produtoId],
      );
      await db.runAsync(
        `INSERT INTO movimentacao
           (uuid, produto_id, usuario_id, tipo, quantidade, saldo_apos, observacoes)
         VALUES (?, ?, 1, 'COMPRA', ?, ?, ?)`,
        [
          gerarUuid(),
          entrada.produtoId,
          entrada.quantidade,
          p?.estoque_atual ?? entrada.quantidade,
          entrada.observacao,
        ],
      );
    }
  });
}

// id gerado no aparelho, para não duplicar no reenvio ao servidor
export function gerarUuid(): string {
  const aleatorio = () => Math.random().toString(16).slice(2, 10);
  return `${Date.now().toString(16)}-${aleatorio()}-${aleatorio()}`;
}
