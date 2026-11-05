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

// senhaHash é o resumo da senha (DA11), nunca a senha digitada
export async function inserir(u: {
  lojaId: number;
  nome: string;
  email: string;
  senhaHash: string;
  tipoPerfil: TipoPerfil;
  uuid?: string;
}): Promise<number> {
  const db = await obterBanco();
  const r = await db.runAsync(
    `INSERT INTO usuario (uuid, loja_id, nome, email, senha_hash, tipo_perfil)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [u.uuid ?? gerarUuid(), u.lojaId, u.nome, u.email, u.senhaHash, u.tipoPerfil],
  );
  return r.lastInsertRowId;
}

/**
 * Grava no aparelho a conta que a retaguarda confirmou: o uuid e o perfil
 * passam a ser os do servidor, e o resumo da senha é renovado para o login
 * sem rede. Atualiza pelo e-mail se a conta já existir aqui.
 */
export async function gravarDoServidor(u: {
  lojaId: number;
  uuid: string;
  nome: string;
  email: string;
  senhaHash: string;
  tipoPerfil: TipoPerfil;
}): Promise<void> {
  const db = await obterBanco();
  const r = await db.runAsync(
    `UPDATE usuario
        SET uuid = ?, nome = ?, senha_hash = ?, tipo_perfil = ?, ativo = 1
      WHERE email = ?`,
    [u.uuid, u.nome, u.senhaHash, u.tipoPerfil, u.email],
  );
  if (r.changes === 0) await inserir(u);
}

export async function nomeDaLoja(lojaId: number): Promise<string> {
  const db = await obterBanco();
  const l = await db.getFirstAsync<{ nome: string }>(
    "SELECT nome FROM loja WHERE id = ?",
    [lojaId],
  );
  return l?.nome ?? "Minha loja";
}
