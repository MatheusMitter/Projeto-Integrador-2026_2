// Autenticação e sessão. Com internet, o login e a criação de conta passam
// pela retaguarda (AC6b.1). Sem internet, ou se o servidor não responder a
// tempo, o login segue local, conferindo o resumo da senha guardado no
// aparelho (DA11). O token fica no armazenamento seguro (sessaoRemota).

import { emTransacao } from "../database/conexao";
import { conferirSenha, resumirSenha } from "../database/cripto";
import type { TipoPerfil, Usuario } from "../domain/tipos";
import * as sincronizacaoRepo from "../repositories/sincronizacaoRepository";
import * as usuarioRepo from "../repositories/usuarioRepository";
import { chamarApi } from "./apiClient";
import { temInternet } from "./rede";
import { type DadosCadastro, validarCadastro } from "./regras";
import { guardarToken } from "./sessaoRemota";

const LOJA = 1;
// o login não prende a pessoa esperando o servidor acordar: passado o
// limite, entra pelo caminho local e a sincronização tenta depois
const TEMPO_LIMITE_MS = 8000;
// criar conta acontece uma vez e não tem caminho local equivalente com
// internet; logo depois de acordar, a primeira gravação do servidor no
// banco passou de 8 s no teste de 05/11, então aqui a espera é maior
const TEMPO_LIMITE_CADASTRO_MS = 30000;
const CREDENCIAL_INVALIDA = "E-mail ou senha inválidos.";

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

interface ContaDoServidor {
  token: string;
  usuario: { uuid: string; nome: string; email: string; perfil: TipoPerfil };
  loja: { uuid: string; nome: string };
}

export async function entrar(email: string, senha: string): Promise<ResultadoLogin> {
  const emailLimpo = email.trim().toLowerCase();

  if (await temInternet()) {
    const r = await chamarApi<ContaDoServidor>("/auth/login", {
      metodo: "POST",
      corpo: { email: emailLimpo, senha },
      tempoLimiteMs: TEMPO_LIMITE_MS,
    });
    if (r.tipo === "ok") return adotarContaDoServidor(r.corpo, senha);
    // Recusa do servidor não encerra aqui: a conta pode existir só neste
    // aparelho, como as de teste da carga inicial, e segue valendo nele, sem
    // sincronizar. Sem resposta, segue local do mesmo jeito.
  }

  return entrarLocal(emailLimpo, senha);
}

async function entrarLocal(email: string, senha: string): Promise<ResultadoLogin> {
  const credenciais = await usuarioRepo.buscarCredenciais(email);
  // mensagem genérica de propósito, para não revelar quais e-mails existem
  if (!credenciais || !(await conferirSenha(senha, credenciais.senhaHash))) {
    return { sucesso: false, mensagem: CREDENCIAL_INVALIDA };
  }
  usuarioAtual = credenciais.usuario;
  return { sucesso: true, usuario: usuarioAtual };
}

/**
 * Grava a conta que o servidor confirmou e guarda o token. Na primeira conta
 * confirmada, a loja do aparelho é ligada à do servidor. Um aparelho guarda
 * uma loja só: conta de outra loja é recusada, para os dados não se
 * misturarem.
 */
async function adotarContaDoServidor(conta: ContaDoServidor, senha: string): Promise<ResultadoLogin> {
  const lojaLigada = (await sincronizacaoRepo.lerEstado()).lojaUuid;
  if (lojaLigada && lojaLigada !== conta.loja.uuid.toLowerCase()) {
    return {
      sucesso: false,
      mensagem: "Esta conta é de outra loja. Este aparelho já está ligado a uma loja no servidor.",
    };
  }

  const email = conta.usuario.email.trim().toLowerCase();
  const senhaHash = await resumirSenha(senha);
  await emTransacao(async () => {
    if (!lojaLigada) await sincronizacaoRepo.vincularLoja(conta.loja.uuid, conta.loja.nome);
    await usuarioRepo.gravarDoServidor({
      lojaId: LOJA,
      uuid: conta.usuario.uuid.toLowerCase(),
      nome: conta.usuario.nome,
      email,
      senhaHash,
      tipoPerfil: conta.usuario.perfil,
    });
  });
  await guardarToken(conta.token);

  const credenciais = await usuarioRepo.buscarCredenciais(email);
  if (!credenciais) {
    return { sucesso: false, mensagem: "Não foi possível gravar a conta neste aparelho." };
  }
  usuarioAtual = credenciais.usuario;
  return { sucesso: true, usuario: usuarioAtual };
}

/**
 * Decide o perfil de quem se cadastra no aparelho. Quem se cadastra não
 * escolhe.
 *
 * Deixar o perfil no formulário abria um furo na RN01: bastava ao operador
 * criar uma segunda conta como proprietário para ver custo e margem. Então
 * a regra é a posse da loja: o primeiro usuário é o proprietário, e quem
 * chega depois entra como operador. Promover alguém é ação de proprietário,
 * e entra com a administração de usuários no servidor.
 */
async function perfilDeNovoUsuario(lojaId: number): Promise<TipoPerfil> {
  return (await usuarioRepo.lojaTemProprietario(lojaId)) ? "OPERADOR" : "PROPRIETARIO";
}

export async function cadastrar(d: DadosCadastro, lojaId = LOJA): Promise<ResultadoLogin> {
  const erro = validarCadastro(d);
  if (erro) return { sucesso: false, mensagem: erro };

  const email = d.email.trim().toLowerCase();

  // RN02
  if (await usuarioRepo.emailEmUso(email)) {
    return { sucesso: false, mensagem: "Já existe uma conta com este e-mail." };
  }

  const nome = d.nome.trim();

  // Com o aparelho ainda sem loja no servidor, a conta nova cria a loja lá e
  // é a dona dela: quem liga o aparelho ao servidor é quem monta a loja. Com
  // a loja já ligada, a conta nova fica só no aparelho, como operador, até
  // a administração de usuários no servidor.
  if ((await temInternet()) && !(await sincronizacaoRepo.lerEstado()).lojaUuid) {
    const r = await chamarApi<ContaDoServidor>("/auth/registrar", {
      metodo: "POST",
      corpo: { nomeLoja: await usuarioRepo.nomeDaLoja(lojaId), nome, email, senha: d.senha },
      tempoLimiteMs: TEMPO_LIMITE_CADASTRO_MS,
    });
    if (r.tipo === "ok") return adotarContaDoServidor(r.corpo, d.senha);
    if (r.tipo === "erro" && r.status === 409) {
      return {
        sucesso: false,
        mensagem: "Já existe uma conta com este e-mail no servidor. Entre com ela na tela de login.",
      };
    }
    // Com internet, a conta nasce no servidor ou não nasce. Criar só no
    // aparelho deixaria duas contas com o mesmo e-mail, uma de cada lado. O
    // servidor pode ter criado a conta mesmo sem responder a tempo; aí a nova
    // tentativa recebe "já existe" e a pessoa entra pela tela de login.
    return {
      sucesso: false,
      mensagem: "O servidor não respondeu a tempo. Tente de novo em instantes.",
    };
  }

  const tipoPerfil = await perfilDeNovoUsuario(lojaId);
  try {
    const id = await usuarioRepo.inserir({
      lojaId,
      nome,
      email,
      senhaHash: await resumirSenha(d.senha),
      tipoPerfil,
    });
    usuarioAtual = { id, lojaId, nome, email, tipoPerfil, ativo: true };
    return { sucesso: true, usuario: usuarioAtual };
  } catch {
    return { sucesso: false, mensagem: "Não foi possível criar a conta. Tente novamente." };
  }
}
