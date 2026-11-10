// Acesso a dados de usuário.

import { obterBanco, gerarUuid } from "../database/conexao";
import type { TipoPerfil, Usuario } from "../domain/tipos";

// O resumo da senha sai daqui só para o serviço de autenticação comparar;
// o tipo Usuario não o carrega.
export async function buscarCredenciais(
  email: string,
): Promise<{ usuario: Usuario; senhaHash: string } | null> {
  const db = await obterBanco();
  const l = await db.getFirstAsync<{
    id: number;
    loja_id: number;
    nome: string;
    email: string;
    senha_hash: string;
    tipo_perfil: TipoPerfil;
  }>(
    `SELECT id, loja_id, nome, email, senha_hash, tipo_perfil
       FROM usuario WHERE email = ? AND ativo = 1`,
    [email],
  );
  if (!l) return null;
  return {
    usuario: {
      id: l.id,
      lojaId: l.loja_id,
      nome: l.nome,
      email: l.email,
      tipoPerfil: l.tipo_perfil,
      ativo: true,
    },
    senhaHash: l.senha_hash,
  };
}

export async function emailEmUso(email: string): Promise<boolean> {
  const db = await obterBanco();
  const l = await db.getFirstAsync<{ id: number }>(
    "SELECT id FROM usuario WHERE email = ?",
    [email],
  );
  return l !== null;
}

export async function lojaTemProprietario(lojaId: number): Promise<boolean> {
  const db = await obterBanco();
  const l = await db.getFirstAsync<{ id: number }>(
    `SELECT id FROM usuario
      WHERE loja_id = ? AND tipo_perfil = 'PROPRIETARIO' AND ativo = 1`,
    [lojaId],
  );
  return l !== null;
}

export async function inserir(u: {
  lojaId: number;
  nome: string;
  email: string;
  senha: string;
  tipoPerfil: TipoPerfil;
}): Promise<number> {
  const db = await obterBanco();
  const r = await db.runAsync(
    `INSERT INTO usuario (uuid, loja_id, nome, email, senha_hash, tipo_perfil)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [gerarUuid(), u.lojaId, u.nome, u.email, u.senha, u.tipoPerfil],
  );
  return r.lastInsertRowId;
}
