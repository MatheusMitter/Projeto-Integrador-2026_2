// Preferências guardadas no aparelho (tabela preferencia, migração 2), como
// o interruptor das notificações e o prazo do alerta de vencimento.

import { obterBanco } from "../database/conexao";

export async function ler(chave: string): Promise<string | null> {
  const db = await obterBanco();
  const l = await db.getFirstAsync<{ valor: string }>(
    "SELECT valor FROM preferencia WHERE chave = ?",
    [chave],
  );
  return l?.valor ?? null;
}

export async function gravar(chave: string, valor: string): Promise<void> {
  const db = await obterBanco();
  await db.runAsync(
    `INSERT INTO preferencia (chave, valor) VALUES (?, ?)
     ON CONFLICT (chave) DO UPDATE SET valor = excluded.valor`,
    [chave, valor],
  );
}
