// Substituto do expo-sqlite para os testes, sobre o SQLite que vem no Node.
//
// Implementa só o que o aplicativo usa: abrir, exec, run, getFirst, getAll,
// transação e fechar. O banco fica em memória. Como cada arquivo de teste
// roda em processo próprio, cada um começa do esquema e da carga inicial de
// verdade, criados pelo próprio src/database/conexao.ts.

import { DatabaseSync } from "node:sqlite";

// o expo-sqlite aceita os valores em lista ou soltos; o do Node só soltos,
// e sem booleano nem undefined
function parametros(valores) {
  const lista =
    valores.length === 1 && Array.isArray(valores[0]) ? valores[0] : valores;
  return lista.map((v) =>
    v === undefined ? null : typeof v === "boolean" ? Number(v) : v,
  );
}

class BancoDeTeste {
  constructor() {
    this.db = new DatabaseSync(":memory:");
  }

  async execAsync(sql) {
    this.db.exec(sql);
  }

  async runAsync(sql, ...valores) {
    const r = this.db.prepare(sql).run(...parametros(valores));
    return {
      lastInsertRowId: Number(r.lastInsertRowid),
      changes: Number(r.changes),
    };
  }

  async getFirstAsync(sql, ...valores) {
    return this.db.prepare(sql).get(...parametros(valores)) ?? null;
  }

  async getAllAsync(sql, ...valores) {
    return this.db.prepare(sql).all(...parametros(valores));
  }

  // mesma sequência do expo-sqlite: tudo o que a tarefa grava nesta conexão
  // é confirmado junto ou desfeito junto
  async withTransactionAsync(tarefa) {
    this.db.exec("BEGIN");
    try {
      await tarefa();
      this.db.exec("COMMIT");
    } catch (erro) {
      this.db.exec("ROLLBACK");
      throw erro;
    }
  }

  async closeAsync() {
    this.db.close();
  }
}

export async function openDatabaseAsync() {
  return new BancoDeTeste();
}
