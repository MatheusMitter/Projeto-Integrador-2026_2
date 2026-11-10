// Retaguarda simulada para os testes. Troca o fetch global, guarda cada
// chamada e responde conforme as rotas que o teste define, no formato
// "MÉTODO /caminho". Rota não definida responde 404.

export function instalarServidorFalso(rotas) {
  const chamadas = [];
  globalThis.fetch = async (url, opcoes = {}) => {
    const { pathname, search } = new URL(url);
    const metodo = opcoes.method ?? "GET";
    const corpo = opcoes.body ? JSON.parse(opcoes.body) : null;
    chamadas.push({
      metodo,
      caminho: pathname,
      busca: search,
      corpo,
      autorizacao: opcoes.headers?.Authorization ?? null,
    });
    const rota = rotas[`${metodo} ${pathname}`];
    if (!rota) {
      return new Response(JSON.stringify({ mensagem: "Rota não simulada." }), { status: 404 });
    }
    const { status = 200, corpo: resposta } = await rota({ corpo, busca: search });
    return new Response(resposta === undefined ? "" : JSON.stringify(resposta), {
      status,
      headers: { "Content-Type": "application/json" },
    });
  };
  return chamadas;
}

/** Servidor fora do ar: toda chamada falha antes de haver resposta. */
export function derrubarServidor() {
  globalThis.fetch = async () => {
    throw new TypeError("fetch failed");
  };
}
