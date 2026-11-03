// Relatórios: mais vendidos, baixo giro e evolução do estoque no período.

import { useCallback, useState } from "react";
import { ScrollView, Share, StyleSheet, Text, View } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import {
  Aviso,
  Botao,
  Cartao,
  Carregando,
  Chip,
  ListaVazia,
  Miniatura,
  Segmentado,
  Selo,
  TituloSecao,
} from "../components/base";
import { ROTULO_TIPO } from "../domain/tipos";
import {
  montarRelatorio,
  type PontoRelatorio,
  type Relatorio,
} from "../services/relatorioService";
import {
  ehEntrada,
  formatarDataHora,
  formatarPercentual,
  formatarReais,
} from "../services/regras";
import { cores, espaco, fonte, raio } from "../theme/tema";

type Aba = "vendidos" | "giro" | "evolucao";
const PERIODOS = [7, 30, 90] as const;

export default function RelatoriosScreen() {
  const [aba, setAba] = useState<Aba>("vendidos");
  const [dias, setDias] = useState<number>(30);
  const [dados, setDados] = useState<Relatorio | null>(null);
  const [erro, setErro] = useState<string | null>(null);

  const carregar = useCallback(async (periodo: number) => {
    try {
      setErro(null);
      setDados(await montarRelatorio(periodo));
    } catch {
      setErro("Não foi possível montar o relatório. Tente novamente.");
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      carregar(dias);
    }, [carregar, dias]),
  );

  if (!dados) {
    if (!erro) return <Carregando texto="Montando o relatório..." />;
    return (
      <View style={[e.tela, e.conteudo]}>
        <Aviso tipo="erro" texto={erro} />
        <Botao titulo="Tentar novamente" onPress={() => carregar(dias)} />
      </View>
    );
  }

  // RN01: para o operador o valor em reais já chega nulo do serviço, e a
  // evolução é mostrada em unidades
  const emReais = dados.serie.length > 0 && dados.serie[0].valor !== null;
  const valorDoPonto = (p: PontoRelatorio) => p.valor ?? p.unidades;
  const formatarPonto = (p: PontoRelatorio) =>
    p.valor !== null ? formatarReais(p.valor) : `${p.unidades} un`;

  async function compartilhar() {
    if (!dados) return;
    const linhas = [`StockEasy — relatório dos últimos ${dias} dias`, ""];
    linhas.push("Mais vendidos:");
    if (dados.ranking.length === 0) linhas.push("  nenhuma venda no período");
    dados.ranking.forEach((r, i) =>
      linhas.push(`  ${i + 1}. ${r.nome} — ${r.total} un`),
    );
    linhas.push("", "Baixo giro (sem venda no período):");
    if (dados.giro.length === 0) linhas.push("  nenhum produto parado");
    dados.giro.forEach((g) =>
      linhas.push(`  ${g.nome} — ${g.estoqueAtual} un, ${g.diasParado} dias parado`),
    );
    const atual = dados.serie[dados.serie.length - 1];
    if (atual) {
      linhas.push("", `Estoque hoje: ${formatarPonto(atual)}`);
    }
    // folha de compartilhamento nativa do Android: WhatsApp, e-mail etc.
    try {
      await Share.share({ message: linhas.join("\n") });
    } catch {
      setErro("Não foi possível abrir o compartilhamento.");
    }
  }

  return (
    <ScrollView style={e.tela} contentContainerStyle={e.conteudo}>
      {!!erro && <Aviso tipo="erro" texto={erro} />}

      <Segmentado
        opcoes={[
          { valor: "vendidos", rotulo: "Mais vendidos" },
          { valor: "giro", rotulo: "Baixo giro" },
          { valor: "evolucao", rotulo: "Evolução" },
        ]}
        valor={aba}
        onChange={setAba}
      />

      <View style={e.periodos} accessibilityRole="radiogroup" accessibilityLabel="Período">
        {PERIODOS.map((p) => (
          <Chip
            key={p}
            rotulo={`${p} dias`}
            ativo={dias === p}
            onPress={() => setDias(p)}
          />
        ))}
      </View>

      {aba === "vendidos" &&
        (dados.ranking.length === 0 ? (
          <ListaVazia
            icone="trending-up-outline"
            texto={`Nenhuma venda nos últimos ${dias} dias. Registre uma saída do tipo Venda para o ranking aparecer.`}
          />
        ) : (
          dados.ranking.map((r, i) => (
            <Cartao key={r.produtoId} estilo={e.item}>
              <Miniatura texto={r.nome} />
              <View style={{ flex: 1 }}>
                <Text style={e.itemNome}>{r.nome}</Text>
                <Text style={e.itemMeta}>{r.total} un. vendidas</Text>
              </View>
              <Selo
                texto={`#${i + 1}`}
                fundo={cores.sucessoTexto}
                rotuloAcessivel={`${i + 1}º lugar`}
              />
            </Cartao>
          ))
        ))}

      {aba === "giro" &&
        (dados.giro.length === 0 ? (
          <ListaVazia
            icone="checkmark-circle-outline"
            texto={`Nenhum produto com estoque está parado há mais de ${dias} dias.`}
          />
        ) : (
          <>
            {dados.giro.map((g) => (
              <Cartao key={g.produtoId} estilo={e.item}>
                <Miniatura texto={g.nome} />
                <View style={{ flex: 1 }}>
                  <Text style={e.itemNome}>{g.nome}</Text>
                  <Text style={e.itemMeta}>Estoque: {g.estoqueAtual} un</Text>
                </View>
                <Text style={e.parado}>{g.diasParado} dias{"\n"}parado</Text>
              </Cartao>
            ))}
            <Text style={e.dica}>
              Produto parado é dinheiro imobilizado. Considere promoção ou
              reduzir a próxima reposição.
            </Text>
          </>
        ))}

      {aba === "evolucao" && (
        <>
          {dados.serie.length > 0 && (
            <View style={e.destaque}>
              <Text style={e.destaqueRotulo}>
                {emReais ? "Valor do estoque hoje" : "Unidades em estoque hoje"}
              </Text>
              <Text style={e.destaqueValor}>
                {formatarPonto(dados.serie[dados.serie.length - 1])}
              </Text>
              <Text style={e.destaqueRotulo}>
                {variacao(dados.serie.map(valorDoPonto), dias)}
              </Text>
            </View>
          )}

          <Cartao>
            <TituloSecao texto="Evolução do estoque" />
            <Grafico pontos={dados.serie} valor={valorDoPonto} formatar={formatarPonto} />
          </Cartao>

          <Cartao>
            <TituloSecao texto="Últimas movimentações" />
            {dados.historico.length === 0 ? (
              <Text style={e.itemMeta}>Nenhuma movimentação registrada.</Text>
            ) : (
              dados.historico.map((m, i) => {
                const entrada = ehEntrada(m.tipo);
                return (
                  <View
                    key={m.id}
                    style={[e.mov, i === dados.historico.length - 1 && { borderBottomWidth: 0 }]}
                  >
                    <View style={{ flex: 1 }}>
                      <Text style={e.movTipo}>
                        {entrada ? "Entrada" : "Saída"} · {ROTULO_TIPO[m.tipo]}
                      </Text>
                      <Text style={e.itemMeta} numberOfLines={1}>
                        {m.produtoNome} · {formatarDataHora(m.dataHora)}
                      </Text>
                    </View>
                    <Text
                      style={[
                        e.movQtd,
                        { color: entrada ? cores.sucessoTexto : cores.perigo },
                      ]}
                    >
                      {entrada ? "+" : "−"}
                      {m.quantidade}
                    </Text>
                  </View>
                );
              })
            )}
          </Cartao>
        </>
      )}

      <Botao
        titulo="Compartilhar relatório"
        variante="contorno"
        icone="share-social-outline"
        onPress={compartilhar}
        estilo={{ marginTop: espaco.sm }}
      />
    </ScrollView>
  );
}

function variacao(valores: number[], dias: number): string {
  const inicio = valores[0] ?? 0;
  const fim = valores[valores.length - 1] ?? 0;
  if (inicio === 0) return `nos últimos ${dias} dias`;
  const pct = ((fim - inicio) / inicio) * 100;
  const seta = pct > 0 ? "▲" : pct < 0 ? "▼" : "=";
  return `${seta} ${formatarPercentual(Math.abs(pct))} em ${dias} dias`;
}

// Barras em View, sem biblioteca de gráfico. A descrição acessível lê os
// valores, porque o leitor de tela não enxerga a altura das barras.
function Grafico({
  pontos,
  valor,
  formatar,
}: {
  pontos: PontoRelatorio[];
  valor: (p: PontoRelatorio) => number;
  formatar: (p: PontoRelatorio) => string;
}) {
  const maximo = Math.max(1, ...pontos.map(valor));
  const descricao = pontos
    .map((p) => `${p.diasAtras === 0 ? "hoje" : `há ${p.diasAtras} dias`}: ${formatar(p)}`)
    .join("; ");

  return (
    <View accessible accessibilityLabel={`Evolução do estoque. ${descricao}`}>
      <View style={e.grafico}>
        {pontos.map((p) => (
          <View key={p.diasAtras} style={e.colunaGrafico}>
            <View
              style={[
                e.barraGrafico,
                { height: `${Math.max(4, (valor(p) / maximo) * 100)}%` },
              ]}
            />
          </View>
        ))}
      </View>
      <View style={e.eixo}>
        {pontos.map((p) => (
          <Text key={p.diasAtras} style={e.eixoTexto}>
            {p.diasAtras === 0 ? "hoje" : `-${p.diasAtras}d`}
          </Text>
        ))}
      </View>
    </View>
  );
}

const e = StyleSheet.create({
  tela: { flex: 1, backgroundColor: cores.fundo },
  conteudo: { padding: espaco.md, paddingTop: espaco.xs, paddingBottom: espaco.xl },
  periodos: { flexDirection: "row", gap: espaco.sm, marginBottom: espaco.md },
  item: { flexDirection: "row", alignItems: "center", gap: espaco.md - 4 },
  itemNome: { fontSize: fonte.corpo, fontWeight: "700", color: cores.texto },
  itemMeta: { fontSize: fonte.legenda, color: cores.textoSuave, marginTop: 2 },
  parado: {
    fontSize: fonte.legenda,
    color: cores.perigoTexto,
    fontWeight: "700",
    textAlign: "right",
  },
  dica: { fontSize: fonte.legenda, color: cores.textoSuave, marginVertical: espaco.sm },
  destaque: {
    backgroundColor: cores.primaria,
    borderRadius: raio.padrao,
    padding: espaco.lg,
    marginBottom: espaco.sm,
  },
  destaqueRotulo: { color: cores.sobrePrimaria, fontSize: fonte.legenda },
  destaqueValor: {
    color: cores.sobrePrimaria,
    fontSize: fonte.destaque,
    fontWeight: "800",
    marginVertical: 2,
  },
  grafico: {
    height: 120,
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 6,
    backgroundColor: cores.primariaSuave,
    borderRadius: raio.padrao,
    padding: espaco.sm,
  },
  colunaGrafico: { flex: 1, height: "100%", justifyContent: "flex-end" },
  barraGrafico: {
    backgroundColor: cores.primaria,
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
  },
  eixo: { flexDirection: "row", gap: 6, paddingHorizontal: espaco.sm, marginTop: 4 },
  eixoTexto: {
    flex: 1,
    textAlign: "center",
    fontSize: fonte.badge,
    color: cores.textoSuave,
  },
  mov: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: espaco.sm,
    borderBottomWidth: 1,
    borderBottomColor: cores.borda,
  },
  movTipo: { fontSize: fonte.corpo - 1, fontWeight: "600", color: cores.texto },
  movQtd: { fontSize: fonte.corpo, fontWeight: "800", marginLeft: espaco.sm },
});
