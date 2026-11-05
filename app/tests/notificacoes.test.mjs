// Notificações locais (src/services/notificacoesService.ts) contra o banco
// do aplicativo num SQLite em memória e um substituto do expo-notifications
// que guarda o que foi agendado. Os testes rodam em ordem e partem do estado
// deixado pelo anterior (AC8b.2, AC8b.3, AC14.1).

import { test } from "node:test";
import assert from "node:assert/strict";

import {
  definirPermissaoParaTeste,
  notificacoesAgendadas,
} from "./apoio/expo-notifications-node.mjs";
import { entrar } from "../src/services/authService.ts";
import { registrarMovimentacao } from "../src/services/estoqueService.ts";
import {
  atualizarResumoDiario,
  desligarNotificacoes,
  ligarNotificacoes,
} from "../src/services/notificacoesService.ts";
import {
  gravarPrazoVencimento,
  notificacoesLigadas,
  prazoVencimento,
} from "../src/services/preferenciaService.ts";
import { cancelarSincronizacaoAgendada } from "../src/services/sincronizacaoService.ts";

// carga inicial (id: estoque, mínimo): Arroz 1 (50, 10), Feijão 2 (30, 15),
// Detergente 4 (40, 10); o Sabonete vence em 12 dias, o Refrigerante em 63
const ARROZ = 1;
const FEIJAO = 2;
const DETERGENTE = 4;

async function vender(produtoId, quantidade) {
  const r = await registrarMovimentacao({ produtoId, tipo: "VENDA", quantidade });
  assert.equal(r.sucesso, true, r.mensagem);
  cancelarSincronizacaoAgendada(); // o envio ao servidor não é assunto daqui
  await new Promise((pronto) => setTimeout(pronto, 30)); // o aviso sai sem esperar a venda
  return r;
}

const avisosCriticos = () => notificacoesAgendadas().filter((n) => n.content.title === "Estoque crítico");
const resumo = () => notificacoesAgendadas().find((n) => n.id === "resumo-vencimento");

test("começam desligadas: a venda que deixa o produto crítico não avisa nada", async () => {
  assert.equal((await entrar("proprietario@stockeasy.com", "admin123")).sucesso, true);
  assert.equal(await notificacoesLigadas(), false);
  assert.equal(await prazoVencimento(), 15);

  await vender(DETERGENTE, 30); // 40 → 10, no mínimo

  assert.deepEqual(notificacoesAgendadas(), []);
});

test("permissão negada pelo sistema: o interruptor continua desligado", async () => {
  definirPermissaoParaTeste({ concedida: false, respostaAoPedido: false });

  assert.equal(await ligarNotificacoes(), false);
  assert.equal(await notificacoesLigadas(), false);
  assert.deepEqual(notificacoesAgendadas(), []);
});

test("ligadas: o resumo das 9h é agendado com os produtos dentro do prazo", async () => {
  definirPermissaoParaTeste({ concedida: false, respostaAoPedido: true });

  assert.equal(await ligarNotificacoes(), true);

  assert.equal(await notificacoesLigadas(), true);
  const r = resumo();
  assert.equal(r.content.body, "Você tem 1 produto vencendo nos próximos 15 dias.");
  assert.deepEqual(r.content.data, { filtro: "VENCENDO" });
  assert.equal(r.trigger.hour, 9);
  assert.equal(r.trigger.minute, 0);
});

test("venda que deixa o produto crítico avisa na hora, e a seguinte não repete", async () => {
  await vender(FEIJAO, 15); // 30 → 15, no mínimo

  const [aviso] = avisosCriticos();
  assert.equal(aviso.content.body, "Feijão Preto 1kg ficou com estoque crítico: 15 unidades, mínimo 15.");
  assert.deepEqual(aviso.content.data, { filtro: "CRITICO" });
  assert.equal(aviso.trigger.channelId, "alertas");

  await vender(FEIJAO, 1); // já estava crítico
  assert.equal(avisosCriticos().length, 1);
});

test("o prazo escolhido muda o resumo: 7 dias sem produto não agenda, 30 dias agenda", async () => {
  await gravarPrazoVencimento(7);
  await atualizarResumoDiario();
  assert.equal(resumo(), undefined);

  await gravarPrazoVencimento(30);
  await atualizarResumoDiario();
  assert.equal(resumo().content.body, "Você tem 1 produto vencendo nos próximos 30 dias.");
});

test("desligadas: tudo o que estava agendado sai, e nada novo é agendado", async () => {
  await desligarNotificacoes();
  assert.deepEqual(notificacoesAgendadas(), []);

  await vender(ARROZ, 40); // 50 → 10, no mínimo
  await atualizarResumoDiario();

  assert.deepEqual(notificacoesAgendadas(), []);
});
