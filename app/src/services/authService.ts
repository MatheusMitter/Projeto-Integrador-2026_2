// Autenticação e sessão.
// A senha ainda é comparada em texto puro; o hash entra com o servidor.

import type { TipoPerfil, Usuario } from "../domain/tipos";
import * as usuarioRepo from "../repositories/usuarioRepository";
import { type DadosCadastro, validarCadastro } from "./regras";

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
  const credenciais = await usuarioRepo.buscarCredenciais(
    email.trim().toLowerCase(),
  );

  // mensagem genérica de propósito, para não revelar quais e-mails existem
  if (!credenciais || credenciais.senhaHash !== senha) {
    return { sucesso: false, mensagem: "E-mail ou senha inválidos." };
  }

  usuarioAtual = credenciais.usuario;
  return { sucesso: true, usuario: usuarioAtual };
}

/**
 * Decide o perfil de quem se cadastra. Quem se cadastra não escolhe.
 *
 * Deixar o perfil no formulário abria um furo na RN01: bastava ao operador
 * criar uma segunda conta como proprietário para ver custo e margem. Então
 * a regra é a posse da loja: o primeiro usuário é o proprietário, e quem
 * chega depois entra como operador. Promover alguém é ação de proprietário,
 * e entra com a administração de usuários no servidor.
 */
async function perfilDeNovoUsuario(lojaId: number): Promise<TipoPerfil> {
  return (await usuarioRepo.lojaTemProprietario(lojaId))
    ? "OPERADOR"
    : "PROPRIETARIO";
}

export async function cadastrar(
  d: DadosCadastro,
  lojaId = 1,
): Promise<ResultadoLogin> {
  const erro = validarCadastro(d);
  if (erro) return { sucesso: false, mensagem: erro };

  const email = d.email.trim().toLowerCase();

  // RN02
  if (await usuarioRepo.emailEmUso(email)) {
    return {
      sucesso: false,
      mensagem: "Já existe uma conta com este e-mail.",
    };
  }

  const tipoPerfil = await perfilDeNovoUsuario(lojaId);
  const nome = d.nome.trim();

  try {
    const id = await usuarioRepo.inserir({
      lojaId,
      nome,
      email,
      senha: d.senha,
      tipoPerfil,
    });
    usuarioAtual = { id, lojaId, nome, email, tipoPerfil, ativo: true };
    return { sucesso: true, usuario: usuarioAtual };
  } catch {
    return {
      sucesso: false,
      mensagem: "Não foi possível criar a conta. Tente novamente.",
    };
  }
}
