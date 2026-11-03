// Controle de sincronização com o servidor. Por enquanto só conta o que
// está pendente; a fila de envio entra junto com a retaguarda.

import { obterBanco } from "../database/conexao";

export async function contarPendentes(): Promise<number> {
  const db = await obterBanco();
  const l = await db.getFirstAsync<{ total: number }>(
    `SELECT (SELECT COUNT(*) FROM produto      WHERE sincronizado = 0)
          + (SELECT COUNT(*) FROM movimentacao WHERE sincronizado = 0)
          + (SELECT COUNT(*) FROM fornecedor   WHERE sincronizado = 0)
          + (SELECT COUNT(*) FROM categoria    WHERE sincronizado = 0) AS total`,
  );
  return l?.total ?? 0;
}
