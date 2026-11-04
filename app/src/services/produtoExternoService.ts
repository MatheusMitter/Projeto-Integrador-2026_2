// Consulta de produto por código de barras no Open Food Facts (RF41).
//
// Base pública e gratuita de produtos alimentícios e de higiene, escolhida
// em docs/03-arquitetura.md, seção 8.4. A consulta só sugere: o cadastro
// continua manual quando não há rede, o serviço demora, falha ou não
// conhece o código (RF42). Nada aqui bloqueia a tela.

import type { Categoria } from "../domain/tipos";

export interface ProdutoExterno {
  nome: string;
  categoria?: string;
  fotoUrl?: string;
}

const URL_BASE = "https://world.openfoodfacts.org/api/v2/product/";
const CAMPOS = "product_name,product_name_pt,categories_tags,image_front_url";
export const TEMPO_LIMITE_MS = 5000;

// o Open Food Facts pede um identificador do cliente nas requisições
const CABECALHOS = { "User-Agent": "StockEasy/0.1 (projeto academico PUC Goias)" };

/**
 * Busca o produto pelo código. Devolve `null` em qualquer situação que não
 * seja um produto encontrado: sem rede, erro, tempo esgotado, código
 * desconhecido ou resposta sem nome. `fetchFn` é injetável para os testes.
 */
export async function buscarPorCodigo(
  codigo: string,
  fetchFn: typeof fetch = fetch,
): Promise<ProdutoExterno | null> {
  const limpo = codigo.replace(/\D/g, "");
  if (limpo.length < 8) return null;

  const controle = new AbortController();
  const temporizador = setTimeout(() => controle.abort(), TEMPO_LIMITE_MS);
  try {
    const resposta = await fetchFn(`${URL_BASE}${limpo}.json?fields=${CAMPOS}`, {
      headers: CABECALHOS,
      signal: controle.signal,
    });
    if (!resposta.ok) return null;
    const corpo = (await resposta.json()) as RespostaOpenFoodFacts;
    if (corpo.status !== 1 || !corpo.product) return null;

    const nome = (corpo.product.product_name_pt || corpo.product.product_name || "").trim();
    if (!nome) return null;

    return {
      nome,
      categoria: primeiraCategoria(corpo.product.categories_tags),
      fotoUrl: corpo.product.image_front_url || undefined,
    };
  } catch {
    return null;
  } finally {
    clearTimeout(temporizador);
  }
}

/**
 * Casa a categoria sugerida pelo serviço com as categorias da loja, sem
 * acento e sem caixa. Devolve a categoria local ou `null`.
 */
export function casarCategoria(
  sugerida: string | undefined,
  locais: Categoria[],
): Categoria | null {
  if (!sugerida) return null;
  const alvo = normalizar(sugerida);
  return (
    locais.find((c) => {
      const local = normalizar(c.nome);
      return local === alvo || alvo.includes(local) || local.includes(alvo);
    }) ?? null
  );
}

interface RespostaOpenFoodFacts {
  status?: number;
  product?: {
    product_name?: string;
    product_name_pt?: string;
    categories_tags?: string[];
    image_front_url?: string;
  };
}

// "en:beverages" → "beverages"; "pt:bebidas" → "bebidas"
function primeiraCategoria(tags?: string[]): string | undefined {
  if (!tags || tags.length === 0) return undefined;
  const pt = tags.find((t) => t.startsWith("pt:"));
  return (pt ?? tags[0]).replace(/^[a-z]{2}:/, "").replace(/-/g, " ");
}

function normalizar(texto: string): string {
  return texto
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim();
}
