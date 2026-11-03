// Categorias e fornecedores. Manter fornecedor é operação do proprietário
// (RN01); a exclusão respeita a RN13 e, quando permitida, desativa (RN12).

import type { Categoria, Fornecedor } from "../domain/tipos";
import * as cadastroRepo from "../repositories/cadastroRepository";
import { sessaoAtual } from "./authService";
import type { ResultadoOperacao } from "./produtoService";
import { podeGerenciarCadastros, validarFornecedor } from "./regras";

const SEM_PERMISSAO: ResultadoOperacao = {
  sucesso: false,
  mensagem: "Apenas o proprietário pode alterar fornecedores.",
};

function ehProprietario(): boolean {
  const usuario = sessaoAtual();
  return usuario !== null && podeGerenciarCadastros(usuario.tipoPerfil);
}

export function listarCategorias(): Promise<Categoria[]> {
  return cadastroRepo.listarCategorias();
}

export async function listarFornecedores(): Promise<{
  fornecedores: Fornecedor[];
  vinculados: Record<number, number>;
}> {
  const [fornecedores, vinculados] = await Promise.all([
    cadastroRepo.listarFornecedores(),
    cadastroRepo.contarProdutosPorFornecedor(),
  ]);
  return { fornecedores, vinculados };
}

export async function salvarFornecedor(
  dados: { nome: string; telefone: string; email: string },
  id: number | null,
): Promise<ResultadoOperacao> {
  if (!ehProprietario()) return SEM_PERMISSAO;

  const problema = validarFornecedor(dados);
  if (problema) return { sucesso: false, mensagem: problema };

  const limpos = {
    nome: dados.nome.trim(),
    telefone: dados.telefone.trim() || null,
    email: dados.email.trim() || null,
  };
  try {
    if (id === null) await cadastroRepo.inserirFornecedor(limpos);
    else await cadastroRepo.atualizarFornecedor(id, limpos);
    return { sucesso: true };
  } catch {
    return {
      sucesso: false,
      mensagem: "Não foi possível salvar o fornecedor. Tente novamente.",
    };
  }
}

export async function excluirFornecedor(id: number): Promise<ResultadoOperacao> {
  if (!ehProprietario()) return SEM_PERMISSAO;
  try {
    // RN13: com produto ativo vinculado, não sai
    const vinculados = await cadastroRepo.contarProdutosDoFornecedor(id);
    if (vinculados > 0) {
      return {
        sucesso: false,
        mensagem:
          `Não é possível excluir: ${vinculados} produto(s) ainda estão ` +
          `vinculados a este fornecedor. Reatribua ou desative esses ` +
          `produtos antes de excluí-lo. Regra RN13.`,
      };
    }
    // RN12: sai das listas, mas o registro continua para o histórico
    await cadastroRepo.desativarFornecedor(id);
    return { sucesso: true };
  } catch {
    return {
      sucesso: false,
      mensagem: "Não foi possível excluir o fornecedor. Tente novamente.",
    };
  }
}
