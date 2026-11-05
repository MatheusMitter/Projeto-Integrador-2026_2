// Produto: leitura com a RN01 aplicada antes de chegar à tela, gravação com
// validação, e a quantidade inicial registrada como movimentação na mesma
// transação do cadastro.

import { emTransacao } from "../database/conexao";
import type { ProdutoVisivel, ResumoEstoque, TipoPerfil } from "../domain/tipos";
import * as produtoRepo from "../repositories/produtoRepository";
import { sessaoAtual } from "./authService";
import { aplicarMovimentacao } from "./estoqueService";
import { atualizarResumoDiario, semEsperar } from "./notificacoesService";
import { prazoVencimento } from "./preferenciaService";
import { pedirSincronizacao } from "./sincronizacaoService";
import {
  type EntradaProduto,
  podeGerenciarCadastros,
  podeVerFinanceiro,
  produtoParaPerfil,
  resumirEstoque,
  validarProduto,
} from "./regras";

export interface ResultadoOperacao {
  sucesso: boolean;
  mensagem?: string;
}

const SESSAO_ENCERRADA: ResultadoOperacao = {
  sucesso: false,
  mensagem: "Sua sessão foi encerrada. Entre de novo para continuar.",
};

function perfilAtual(): TipoPerfil {
  return sessaoAtual()?.tipoPerfil ?? "OPERADOR";
}

export async function listarProdutos(termo = ""): Promise<ProdutoVisivel[]> {
  const perfil = perfilAtual();
  const produtos = await produtoRepo.listar(termo);
  return produtos.map((p) => produtoParaPerfil(p, perfil));
}

export async function buscarProduto(id: number): Promise<ProdutoVisivel | null> {
  const produto = await produtoRepo.buscarPorId(id);
  return produto ? produtoParaPerfil(produto, perfilAtual()) : null;
}

// RN08, visível só ao proprietário (RN01). "Vencendo" usa o prazo de Ajustes.
export async function resumoDoEstoque(): Promise<ResumoEstoque> {
  const [produtos, dias] = await Promise.all([produtoRepo.listar(), prazoVencimento()]);
  const resumo = resumirEstoque(produtos, new Date(), dias);
  return podeVerFinanceiro(perfilAtual())
    ? resumo
    : { ...resumo, valorTotalEstoque: null };
}

export interface FormularioProduto extends EntradaProduto {
  codigoBarras: string;
  fornecedorId: number | null;
}

export async function salvarProduto(
  form: FormularioProduto,
  id?: number,
): Promise<ResultadoOperacao> {
  const usuario = sessaoAtual();
  if (!usuario) return SESSAO_ENCERRADA;

  const editando = id !== undefined;
  const validacao = validarProduto(form, {
    informaCusto: podeVerFinanceiro(usuario.tipoPerfil),
    editando,
  });
  if (!validacao.valido) return { sucesso: false, mensagem: validacao.mensagem };

  const v = validacao.valores;
  const dados = {
    nome: v.nome,
    codigoBarras: form.codigoBarras.trim() || null,
    categoriaId: v.categoriaId,
    fornecedorId: form.fornecedorId,
    precoCusto: v.precoCusto,
    precoVenda: v.precoVenda,
    estoqueMinimo: v.estoqueMinimo,
    dataValidade: v.dataValidade,
  };

  try {
    if (editando) {
      await produtoRepo.atualizar(id, dados);
    } else {
      // produto e entrada inicial juntos: se a entrada falhar, o produto não
      // fica cadastrado com saldo zero
      await emTransacao(async () => {
        const novoId = await produtoRepo.inserir(dados);
        if (v.quantidadeInicial > 0) {
          const r = await aplicarMovimentacao(
            {
              produtoId: novoId,
              tipo: "COMPRA",
              quantidade: v.quantidadeInicial,
              observacoes: "Estoque inicial do cadastro",
            },
            usuario.id,
          );
          if (!r.sucesso) throw new Error(r.mensagem);
        }
      });
    }
    // sem esperar: com rede, vai ao servidor em segundo plano; e a validade
    // pode ter mudado o resumo de vencimento das 9h
    pedirSincronizacao();
    semEsperar(atualizarResumoDiario());
    return { sucesso: true };
  } catch (erro) {
    const texto = erro instanceof Error ? erro.message : String(erro);
    // RN04, garantida pelo índice único uq_produto_loja_codigo do esquema,
    // que só vale entre produtos ativos
    if (texto.includes("UNIQUE")) {
      return {
        sucesso: false,
        mensagem: "Já existe um produto com este código de barras (RN04).",
      };
    }
    return {
      sucesso: false,
      mensagem: "Não foi possível salvar o produto. Tente novamente.",
    };
  }
}

// RN12, restrita ao proprietário (US09)
export async function desativarProduto(id: number): Promise<ResultadoOperacao> {
  const usuario = sessaoAtual();
  if (!usuario) return SESSAO_ENCERRADA;
  if (!podeGerenciarCadastros(usuario.tipoPerfil)) {
    return {
      sucesso: false,
      mensagem: "Apenas o proprietário pode desativar produtos.",
    };
  }
  try {
    await produtoRepo.desativar(id);
    pedirSincronizacao();
    semEsperar(atualizarResumoDiario());
    return { sucesso: true };
  } catch {
    return {
      sucesso: false,
      mensagem: "Não foi possível desativar o produto. Tente novamente.",
    };
  }
}
