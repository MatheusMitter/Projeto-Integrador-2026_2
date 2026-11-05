// Fila de envio à retaguarda e aplicação do que ela devolve (docs/03,
// seção 7). O aparelho guarda uma loja só, a de id 1.
//
// Nas quatro tabelas que vão ao servidor, sincronizado vale 0 para pendente,
// 2 para o que está no lote em envio e 1 para o que o servidor aceitou. Uma
// alteração feita no aparelho durante o envio volta a 0 e vai no lote
// seguinte, em vez de ser marcada como enviada sem ter ido.

import { obterBanco } from "../database/conexao";

const LOJA = 1;
const TABELAS = ["categoria", "fornecedor", "produto", "movimentacao"] as const;
// o SQLite aceita até 999 parâmetros por comando
const UUIDS_POR_COMANDO = 400;

// ---- contrato com a retaguarda (api/README.md) ----

export interface Lote {
  categorias: { uuid: string; nome: string; ativo: boolean }[];
  fornecedores: {
    uuid: string;
    nome: string;
    telefone: string | null;
    email: string | null;
    ativo: boolean;
  }[];
  produtos: {
    uuid: string;
    nome: string;
    codigoBarras: string | null;
    categoriaUuid: string;
    fornecedorUuid: string | null;
    precoCusto: number;
    precoVenda: number;
    estoqueMinimo: number;
    dataValidade: string | null;
    ativo: boolean;
    atualizadoEm: string;
  }[];
  movimentacoes: {
    uuid: string;
    produtoUuid: string;
    tipo: string;
    quantidade: number;
    dataHora: string;
    observacoes: string | null;
  }[];
}

export interface Aceitos {
  categorias: string[];
  fornecedores: string[];
  produtos: string[];
  movimentacoes: string[];
}

export interface Alteracoes {
  categorias: Lote["categorias"];
  fornecedores: Lote["fornecedores"];
  produtos: (Omit<Lote["produtos"][number], "atualizadoEm"> & { estoqueAtual: number })[];
  movimentacoes: (Lote["movimentacoes"][number] & { usuarioUuid: string; saldoApos: number })[];
  alertas: { produtoUuid: string; tipoAlerta: string; mensagem: string }[];
  instanteServidor: string;
}

export interface Divergencia {
  produto: string;
  saldo: number | null;
}

export interface ResultadoGuardado {
  situacao: string;
  mensagem: string;
  enviados: number;
  recebidos: number;
  divergencias: Divergencia[];
}

export function totalDoLote(l: Lote | Aceitos): number {
  return l.categorias.length + l.fornecedores.length + l.produtos.length + l.movimentacoes.length;
}

// datetime('now') do SQLite é UTC no formato "AAAA-MM-DD HH:MM:SS"; a
// retaguarda usa ISO 8601
function paraIso(texto: string): string {
  return texto.includes("T") ? texto : `${texto.replace(" ", "T")}Z`;
}

function paraSqlite(iso: string): string {
  return iso.replace("T", " ").replace(/\.\d+/, "").replace("Z", "");
}

// ---- pendentes ----

export async function contarPendentes(): Promise<number> {
  const db = await obterBanco();
  const soma = TABELAS.map((t) => `(SELECT COUNT(*) FROM ${t} WHERE sincronizado <> 1)`).join(" + ");
  const l = await db.getFirstAsync<{ total: number }>(`SELECT ${soma} AS total`);
  return l?.total ?? 0;
}

/**
 * Separa o lote do envio: marca os pendentes como "em envio" e os devolve na
 * ordem em que foram gravados. Um lote interrompido fica com 2 e entra de
 * novo no próximo, porque a seleção pega tudo o que não é 1.
 */
export async function separarPendentes(): Promise<Lote> {
  const db = await obterBanco();
  const lote: Lote = { categorias: [], fornecedores: [], produtos: [], movimentacoes: [] };

  await db.withTransactionAsync(async () => {
    for (const t of TABELAS) {
      await db.runAsync(`UPDATE ${t} SET sincronizado = 2 WHERE sincronizado <> 1`);
    }

    const categorias = await db.getAllAsync<{ uuid: string; nome: string; ativo: number }>(
      "SELECT uuid, nome, ativo FROM categoria WHERE sincronizado = 2 ORDER BY id",
    );
    lote.categorias = categorias.map((c) => ({ uuid: c.uuid, nome: c.nome, ativo: c.ativo === 1 }));

    const fornecedores = await db.getAllAsync<{
      uuid: string;
      nome: string;
      telefone: string | null;
      email: string | null;
      ativo: number;
    }>("SELECT uuid, nome, telefone, email, ativo FROM fornecedor WHERE sincronizado = 2 ORDER BY id");
    lote.fornecedores = fornecedores.map((f) => ({ ...f, ativo: f.ativo === 1 }));

    const produtos = await db.getAllAsync<{
      uuid: string;
      nome: string;
      codigo_barras: string | null;
      categoria_uuid: string;
      fornecedor_uuid: string | null;
      preco_custo: number;
      preco_venda: number;
      estoque_minimo: number;
      data_validade: string | null;
      ativo: number;
      atualizado_em: string;
    }>(
      `SELECT p.uuid, p.nome, p.codigo_barras, c.uuid AS categoria_uuid,
              f.uuid AS fornecedor_uuid, p.preco_custo, p.preco_venda,
              p.estoque_minimo, p.data_validade, p.ativo, p.atualizado_em
         FROM produto p
         JOIN categoria c       ON c.id = p.categoria_id
         LEFT JOIN fornecedor f ON f.id = p.fornecedor_id
        WHERE p.sincronizado = 2
        ORDER BY p.id`,
    );
    // o saldo não vai: só as movimentações mexem no estoque do servidor (DA10)
    lote.produtos = produtos.map((p) => ({
      uuid: p.uuid,
      nome: p.nome,
      codigoBarras: p.codigo_barras,
      categoriaUuid: p.categoria_uuid,
      fornecedorUuid: p.fornecedor_uuid,
      precoCusto: p.preco_custo,
      precoVenda: p.preco_venda,
      estoqueMinimo: p.estoque_minimo,
      dataValidade: p.data_validade,
      ativo: p.ativo === 1,
      atualizadoEm: paraIso(p.atualizado_em),
    }));

    const movimentacoes = await db.getAllAsync<{
      uuid: string;
      produto_uuid: string;
      tipo: string;
      quantidade: number;
      data_hora: string;
      observacoes: string | null;
    }>(
      `SELECT m.uuid, p.uuid AS produto_uuid, m.tipo, m.quantidade, m.data_hora, m.observacoes
         FROM movimentacao m
         JOIN produto p ON p.id = m.produto_id
        WHERE m.sincronizado = 2
        ORDER BY m.id`,
    );
    lote.movimentacoes = movimentacoes.map((m) => ({
      uuid: m.uuid,
      produtoUuid: m.produto_uuid,
      tipo: m.tipo,
      quantidade: m.quantidade,
      dataHora: paraIso(m.data_hora),
      observacoes: m.observacoes,
    }));
  });

  return lote;
}

/** Marca como enviado só o que o servidor aceitou e continua "em envio". */
export async function marcarEnviados(aceitos: Aceitos, instante: string): Promise<void> {
  const db = await obterBanco();
  const porTabela: [string, string[]][] = [
    ["categoria", aceitos.categorias],
    ["fornecedor", aceitos.fornecedores],
    ["produto", aceitos.produtos],
    ["movimentacao", aceitos.movimentacoes],
  ];
  await db.withTransactionAsync(async () => {
    for (const [tabela, uuids] of porTabela) {
      for (let i = 0; i < uuids.length; i += UUIDS_POR_COMANDO) {
        const parte = uuids.slice(i, i + UUIDS_POR_COMANDO).map((u) => u.toLowerCase());
        await db.runAsync(
          `UPDATE ${tabela} SET sincronizado = 1, sincronizado_em = ?
            WHERE sincronizado = 2 AND uuid IN (${parte.map(() => "?").join(", ")})`,
          [instante, ...parte],
        );
      }
    }
  });
}

// ---- o que vem do servidor ----

/**
 * Grava no aparelho o que mudou na loja. O que ainda está pendente aqui não
 * é sobrescrito: vai no próximo envio e, chegando depois, prevalece no
 * servidor (RN09). Cadastros entram pelo uuid; movimentações só são
 * acrescentadas; o saldo do produto passa a ser o do servidor (DA10), sem
 * ficar negativo no aparelho, onde a RN06 continua valendo. O item que não
 * dá para ligar a nada daqui é contado em "ignorados", sem travar o resto.
 */
export async function aplicarAlteracoes(a: Alteracoes): Promise<{
  recebidos: number;
  ignorados: number;
  divergencias: (Divergencia & { produtoUuid: string })[];
}> {
  const db = await obterBanco();
  const instante = a.instanteServidor;
  let recebidos = 0;
  let ignorados = 0;
  const divergencias: (Divergencia & { produtoUuid: string })[] = [];

  const local = (tabela: string, uuid: string) =>
    db.getFirstAsync<{ id: number; sincronizado: number }>(
      `SELECT id, sincronizado FROM ${tabela} WHERE uuid = ?`,
      [uuid.toLowerCase()],
    );
  const idPorUuid = async (tabela: string, uuid: string | null) =>
    uuid ? ((await local(tabela, uuid))?.id ?? null) : null;

  await db.withTransactionAsync(async () => {
    for (const c of a.categorias) {
      const atual = await local("categoria", c.uuid);
      if (atual && atual.sincronizado !== 1) {
        ignorados++;
        continue;
      }
      try {
        if (atual) {
          await db.runAsync(
            "UPDATE categoria SET nome = ?, ativo = ?, sincronizado = 1, sincronizado_em = ? WHERE id = ?",
            [c.nome, c.ativo ? 1 : 0, instante, atual.id],
          );
        } else {
          // a mesma categoria criada com outro uuid adota o do servidor
          const mesmoNome = await db.getFirstAsync<{ id: number }>(
            "SELECT id FROM categoria WHERE loja_id = ? AND nome = ?",
            [LOJA, c.nome],
          );
          if (mesmoNome) {
            await db.runAsync(
              "UPDATE categoria SET uuid = ?, ativo = ?, sincronizado = 1, sincronizado_em = ? WHERE id = ?",
              [c.uuid.toLowerCase(), c.ativo ? 1 : 0, instante, mesmoNome.id],
            );
          } else {
            await db.runAsync(
              `INSERT INTO categoria (uuid, loja_id, nome, ativo, sincronizado, sincronizado_em)
               VALUES (?, ?, ?, ?, 1, ?)`,
              [c.uuid.toLowerCase(), LOJA, c.nome, c.ativo ? 1 : 0, instante],
            );
          }
        }
        recebidos++;
      } catch {
        ignorados++;
      }
    }

    for (const f of a.fornecedores) {
      const atual = await local("fornecedor", f.uuid);
      if (atual && atual.sincronizado !== 1) {
        ignorados++;
        continue;
      }
      try {
        if (atual) {
          await db.runAsync(
            `UPDATE fornecedor SET nome = ?, telefone = ?, email = ?, ativo = ?,
                    sincronizado = 1, sincronizado_em = ? WHERE id = ?`,
            [f.nome, f.telefone, f.email, f.ativo ? 1 : 0, instante, atual.id],
          );
        } else {
          await db.runAsync(
            `INSERT INTO fornecedor (uuid, loja_id, nome, telefone, email, ativo, sincronizado, sincronizado_em)
             VALUES (?, ?, ?, ?, ?, ?, 1, ?)`,
            [f.uuid.toLowerCase(), LOJA, f.nome, f.telefone, f.email, f.ativo ? 1 : 0, instante],
          );
        }
        recebidos++;
      } catch {
        ignorados++;
      }
    }

    for (const p of a.produtos) {
      const atual = await local("produto", p.uuid);
      if (atual && atual.sincronizado !== 1) {
        ignorados++;
        continue;
      }
      const categoriaId = await idPorUuid("categoria", p.categoriaUuid);
      if (categoriaId === null) {
        ignorados++;
        continue;
      }
      const fornecedorId = await idPorUuid("fornecedor", p.fornecedorUuid);
      const valores = [
        p.nome,
        p.codigoBarras,
        categoriaId,
        fornecedorId,
        p.precoCusto,
        p.precoVenda,
        Math.max(0, p.estoqueAtual),
        p.estoqueMinimo,
        p.dataValidade,
        p.ativo ? 1 : 0,
        instante,
      ];
      try {
        if (atual) {
          await db.runAsync(
            `UPDATE produto
                SET nome = ?, codigo_barras = ?, categoria_id = ?, fornecedor_id = ?,
                    preco_custo = ?, preco_venda = ?, estoque_atual = ?, estoque_minimo = ?,
                    data_validade = ?, ativo = ?, sincronizado_em = ?,
                    atualizado_em = datetime('now'), sincronizado = 1
              WHERE id = ?`,
            [...valores, atual.id],
          );
        } else {
          await db.runAsync(
            `INSERT INTO produto
               (nome, codigo_barras, categoria_id, fornecedor_id, preco_custo, preco_venda,
                estoque_atual, estoque_minimo, data_validade, ativo, sincronizado_em,
                uuid, loja_id, sincronizado)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)`,
            [...valores, p.uuid.toLowerCase(), LOJA],
          );
        }
        recebidos++;
      } catch {
        ignorados++;
      }
    }

    for (const m of a.movimentacoes) {
      // já está aqui: saiu deste aparelho ou veio num download anterior
      if (await local("movimentacao", m.uuid)) continue;
      const produtoId = await idPorUuid("produto", m.produtoUuid);
      const usuarioId = await idPorUuid("usuario", m.usuarioUuid);
      if (produtoId === null || usuarioId === null) {
        ignorados++;
        continue;
      }
      try {
        await db.runAsync(
          `INSERT INTO movimentacao
             (uuid, produto_id, usuario_id, tipo, quantidade, saldo_apos, data_hora,
              observacoes, sincronizado, sincronizado_em)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1, ?)`,
          [
            m.uuid.toLowerCase(),
            produtoId,
            usuarioId,
            m.tipo,
            m.quantidade,
            Math.max(0, m.saldoApos),
            paraSqlite(m.dataHora),
            m.observacoes,
            instante,
          ],
        );
        recebidos++;
      } catch {
        ignorados++;
      }
    }

    for (const alerta of a.alertas) {
      if (alerta.tipoAlerta !== "DIVERGENCIA") continue;
      const uuid = alerta.produtoUuid.toLowerCase();
      const doServidor = a.produtos.find((p) => p.uuid.toLowerCase() === uuid);
      divergencias.push({
        produtoUuid: uuid,
        produto: await nomeDoProduto(uuid),
        saldo: doServidor ? doServidor.estoqueAtual : null,
      });
    }
  });

  return { recebidos, ignorados, divergencias };
}

export async function nomeDoProduto(uuid: string): Promise<string> {
  const db = await obterBanco();
  const l = await db.getFirstAsync<{ nome: string }>(
    "SELECT nome FROM produto WHERE uuid = ?",
    [uuid.toLowerCase()],
  );
  return l?.nome ?? "Produto";
}

// ---- estado da sincronização ----

export interface EstadoGuardado {
  lojaUuid: string | null;
  corte: string | null;
  ultimoEm: string | null;
  ultimoResultado: ResultadoGuardado | null;
}

export async function lerEstado(): Promise<EstadoGuardado> {
  const db = await obterBanco();
  const l = await db.getFirstAsync<{
    loja_uuid: string | null;
    corte: string | null;
    ultimo_resultado: string | null;
    ultimo_em: string | null;
  }>("SELECT loja_uuid, corte, ultimo_resultado, ultimo_em FROM sincronizacao WHERE id = 1");
  let ultimoResultado: ResultadoGuardado | null = null;
  try {
    ultimoResultado = l?.ultimo_resultado ? (JSON.parse(l.ultimo_resultado) as ResultadoGuardado) : null;
  } catch {
    ultimoResultado = null;
  }
  return {
    lojaUuid: l?.loja_uuid ?? null,
    corte: l?.corte ?? null,
    ultimoEm: l?.ultimo_em ?? null,
    ultimoResultado,
  };
}

export async function gravarCorte(corte: string): Promise<void> {
  const db = await obterBanco();
  await db.runAsync("UPDATE sincronizacao SET corte = ? WHERE id = 1", [corte]);
}

export async function gravarResultado(r: ResultadoGuardado, quando: string): Promise<void> {
  const db = await obterBanco();
  await db.runAsync("UPDATE sincronizacao SET ultimo_resultado = ?, ultimo_em = ? WHERE id = 1", [
    JSON.stringify(r),
    quando,
  ]);
}

/** Liga a loja do aparelho à do servidor: os dois passam a ter o mesmo uuid. */
export async function vincularLoja(uuid: string, nome: string): Promise<void> {
  const db = await obterBanco();
  await db.runAsync("UPDATE sincronizacao SET loja_uuid = ? WHERE id = 1", [uuid.toLowerCase()]);
  await db.runAsync("UPDATE loja SET uuid = ?, nome = ? WHERE id = ?", [uuid.toLowerCase(), nome, LOJA]);
}
