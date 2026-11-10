// Sincronização com a retaguarda (R6b): envia o que está pendente, baixa o
// que mudou na loja desde o último corte e guarda o resultado para as telas.
// Roda uma de cada vez: quem pede durante uma sincronização recebe a mesma.
// Nunca lança erro; qualquer falha vira um resultado com mensagem curta, e
// nada do aparelho se perde (AC6b.4).

import * as repo from "../repositories/sincronizacaoRepository";
import type {
  Aceitos,
  Alteracoes,
  Divergencia,
  ResultadoGuardado,
} from "../repositories/sincronizacaoRepository";
import { chamarApi, type Resposta } from "./apiClient";
import { temInternet } from "./rede";
import { descreverMomento } from "./regras";
import { apagarToken, lerToken } from "./sessaoRemota";

// o plano gratuito da hospedagem dorme e leva perto de 1 minuto para acordar
const TEMPO_LIMITE_MS = 75000;

export type Situacao = "ok" | "sem-conta" | "sem-rede" | "sessao-expirada" | "recusado" | "falha";

export interface ResultadoSincronizacao extends ResultadoGuardado {
  situacao: Situacao;
}

const MENSAGENS: Record<Exclude<Situacao, "recusado">, string> = {
  ok: "Sincronização concluída.",
  "sem-conta":
    "Este aparelho ainda não está ligado ao servidor. Entre com a internet ligada para ativar a sincronização.",
  "sem-rede":
    "Sem internet agora. Os dados continuam salvos neste aparelho e vão na próxima sincronização.",
  "sessao-expirada":
    "A sessão com o servidor expirou. Entre de novo com a internet ligada para voltar a sincronizar.",
  falha:
    "Não foi possível falar com o servidor. Os dados continuam salvos neste aparelho, e a sincronização tenta de novo depois.",
};

function resultado(situacao: Exclude<Situacao, "recusado">, enviados = 0): ResultadoSincronizacao {
  return { situacao, mensagem: MENSAGENS[situacao], enviados, recebidos: 0, divergencias: [] };
}

let emAndamento: Promise<ResultadoSincronizacao> | null = null;
const ouvintes = new Set<(r: ResultadoSincronizacao) => void>();

export function sincronizar(): Promise<ResultadoSincronizacao> {
  if (!emAndamento) {
    const atual = executar();
    emAndamento = atual;
    void atual.then((r) => {
      emAndamento = null;
      for (const ouvinte of ouvintes) ouvinte(r);
    });
  }
  return emAndamento;
}

/** Avisa a tela quando uma sincronização termina, mesmo a disparada sozinha. */
export function aoTerminarSincronizacao(ouvinte: (r: ResultadoSincronizacao) => void): () => void {
  ouvintes.add(ouvinte);
  return () => {
    ouvintes.delete(ouvinte);
  };
}

async function executar(): Promise<ResultadoSincronizacao> {
  try {
    const token = await lerToken();
    if (!token) return await guardar(resultado("sem-conta"));
    if (!(await temInternet())) return await guardar(resultado("sem-rede"));

    let enviados = 0;
    const divergencias = new Map<string, Divergencia>();

    const lote = await repo.separarPendentes();
    if (repo.totalDoLote(lote) > 0) {
      const r = await chamarApi<{
        aceitos: Aceitos;
        divergencias: { produtoUuid: string; saldo: number }[];
        instanteServidor: string;
      }>("/sync/enviar", { metodo: "POST", corpo: lote, token, tempoLimiteMs: TEMPO_LIMITE_MS });
      if (r.tipo !== "ok") return await guardar(await deErro(r));
      await repo.marcarEnviados(r.corpo.aceitos, r.corpo.instanteServidor);
      enviados = repo.totalDoLote(r.corpo.aceitos);
      for (const d of r.corpo.divergencias) {
        divergencias.set(d.produtoUuid.toLowerCase(), {
          produto: await repo.nomeDoProduto(d.produtoUuid),
          saldo: d.saldo,
        });
      }
    }

    const { corte } = await repo.lerEstado();
    const caminho = corte ? `/sync/baixar?desde=${encodeURIComponent(corte)}` : "/sync/baixar";
    const b = await chamarApi<Alteracoes>(caminho, { token, tempoLimiteMs: TEMPO_LIMITE_MS });
    if (b.tipo !== "ok") return await guardar(await deErro(b, enviados));
    const aplicado = await repo.aplicarAlteracoes(b.corpo);
    await repo.gravarCorte(b.corpo.instanteServidor);
    for (const d of aplicado.divergencias) {
      if (!divergencias.has(d.produtoUuid)) {
        divergencias.set(d.produtoUuid, { produto: d.produto, saldo: d.saldo });
      }
    }

    return await guardar({
      situacao: "ok",
      mensagem: MENSAGENS.ok,
      enviados,
      recebidos: aplicado.recebidos,
      divergencias: [...divergencias.values()],
    });
  } catch {
    return guardar(resultado("falha")).catch(() => resultado("falha"));
  }
}

async function deErro(
  r: Exclude<Resposta<unknown>, { tipo: "ok" }>,
  enviados = 0,
): Promise<ResultadoSincronizacao> {
  if (r.tipo === "falha") return resultado("falha", enviados);
  if (r.status === 401) {
    await apagarToken();
    return resultado("sessao-expirada", enviados);
  }
  // 409 ou 422: o servidor explicou o motivo; o lote continua pendente
  return {
    situacao: "recusado",
    mensagem: `${r.mensagem} Os dados continuam salvos neste aparelho.`,
    enviados,
    recebidos: 0,
    divergencias: [],
  };
}

async function guardar(r: ResultadoSincronizacao): Promise<ResultadoSincronizacao> {
  await repo.gravarResultado(r, new Date().toISOString());
  return r;
}

// ---- disparos ----

let agendada: ReturnType<typeof setTimeout> | null = null;

/**
 * Pede uma sincronização logo depois de uma escrita, juntando pedidos
 * próximos num só. Se uma já estiver rodando, espera ela terminar e roda de
 * novo, para levar o que foi gravado depois de o lote ter sido separado.
 */
export function pedirSincronizacao(atrasoMs = 1500): void {
  if (agendada) clearTimeout(agendada);
  agendada = setTimeout(() => {
    agendada = null;
    if (emAndamento) void emAndamento.then(() => pedirSincronizacao(0));
    else void sincronizar();
  }, atrasoMs);
  // no Node dos testes, o relógio não segura o processo aberto
  const relogio: unknown = agendada;
  if (typeof relogio === "object" && relogio !== null && "unref" in relogio) {
    (relogio as { unref: () => void }).unref();
  }
}

/** Para os testes: cancela o pedido que estiver esperando o relógio. */
export function cancelarSincronizacaoAgendada(): void {
  if (agendada) clearTimeout(agendada);
  agendada = null;
}

// ---- leitura para as telas ----

export interface EstadoDaSincronizacao {
  pendentes: number;
  temConta: boolean;
  emAndamento: boolean;
  // última tentativa, com qualquer resultado
  ultimoEm: string | null;
  // última sincronização que chegou ao fim: o corte, no relógio do servidor
  ultimaConcluidaEm: string | null;
  ultimoResultado: ResultadoGuardado | null;
}

export async function estadoDaSincronizacao(): Promise<EstadoDaSincronizacao> {
  const [pendentes, estado, token] = await Promise.all([
    repo.contarPendentes(),
    repo.lerEstado(),
    lerToken(),
  ]);
  return {
    pendentes,
    temConta: token !== null,
    emAndamento: emAndamento !== null,
    ultimoEm: estado.ultimoEm,
    ultimaConcluidaEm: estado.corte,
    ultimoResultado: estado.ultimoResultado,
  };
}

// ---- textos para as telas (desenho aprovado em 05/11, itens 01 e 02) ----

export interface AvisoDeTela {
  tipo: "info" | "atencao" | "erro" | "sucesso";
  texto: string;
}

function registros(n: number): string {
  return n === 1 ? "1 registro" : `${n} registros`;
}

/** A frase do cartão "Sincronização", em Ajustes. */
export function descricaoDaSincronizacao(e: EstadoDaSincronizacao, agora = new Date()): string {
  if (!e.temConta) {
    return e.ultimoResultado?.situacao === "sessao-expirada"
      ? MENSAGENS["sessao-expirada"]
      : MENSAGENS["sem-conta"];
  }
  const situacao =
    e.pendentes > 0 ? `${registros(e.pendentes)} aguardando envio.` : "Tudo enviado ao servidor.";
  const ultima = e.ultimaConcluidaEm
    ? ` Última sincronização: ${descreverMomento(e.ultimaConcluidaEm, agora)}.`
    : " Ainda não sincronizado.";
  return situacao + ultima;
}

/** O aviso logo abaixo do botão "Sincronizar agora", depois de apertado. */
export function avisoDoResultado(r: ResultadoSincronizacao): AvisoDeTela {
  if (r.situacao === "ok") {
    const partes: string[] = [];
    if (r.enviados > 0) partes.push(`${r.enviados} ${r.enviados === 1 ? "enviado" : "enviados"}`);
    if (r.recebidos > 0) partes.push(`${r.recebidos} ${r.recebidos === 1 ? "recebido" : "recebidos"}`);
    return {
      tipo: "sucesso",
      texto: partes.length
        ? `Sincronização concluída. ${partes.join(" e ")}.`
        : "Sincronização concluída. Tudo já estava em dia.",
    };
  }
  if (r.situacao === "sem-rede" || r.situacao === "sem-conta") return { tipo: "info", texto: r.mensagem };
  return { tipo: "erro", texto: r.mensagem };
}

/**
 * O aviso do Painel: um de cada vez, o mais importante do momento, nesta
 * ordem: divergência, recusa do servidor, pendentes com conta, pendentes sem
 * conta. Com tudo enviado, nenhum.
 */
export function avisoDoPainel(e: EstadoDaSincronizacao): AvisoDeTela | null {
  const r = e.ultimoResultado;
  // divergência já resolvida no servidor, com saldo de volta a zero ou mais, não aparece
  const divergencias = (r?.divergencias ?? []).filter((d) => d.saldo === null || d.saldo < 0);
  if (divergencias.length === 1) {
    const [d] = divergencias;
    const saldo = d.saldo === null ? "o saldo lá ficou negativo" : `o saldo lá ficou em ${d.saldo}`;
    return {
      tipo: "atencao",
      texto:
        `${d.produto}: o servidor recebeu mais saídas do que havia em estoque, e ${saldo}. ` +
        "Aqui ficou 0. Confira o estoque e registre um ajuste.",
    };
  }
  if (divergencias.length > 1) {
    return {
      tipo: "atencao",
      texto:
        `${divergencias.map((d) => d.produto).join(", ")}: o servidor recebeu mais saídas do que ` +
        "havia em estoque, e o saldo lá ficou negativo. Aqui ficou 0. Confira o estoque e registre um ajuste.",
    };
  }
  if (r?.situacao === "recusado") {
    return {
      tipo: "erro",
      texto: `A última sincronização não foi aceita: ${r.mensagem.charAt(0).toLowerCase()}${r.mensagem.slice(1)}`,
    };
  }
  if (r?.situacao === "sessao-expirada" && !e.temConta) return { tipo: "erro", texto: r.mensagem };
  if (e.pendentes === 0) return null;
  if (e.temConta) {
    return {
      tipo: "info",
      texto:
        e.pendentes === 1
          ? "1 registro aguardando envio ao servidor. Ele vai sozinho quando houver internet."
          : `${e.pendentes} registros aguardando envio ao servidor. Eles vão sozinhos quando houver internet.`,
    };
  }
  return {
    tipo: "info",
    texto: `${registros(e.pendentes)} só neste aparelho. Entre com a internet ligada para sincronizar.`,
  };
}

/** Quantos registros do aparelho ainda não foram aceitos pelo servidor. */
export function registrosNaoSincronizados(): Promise<number> {
  return repo.contarPendentes();
}
