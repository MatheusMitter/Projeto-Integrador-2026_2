/**
 * Abertura e preparação do banco local.
 *
 * Uma conexão só, reaproveitada. Abrir conexão por consulta desperdiça
 * tempo e, no SQLite, aumenta a chance de bloqueio de escrita.
 */

import * as SQLite from "expo-sqlite";
import { CARGA_INICIAL, ENTRADAS_INICIAIS, ESQUEMA } from "./esquema";

const NOME_BANCO = "stockeasy.db";

let banco: SQLite.SQLiteDatabase | null = null;

export async function obterBanco(): Promise<SQLite.SQLiteDatabase> {
  if (banco) return banco;

  banco = await SQLite.openDatabaseAsync(NOME_BANCO);

  // No SQLite a integridade referencial vem desligada por conexão.
  // Sem esta linha as chaves estrangeiras são ignoradas em silêncio, e a
  // proteção do histórico (RN12) simplesmente não existiria.
  await banco.execAsync("PRAGMA foreign_keys = ON;");

  await banco.execAsync(ESQUEMA);
  await popularSeVazio(banco);

  return banco;
}

async function popularSeVazio(db: SQLite.SQLiteDatabase): Promise<void> {
  const linha = await db.getFirstAsync<{ total: number }>(
    "SELECT COUNT(*) AS total FROM loja",
  );
  if ((linha?.total ?? 0) > 0) return;

  await db.execAsync(CARGA_INICIAL);

  // As entradas iniciais são gravadas aqui, no mesmo formato que o serviço
  // de estoque usa: atualiza o saldo e grava o histórico na mesma
  // transação, para os dois nascerem coerentes.
  //
  // O código está repetido em vez de importar o serviço porque o serviço
  // depende desta função para obter a conexão. Importar de volta criaria
  // dependência circular entre as camadas.
  for (const entrada of ENTRADAS_INICIAIS) {
    await db.withTransactionAsync(async () => {
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
    });
  }
}

/** Usado ao sair da conta, para a próxima sessão reabrir limpa. */
export async function fecharBanco(): Promise<void> {
  if (banco) {
    await banco.closeAsync();
    banco = null;
  }
}

/** Identificador gerado no aparelho, base da idempotência na sincronização. */
export function gerarUuid(): string {
  const aleatorio = () => Math.random().toString(16).slice(2, 10);
  return `${Date.now().toString(16)}-${aleatorio()}-${aleatorio()}`;
}
