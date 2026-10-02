// Abertura do banco local. Uma conexão só, reaproveitada.

import * as SQLite from "expo-sqlite";
import { CARGA_INICIAL, ENTRADAS_INICIAIS, ESQUEMA } from "./esquema";

const NOME_BANCO = "stockeasy.db";

let banco: SQLite.SQLiteDatabase | null = null;

export async function obterBanco(): Promise<SQLite.SQLiteDatabase> {
  if (banco) return banco;

  banco = await SQLite.openDatabaseAsync(NOME_BANCO);

  // no SQLite isso vem desligado por conexão
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

  // repetido aqui em vez de chamar o estoqueService: ele depende desta
  // função para pegar a conexão, e importar de volta daria ciclo
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

// id gerado no aparelho, para não duplicar no reenvio ao servidor
export function gerarUuid(): string {
  const aleatorio = () => Math.random().toString(16).slice(2, 10);
  return `${Date.now().toString(16)}-${aleatorio()}-${aleatorio()}`;
}
