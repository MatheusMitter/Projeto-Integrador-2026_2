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
  ultimoEm: string | null;
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
    ultimoResultado: estado.ultimoResultado,
  };
}

/** Quantos registros do aparelho ainda não foram aceitos pelo servidor. */
export function registrosNaoSincronizados(): Promise<number> {
  return repo.contarPendentes();
}
