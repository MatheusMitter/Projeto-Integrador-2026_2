// Substituto do expo-notifications para os testes. Não mostra nada: guarda
// o que o app agendou, para o teste conferir, e simula a permissão.

export const SchedulableTriggerInputTypes = { DAILY: "daily" };
export const AndroidImportance = { HIGH: 5 };

let permissao = { granted: false, canAskAgain: true };
let respostaAoPedido = true;
const agendadas = new Map();
let contador = 0;

export function setNotificationHandler() {}

export async function setNotificationChannelAsync() {
  return null;
}

export async function getPermissionsAsync() {
  return { ...permissao };
}

export async function requestPermissionsAsync() {
  permissao = { granted: respostaAoPedido, canAskAgain: respostaAoPedido };
  return { ...permissao };
}

export async function scheduleNotificationAsync({ identifier, content, trigger }) {
  const id = identifier ?? `notificacao-${++contador}`;
  agendadas.set(id, { content, trigger });
  return id;
}

export async function cancelScheduledNotificationAsync(id) {
  agendadas.delete(id);
}

export async function cancelAllScheduledNotificationsAsync() {
  agendadas.clear();
}

export function getLastNotificationResponse() {
  return null;
}

export function clearLastNotificationResponse() {}

export function addNotificationResponseReceivedListener() {
  return { remove() {} };
}

// ---- controle pelo teste ----

export function notificacoesAgendadas() {
  return [...agendadas.entries()].map(([id, n]) => ({ id, ...n }));
}

export function definirPermissaoParaTeste({ concedida = false, respostaAoPedido: resposta = true } = {}) {
  permissao = { granted: concedida, canAskAgain: true };
  respostaAoPedido = resposta;
}

export function limparNotificacoesParaTeste() {
  agendadas.clear();
}
