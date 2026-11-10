// Sincronização com a retaguarda (src/services/sincronizacaoService.ts),
// contra o banco do aplicativo num SQLite em memória e uma retaguarda
// simulada no lugar do fetch. Os testes rodam em ordem e partem do estado
// deixado pelo anterior (AC6b.6).

import { test } from "node:test";
import assert from "node:assert/strict";

import { definirRedeParaTeste } from "./apoio/expo-network-node.mjs";
import { limparCofreParaTeste } from "./apoio/expo-secure-store-node.mjs";
import { derrubarServidor, instalarServidorFalso } from "./apoio/servidor-falso.mjs";
import { emTransacao, obterBanco } from "../src/database/conexao.ts";
import { aplicarMovimentacao } from "../src/services/estoqueService.ts";
import { guardarToken, lerToken } from "../src/services/sessaoRemota.ts";
import {
  avisoDoPainel,
  avisoDoResultado,
  descricaoDaSincronizacao,
  estadoDaSincronizacao,
  registrosNaoSincronizados,
  sincronizar,
} from "../src/services/sincronizacaoService.ts";

const INSTANTE = "2026-11-04T23:00:00.123456Z";
// carga inicial: 5 categorias, 3 fornecedores, 5 produtos e 5 entradas
const PENDENTES_DA_CARGA = 18;

async function linhas(sql, parametros = []) {
  return (await obterBanco()).getAllAsync(sql, parametros);
}

async function linha(sql, parametros = []) {
  return (await obterBanco()).getFirstAsync(sql, parametros);
}

// a retaguarda aceita tudo de um lote válido
function aceitarTudo({ corpo }) {
  return {
    corpo: {
      aceitos: {
        categorias: corpo.categorias.map((c) => c.uuid),
        fornecedores: corpo.fornecedores.map((f) => f.uuid),
        produtos: corpo.produtos.map((p) => p.uuid),
        movimentacoes: corpo.movimentacoes.map((m) => m.uuid),
      },
      divergencias: [],
      instanteServidor: INSTANTE,
    },
  };
}

function alteracoes(parte = {}) {
  return {
    corpo: {
      categorias: [],
      fornecedores: [],
      produtos: [],
      movimentacoes: [],
      alertas: [],
      instanteServidor: INSTANTE,
      ...parte,
    },
  };
}

// o produto como a retaguarda devolve, a partir do que está no aparelho
async function produtoDoServidor(nome, mudancas = {}) {
  const p = await linha(
    `SELECT p.uuid, p.nome, p.codigo_barras, c.uuid AS categoria_uuid, f.uuid AS fornecedor_uuid,
            p.preco_custo, p.preco_venda, p.estoque_atual, p.estoque_minimo, p.data_validade
       FROM produto p JOIN categoria c ON c.id = p.categoria_id
       LEFT JOIN fornecedor f ON f.id = p.fornecedor_id
      WHERE p.nome = ?`,
    [nome],
  );
  return {
    uuid: p.uuid,
    nome: p.nome,
    codigoBarras: p.codigo_barras,
    categoriaUuid: p.categoria_uuid,
    fornecedorUuid: p.fornecedor_uuid,
    precoCusto: p.preco_custo,
    precoVenda: p.preco_venda,
    estoqueAtual: p.estoque_atual,
    estoqueMinimo: p.estoque_minimo,
    dataValidade: p.data_validade,
    ativo: true,
    ...mudancas,
  };
}

test("sem conta no servidor, nada vai para a rede e os dados ficam pendentes", async () => {
  limparCofreParaTeste();
  definirRedeParaTeste(true);
  const chamadas = instalarServidorFalso({});

  const r = await sincronizar();

  assert.equal(r.situacao, "sem-conta");
  assert.equal(chamadas.length, 0);
  assert.equal(await registrosNaoSincronizados(), PENDENTES_DA_CARGA);
});

test("sem internet, nada vai para a rede", async () => {
  await guardarToken("token-de-teste");
  definirRedeParaTeste(false);
  const chamadas = instalarServidorFalso({});

  const r = await sincronizar();

  assert.equal(r.situacao, "sem-rede");
  assert.equal(chamadas.length, 0);
  assert.equal(await registrosNaoSincronizados(), PENDENTES_DA_CARGA);
});

test("o lote sai na ordem em que foi gravado, e o que o servidor aceitou fica marcado", async () => {
  definirRedeParaTeste(true);
  const chamadas = instalarServidorFalso({
    "POST /sync/enviar": aceitarTudo,
    "GET /sync/baixar": () => alteracoes(),
  });

  const r = await sincronizar();

  assert.equal(r.situacao, "ok", r.mensagem);
  assert.equal(r.enviados, PENDENTES_DA_CARGA);
  const envio = chamadas.find((c) => c.caminho === "/sync/enviar");
  assert.equal(envio.autorizacao, "Bearer token-de-teste");
  assert.deepEqual(
    envio.corpo.produtos.map((p) => p.uuid),
    (await linhas("SELECT uuid FROM produto ORDER BY id")).map((l) => l.uuid),
  );
  assert.deepEqual(
    envio.corpo.movimentacoes.map((m) => m.uuid),
    (await linhas("SELECT uuid FROM movimentacao ORDER BY id")).map((l) => l.uuid),
  );
  // referências pelo uuid, data no formato ISO, e o saldo não vai
  assert.ok(envio.corpo.produtos.every((p) => /^[0-9a-f-]{36}$/.test(p.categoriaUuid)));
  assert.match(envio.corpo.movimentacoes[0].dataHora, /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/);
  assert.equal("estoqueAtual" in envio.corpo.produtos[0], false);

  assert.equal(await registrosNaoSincronizados(), 0);
  const marcadas = await linha(
    "SELECT COUNT(*) AS n FROM movimentacao WHERE sincronizado = 1 AND sincronizado_em = ?",
    [INSTANTE],
  );
  assert.equal(marcadas.n, 5);
  // primeiro download sem corte; depois, o corte é o instante do servidor
  assert.equal(chamadas.find((c) => c.caminho === "/sync/baixar").busca, "");
  assert.equal((await linha("SELECT corte FROM sincronizacao")).corte, INSTANTE);
});

test("sem nada pendente, só baixa, a partir do último corte", async () => {
  const chamadas = instalarServidorFalso({ "GET /sync/baixar": () => alteracoes() });

  const r = await sincronizar();

  assert.equal(r.situacao, "ok");
  assert.equal(chamadas.some((c) => c.caminho === "/sync/enviar"), false);
  assert.equal(chamadas[0].busca, `?desde=${encodeURIComponent(INSTANTE)}`);
});

test("do servidor: saldo substituído, movimentação nova acrescentada e cadastro alterado lá prevalece", async () => {
  const refri = await produtoDoServidor("Refrigerante Cola 2L", { estoqueAtual: 21 });
  const dono = await linha("SELECT uuid FROM usuario WHERE email = 'proprietario@stockeasy.com'");
  const novaMovimentacao = "aaaaaaaa-0000-4000-8000-000000000001";
  instalarServidorFalso({
    "GET /sync/baixar": () =>
      alteracoes({
        categorias: [{ uuid: refri.categoriaUuid, nome: "Bebidas e Sucos", ativo: true }],
        produtos: [refri],
        movimentacoes: [
          {
            uuid: novaMovimentacao,
            produtoUuid: refri.uuid,
            usuarioUuid: dono.uuid,
            tipo: "VENDA",
            quantidade: 4,
            saldoApos: 21,
            dataHora: "2026-11-04T22:59:00Z",
            observacoes: "Vendido em outro aparelho",
          },
        ],
        instanteServidor: "2026-11-04T23:05:00Z",
      }),
  });

  const r = await sincronizar();

  assert.equal(r.situacao, "ok");
  assert.equal(r.recebidos, 3);
  const produto = await linha("SELECT estoque_atual, categoria_id FROM produto WHERE uuid = ?", [refri.uuid]);
  assert.equal(produto.estoque_atual, 21);
  const categoria = await linha("SELECT nome FROM categoria WHERE id = ?", [produto.categoria_id]);
  assert.equal(categoria.nome, "Bebidas e Sucos");
  const mov = await linha("SELECT quantidade, data_hora, sincronizado FROM movimentacao WHERE uuid = ?", [
    novaMovimentacao,
  ]);
  assert.deepEqual({ ...mov }, { quantidade: 4, data_hora: "2026-11-04 22:59:00", sincronizado: 1 });
  // o que veio do servidor não volta para a fila
  assert.equal(await registrosNaoSincronizados(), 0);
});

test("alteração feita no aparelho durante o download não é sobrescrita e fica pendente", async () => {
  const arroz = await produtoDoServidor("Arroz Tipo 1 5kg", { nome: "Arroz do Servidor" });
  instalarServidorFalso({
    "GET /sync/baixar": async () => {
      // a pessoa edita o produto enquanto o download está a caminho
      await (await obterBanco()).runAsync(
        "UPDATE produto SET nome = 'Arroz Editado Aqui', sincronizado = 0 WHERE uuid = ?",
        [arroz.uuid],
      );
      return alteracoes({ produtos: [arroz], instanteServidor: "2026-11-04T23:10:00Z" });
    },
  });

  const r = await sincronizar();

  assert.equal(r.situacao, "ok");
  assert.equal((await linha("SELECT nome FROM produto WHERE uuid = ?", [arroz.uuid])).nome, "Arroz Editado Aqui");
  assert.equal(await registrosNaoSincronizados(), 1);
});

test("duas sincronizações pedidas juntas viram uma só, e a alteração pendente vai no lote", async () => {
  const chamadas = instalarServidorFalso({
    "POST /sync/enviar": aceitarTudo,
    "GET /sync/baixar": () => alteracoes(),
  });

  const [a, b] = await Promise.all([sincronizar(), sincronizar()]);

  assert.equal(a, b);
  assert.equal(chamadas.filter((c) => c.caminho === "/sync/enviar").length, 1);
  assert.equal(chamadas.filter((c) => c.caminho === "/sync/baixar").length, 1);
  const envio = chamadas.find((c) => c.caminho === "/sync/enviar");
  assert.deepEqual(envio.corpo.produtos.map((p) => p.nome), ["Arroz Editado Aqui"]);
  assert.equal(await registrosNaoSincronizados(), 0);
});

test("venda feita aqui durante o download conta como um registro e não perde o saldo", async () => {
  const feijao = await produtoDoServidor("Feijão Preto 1kg");
  const idFeijao = (await linha("SELECT id FROM produto WHERE uuid = ?", [feijao.uuid])).id;
  const dono = await linha("SELECT id FROM usuario WHERE email = 'proprietario@stockeasy.com'");
  instalarServidorFalso({
    "GET /sync/baixar": async () => {
      // a venda acontece enquanto o download está a caminho, e o servidor
      // devolve o produto com o saldo de antes dela
      const venda = await emTransacao(() =>
        aplicarMovimentacao({ produtoId: idFeijao, tipo: "VENDA", quantidade: 2 }, dono.id),
      );
      assert.equal(venda.sucesso, true);
      return alteracoes({ produtos: [feijao], instanteServidor: "2026-11-04T23:20:00Z" });
    },
  });

  const r = await sincronizar();

  assert.equal(r.situacao, "ok");
  const atual = await linha("SELECT estoque_atual, sincronizado FROM produto WHERE id = ?", [idFeijao]);
  assert.equal(atual.estoque_atual, feijao.estoqueAtual - 2);
  // só a venda fica pendente; o saldo do produto não vai ao servidor
  assert.equal(atual.sincronizado, 1);
  assert.equal(await registrosNaoSincronizados(), 1);
});

test("divergência do servidor: o aparelho fica com zero e o aviso guarda o saldo de lá", async () => {
  const detergente = await produtoDoServidor("Detergente Líquido 500ml", { estoqueAtual: -3 });
  const dono = await linha("SELECT id FROM usuario WHERE email = 'proprietario@stockeasy.com'");
  const idProduto = (await linha("SELECT id FROM produto WHERE uuid = ?", [detergente.uuid])).id;
  // uma venda gravada aqui, que somada às de outro aparelho passa do estoque
  await (await obterBanco()).runAsync(
    `INSERT INTO movimentacao (uuid, produto_id, usuario_id, tipo, quantidade, saldo_apos)
     VALUES ('bbbbbbbb-0000-4000-8000-000000000002', ?, ?, 'VENDA', 2, 38)`,
    [idProduto, dono.id],
  );
  instalarServidorFalso({
    "POST /sync/enviar": ({ corpo }) => {
      const resposta = aceitarTudo({ corpo });
      resposta.corpo.divergencias = [{ produtoUuid: detergente.uuid, saldo: -3 }];
      return resposta;
    },
    "GET /sync/baixar": () =>
      alteracoes({
        produtos: [detergente],
        alertas: [
          { produtoUuid: detergente.uuid, tipoAlerta: "DIVERGENCIA", mensagem: "Saldo ajustado pelo servidor." },
        ],
      }),
  });

  const r = await sincronizar();

  assert.equal(r.situacao, "ok");
  assert.equal((await linha("SELECT estoque_atual FROM produto WHERE uuid = ?", [detergente.uuid])).estoque_atual, 0);
  assert.deepEqual(r.divergencias, [{ produto: "Detergente Líquido 500ml", saldo: -3 }]);
  // o resultado fica guardado para o Painel mostrar
  const estado = await estadoDaSincronizacao();
  assert.deepEqual(estado.ultimoResultado.divergencias, r.divergencias);
});

test("servidor recusa o lote com motivo: a mensagem aparece e nada se perde", async () => {
  await (await obterBanco()).runAsync(
    "UPDATE fornecedor SET telefone = '(62) 3000-0000', sincronizado = 0 WHERE nome = 'Comercial XYZ'",
  );
  instalarServidorFalso({
    "POST /sync/enviar": () => ({
      status: 409,
      corpo: { mensagem: "Já existe um registro com estes dados." },
    }),
  });

  const r = await sincronizar();

  assert.equal(r.situacao, "recusado");
  assert.match(r.mensagem, /Já existe um registro/);
  assert.match(r.mensagem, /continuam salvos neste aparelho/);
  assert.equal(await registrosNaoSincronizados(), 1);
});

test("servidor fora do ar: falha com mensagem curta, e o pendente continua", async () => {
  derrubarServidor();

  const r = await sincronizar();

  assert.equal(r.situacao, "falha");
  assert.match(r.mensagem, /Não foi possível falar com o servidor/);
  assert.equal(await registrosNaoSincronizados(), 1);
});

test("servidor recusa o token: ele sai do aparelho e o pendente continua", async () => {
  instalarServidorFalso({
    "POST /sync/enviar": () => ({ status: 401, corpo: { mensagem: "Não autorizado." } }),
  });

  const r = await sincronizar();

  assert.equal(r.situacao, "sessao-expirada");
  assert.equal(await lerToken(), null);
  assert.equal(await registrosNaoSincronizados(), 1);
  assert.equal((await estadoDaSincronizacao()).temConta, false);
});

// ---- textos das telas, no desenho aprovado em 05/11 (itens 01 e 02) ----

function estado(parte = {}) {
  return {
    pendentes: 0,
    temConta: true,
    emAndamento: false,
    ultimoEm: null,
    ultimaConcluidaEm: null,
    ultimoResultado: null,
    ...parte,
  };
}

function resultado(parte = {}) {
  return {
    situacao: "ok",
    mensagem: "Sincronização concluída.",
    enviados: 0,
    recebidos: 0,
    divergencias: [],
    ...parte,
  };
}

test("Painel mostra um aviso por vez: divergência, recusa, pendentes com conta, pendentes sem conta", () => {
  const divergencia = resultado({ divergencias: [{ produto: "Detergente Líquido 500ml", saldo: -3 }] });
  const recusa = resultado({
    situacao: "recusado",
    mensagem: "Já existe um registro com estes dados. Os dados continuam salvos neste aparelho.",
  });

  assert.deepEqual(avisoDoPainel(estado({ pendentes: 3, ultimoResultado: divergencia })), {
    tipo: "atencao",
    texto:
      "Detergente Líquido 500ml: o servidor recebeu mais saídas do que havia em estoque, e o saldo " +
      "lá ficou em -3. Aqui ficou 0. Confira o estoque e registre um ajuste.",
  });
  assert.deepEqual(avisoDoPainel(estado({ pendentes: 3, ultimoResultado: recusa })), {
    tipo: "erro",
    texto:
      "A última sincronização não foi aceita: já existe um registro com estes dados. Os dados " +
      "continuam salvos neste aparelho.",
  });
  assert.deepEqual(avisoDoPainel(estado({ pendentes: 3 })), {
    tipo: "info",
    texto: "3 registros aguardando envio ao servidor. Eles vão sozinhos quando houver internet.",
  });
  assert.deepEqual(avisoDoPainel(estado({ pendentes: 1, temConta: false })), {
    tipo: "info",
    texto: "1 registro só neste aparelho. Entre com a internet ligada para sincronizar.",
  });
  assert.equal(avisoDoPainel(estado()), null);
  // divergência que já voltou a zero ou mais no servidor não aparece
  const resolvida = resultado({ divergencias: [{ produto: "Arroz", saldo: 2 }] });
  assert.equal(avisoDoPainel(estado({ ultimoResultado: resolvida })), null);
});

test("cartão de Ajustes diz o estado e a última sincronização", () => {
  const momento = "2026-11-04T23:25:00Z";
  const agora = new Date(momento);
  const dois = (n) => String(n).padStart(2, "0");
  const horario = `${dois(agora.getHours())}:${dois(agora.getMinutes())}`;

  assert.equal(
    descricaoDaSincronizacao(estado({ pendentes: 3, ultimaConcluidaEm: momento }), agora),
    `3 registros aguardando envio. Última sincronização: hoje, ${horario}.`,
  );
  assert.equal(
    descricaoDaSincronizacao(estado({ ultimaConcluidaEm: momento }), agora),
    `Tudo enviado ao servidor. Última sincronização: hoje, ${horario}.`,
  );
  assert.match(descricaoDaSincronizacao(estado({ temConta: false })), /ainda não está ligado ao servidor/);
  const expirada = resultado({ situacao: "sessao-expirada", mensagem: "x" });
  assert.match(
    descricaoDaSincronizacao(estado({ temConta: false, ultimoResultado: expirada })),
    /sessão com o servidor expirou/,
  );
});

test("aviso do botão Sincronizar agora", () => {
  assert.deepEqual(avisoDoResultado(resultado({ enviados: 3, recebidos: 2 })), {
    tipo: "sucesso",
    texto: "Sincronização concluída. 3 enviados e 2 recebidos.",
  });
  assert.equal(avisoDoResultado(resultado({ enviados: 1 })).texto, "Sincronização concluída. 1 enviado.");
  assert.equal(avisoDoResultado(resultado()).texto, "Sincronização concluída. Tudo já estava em dia.");
  assert.equal(avisoDoResultado(resultado({ situacao: "sem-rede", mensagem: "Sem internet." })).tipo, "info");
  assert.equal(avisoDoResultado(resultado({ situacao: "falha", mensagem: "Falhou." })).tipo, "erro");
});
