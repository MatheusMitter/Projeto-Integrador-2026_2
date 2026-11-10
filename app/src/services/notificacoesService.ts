// Notificações locais (R8b): estoque crítico na hora da saída e resumo de
// vencimento todo dia às 9h. Quando avisar e o que dizer ficam em regras.ts,
// testados sem o módulo nativo; aqui só se pede permissão, agenda e cancela.
// Com o interruptor de Ajustes desligado, nada sai.

import * as Notifications from "expo-notifications";
import type { FiltroProdutos } from "../navigation/rotas";
import * as produtoRepo from "../repositories/produtoRepository";
import {
  gravarNotificacoes,
  notificacoesLigadas,
  prazoVencimento,
} from "./preferenciaService";
import { estaVencendo, mensagemEstoqueCritico, mensagemResumoVencimento } from "./regras";

const CANAL = "alertas";
const ID_RESUMO = "resumo-vencimento";

// com o app aberto, a notificação aparece do mesmo jeito
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

// no Android 8 ou mais novo, toda notificação precisa de um canal
let canal: Promise<unknown> | null = null;
function prepararCanal(): Promise<unknown> {
  canal ??= Notifications.setNotificationChannelAsync(CANAL, {
    name: "Alertas de estoque",
    importance: Notifications.AndroidImportance.HIGH,
    lightColor: "#2450D6",
  }).catch(() => null);
  return canal;
}

/**
 * Liga as notificações: pede a permissão do sistema na primeira vez e, com
 * ela, grava a escolha e agenda o resumo. Devolve false se a permissão foi
 * negada; aí o interruptor continua desligado.
 */
export async function ligarNotificacoes(): Promise<boolean> {
  const atual = await Notifications.getPermissionsAsync();
  const permitido =
    atual.granted || (atual.canAskAgain && (await Notifications.requestPermissionsAsync()).granted);
  if (!permitido) return false;
  await gravarNotificacoes(true);
  await atualizarResumoDiario();
  return true;
}

export async function desligarNotificacoes(): Promise<void> {
  await gravarNotificacoes(false);
  await Notifications.cancelAllScheduledNotificationsAsync();
}

export async function avisarCritico(p: { nome: string; saldo: number; minimo: number }): Promise<void> {
  if (!(await notificacoesLigadas())) return;
  await prepararCanal();
  await Notifications.scheduleNotificationAsync({
    content: {
      title: "Estoque crítico",
      body: mensagemEstoqueCritico(p.nome, p.saldo, p.minimo),
      data: { filtro: "CRITICO" },
    },
    // sem data: sai na hora, no canal dos alertas
    trigger: { channelId: CANAL },
  });
}

/**
 * Refaz o resumo das 9h com a contagem de agora. Chamado ao entrar no app,
 * depois de salvar produto, de sincronizar e de trocar o prazo. Sem produto
 * no prazo, ou com as notificações desligadas, não fica nada agendado.
 */
export async function atualizarResumoDiario(): Promise<void> {
  await Notifications.cancelScheduledNotificationAsync(ID_RESUMO).catch(() => undefined);
  if (!(await notificacoesLigadas())) return;
  const dias = await prazoVencimento();
  const hoje = new Date();
  const quantidade = (await produtoRepo.listar()).filter((p) =>
    estaVencendo(p.dataValidade, hoje, dias),
  ).length;
  const texto = mensagemResumoVencimento(quantidade, dias);
  if (!texto) return;
  await prepararCanal();
  await Notifications.scheduleNotificationAsync({
    identifier: ID_RESUMO,
    content: { title: "Vencimento próximo", body: texto, data: { filtro: "VENCENDO" } },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour: 9,
      minute: 0,
      channelId: CANAL,
    },
  });
}

/** Para as telas e serviços que só disparam: o aviso nunca derruba quem chamou. */
export function semEsperar(tarefa: Promise<unknown>): void {
  tarefa.catch(() => undefined);
}

function filtroDa(r: Notifications.NotificationResponse | null): FiltroProdutos | null {
  const filtro = r?.notification.request.content.data?.filtro;
  return filtro === "CRITICO" || filtro === "VENCENDO" ? filtro : null;
}

/**
 * Chama a ação com o filtro da notificação tocada (AC8b.4), inclusive a que
 * abriu o app. A resposta é limpa depois de usada, para não reabrir a lista
 * a cada entrada.
 */
export function aoTocarNotificacao(acao: (filtro: FiltroProdutos) => void): () => void {
  const usar = (r: Notifications.NotificationResponse | null) => {
    const filtro = filtroDa(r);
    if (!filtro) return;
    Notifications.clearLastNotificationResponse();
    acao(filtro);
  };
  usar(Notifications.getLastNotificationResponse());
  const assinatura = Notifications.addNotificationResponseReceivedListener(usar);
  return () => assinatura.remove();
}
