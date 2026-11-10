// Preferências de Ajustes (US14, US22). Valem só neste aparelho.

import * as preferenciaRepo from "../repositories/preferenciaRepository";
import { lerPrazoVencimento, type PrazoVencimento } from "./regras";

const NOTIFICACOES = "notificacoes";
const PRAZO_VENCIMENTO = "dias_alerta_vencimento";

/** Começam desligadas: a permissão é pedida quando a pessoa liga. */
export async function notificacoesLigadas(): Promise<boolean> {
  return (await preferenciaRepo.ler(NOTIFICACOES)) === "1";
}

export async function gravarNotificacoes(ligadas: boolean): Promise<void> {
  await preferenciaRepo.gravar(NOTIFICACOES, ligadas ? "1" : "0");
}

export async function prazoVencimento(): Promise<PrazoVencimento> {
  return lerPrazoVencimento(await preferenciaRepo.ler(PRAZO_VENCIMENTO));
}

export async function gravarPrazoVencimento(dias: PrazoVencimento): Promise<void> {
  await preferenciaRepo.gravar(PRAZO_VENCIMENTO, String(dias));
}
