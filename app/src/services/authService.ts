// Autenticação e sessão.
// A senha ainda é comparada em texto puro; o hash entra com o servidor.

import { obterBanco, gerarUuid } from "../database/conexao";
import { TipoPerfil, Usuario } from "../domain/tipos";

let usuarioAtual: Usuario | null = null;

export function sessaoAtual(): Usuario | null {
  return usuarioAtual;
}

export function encerrarSessao(): void {
  usuarioAtual = null;
}

export interface ResultadoLogin {
  sucesso: boolean;
  mensagem?: string;
  usuario?: Usuario;
}

export async function entrar(
  email: string,
  senha: string,
): Promise<ResultadoLogin> {
  const db = await obterBanco();

  const l = await db.getFirstAsync<{
    id: number;
    loja_id: number;
    nome: string;
    email: string;
    senha_hash: string;
    tipo_perfil: TipoPerfil;
    ativo: number;
  }>("SELECT * FROM usuario WHERE email = ? AND ativo = 1", [
    email.trim().toLowerCase(),
  ]);

  // mensagem genérica de propósito, para não revelar quais e-mails existem
  const erroPadrao = {
    sucesso: false,
    mensagem: "E-mail ou senha inválidos.",
  };

  if (!l || l.senha_hash !== senha) return erroPadrao;

  usuarioAtual = {
    id: l.id,
    lojaId: l.loja_id,
    nome: l.nome,
    email: l.email,
    tipoPerfil: l.tipo_perfil,
    ativo: true,
  };

  return { sucesso: true, usuario: usuarioAtual };
}

export interface DadosCadastro {
  nome: string;
  email: string;
  senha: string;
  confirmacao: string;
  tipoPerfil: TipoPerfil;
}


export function validarCadastro(d: DadosCadastro): string | null {
  if (d.nome.trim().length < 3) return "Informe o nome completo.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(d.email.trim()))
    return "Informe um e-mail válido.";
  if (d.senha.length < 8)
    return "A senha precisa ter no mínimo 8 caracteres.";
  if (!/[a-zA-Z]/.test(d.senha) || !/[0-9]/.test(d.senha))
    return "A senha precisa conter letras e números.";
  if (d.senha !== d.confirmacao) return "As senhas não coincidem.";
  return null;
}

export async function cadastrar(
  d: DadosCadastro,
  lojaId = 1,
): Promise<ResultadoLogin> {
  const erro = validarCadastro(d);
  if (erro) return { sucesso: false, mensagem: erro };

  const db = await obterBanco();
  const email = d.email.trim().toLowerCase();

  // RN02
  const existe = await db.getFirstAsync<{ id: number }>(
    "SELECT id FROM usuario WHERE email = ?",
    [email],
  );
  if (existe) {
    return {
      sucesso: false,
      mensagem: "Já existe uma conta com este e-mail.",
    };
  }

  try {
    const r = await db.runAsync(
      `INSERT INTO usuario (uuid, loja_id, nome, email, senha_hash, tipo_perfil)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [gerarUuid(), lojaId, d.nome.trim(), email, d.senha, d.tipoPerfil],
    );

    usuarioAtual = {
      id: r.lastInsertRowId,
      lojaId,
      nome: d.nome.trim(),
      email,
      tipoPerfil: d.tipoPerfil,
      ativo: true,
    };

    return { sucesso: true, usuario: usuarioAtual };
  } catch {
    return {
      sucesso: false,
      mensagem: "Não foi possível criar a conta. Tente novamente.",
    };
  }
}
