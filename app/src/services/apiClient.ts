// Chamada à retaguarda com limite de tempo. Nunca lança erro: devolve "ok"
// com o corpo, "erro" com o código e a mensagem do servidor, ou "falha"
// quando não houve resposta (sem rede, servidor dormindo, tempo esgotado).

import { URL_API } from "../config";

export type Resposta<T> =
  | { tipo: "ok"; status: number; corpo: T }
  | { tipo: "erro"; status: number; mensagem: string }
  | { tipo: "falha" };

export async function chamarApi<T>(
  caminho: string,
  opcoes: {
    metodo?: "GET" | "POST";
    corpo?: unknown;
    token?: string | null;
    tempoLimiteMs: number;
  },
): Promise<Resposta<T>> {
  const controle = new AbortController();
  const relogio = setTimeout(() => controle.abort(), opcoes.tempoLimiteMs);
  const cabecalhos: Record<string, string> = { Accept: "application/json" };
  if (opcoes.corpo !== undefined) cabecalhos["Content-Type"] = "application/json";
  if (opcoes.token) cabecalhos.Authorization = `Bearer ${opcoes.token}`;

  try {
    // fetch lido na hora da chamada, para o teste poder trocá-lo
    const resposta = await globalThis.fetch(`${URL_API}${caminho}`, {
      method: opcoes.metodo ?? "GET",
      headers: cabecalhos,
      body: opcoes.corpo === undefined ? undefined : JSON.stringify(opcoes.corpo),
      signal: controle.signal,
    });
    const texto = await resposta.text();
    let dados: unknown = null;
    try {
      dados = texto ? JSON.parse(texto) : null;
    } catch {
      dados = null;
    }
    if (resposta.ok) return { tipo: "ok", status: resposta.status, corpo: dados as T };
    const mensagem =
      dados && typeof dados === "object" && "mensagem" in dados
        ? String((dados as { mensagem: unknown }).mensagem)
        : `O servidor respondeu com o código ${resposta.status}.`;
    return { tipo: "erro", status: resposta.status, mensagem };
  } catch {
    return { tipo: "falha" };
  } finally {
    clearTimeout(relogio);
  }
}
