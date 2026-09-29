import React, { useCallback, useState } from "react";
import { RefreshControl, ScrollView, StyleSheet, Text, View } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { Cartao, Carregando } from "../components/base";
import { ResumoEstoque } from "../domain/tipos";
import * as produtoRepo from "../repositories/produtoRepository";
import { sessaoAtual } from "../services/authService";
import { formatarReais, podeVerFinanceiro } from "../services/regras";
import { pendentesDeSincronizacao } from "../services/estoqueService";
import { cores, espaco, fonte, raio } from "../theme/tema";

export default function PainelScreen() {
  const [resumo, setResumo] = useState<ResumoEstoque | null>(null);
  const [ranking, setRanking] = useState<{ nome: string; total: number }[]>([]);
  const [pendentes, setPendentes] = useState(0);
  const [atualizando, setAtualizando] = useState(false);

  const usuario = sessaoAtual();
  const verFinanceiro = podeVerFinanceiro(usuario?.tipoPerfil ?? "OPERADOR");

  const carregar = useCallback(async () => {
    const [r, m, p] = await Promise.all([
      produtoRepo.resumo(),
      produtoRepo.maisVendidos(5),
      pendentesDeSincronizacao(),
    ]);
    setResumo(r);
    setRanking(m);
    setPendentes(p);
  }, []);

  // Recarrega ao voltar para a aba: uma movimentação em outra tela muda
  // esses números.
  useFocusEffect(
    useCallback(() => {
      carregar();
    }, [carregar]),
  );

  if (!resumo) return <Carregando texto="Carregando o resumo do estoque..." />;

  const maior = ranking.length > 0 ? ranking[0].total : 1;

  return (
    <ScrollView
      style={e.tela}
      contentContainerStyle={{ padding: espaco.md }}
      refreshControl={
        <RefreshControl
          refreshing={atualizando}
          onRefresh={async () => {
            setAtualizando(true);
            await carregar();
            setAtualizando(false);
          }}
        />
      }
    >
      <Text style={e.saudacao}>Olá, {usuario?.nome.split(" ")[0] ?? "usuário"}</Text>
      <Text style={e.perfil}>
        {usuario?.tipoPerfil === "PROPRIETARIO" ? "Proprietário" : "Operador"}
      </Text>

      {/* Requisito R10: a situação de conectividade é informada ao usuário */}
      {pendentes > 0 && (
        <View style={e.faixaPendente}>
          <Text style={e.faixaTexto}>
            {pendentes} registro(s) aguardando envio ao servidor. Os dados estão
            salvos neste aparelho.
          </Text>
        </View>
      )}

      <View style={e.grade}>
        <Indicador valor={String(resumo.totalProdutos)} rotulo="produtos cadastrados" />

        {/* RN01: valor do estoque é informação financeira, restrita ao
            proprietário. Quem decide é a camada de negócio. */}
        {verFinanceiro && (
          <Indicador
            valor={formatarReais(resumo.valorTotalEstoque)}
            rotulo="valor em estoque"
          />
        )}

        <Indicador
          valor={String(resumo.produtosCriticos)}
          rotulo="produtos críticos"
          cor={resumo.produtosCriticos > 0 ? cores.perigo : undefined}
        />
        <Indicador
          valor={String(resumo.produtosVencendo)}
          rotulo="próximos ao vencimento"
          cor={resumo.produtosVencendo > 0 ? cores.aviso : undefined}
        />
      </View>

      <Text style={e.secao}>Produtos mais vendidos</Text>
      <Cartao>
        {ranking.length === 0 ? (
          <Text style={e.vazio}>
            Nenhuma venda registrada ainda. Registre uma saída do tipo Venda
            para o ranking aparecer.
          </Text>
        ) : (
          ranking.map((item) => (
            <View key={item.nome} style={e.barraLinha}>
              <Text style={e.barraRotulo} numberOfLines={1}>
                {item.nome}
              </Text>
              <View style={e.barraTrilha}>
                <View
                  style={[
                    e.barra,
                    { width: `${Math.max(12, (item.total / maior) * 100)}%` },
                  ]}
                >
                  <Text style={e.barraValor}>{item.total} un</Text>
                </View>
              </View>
            </View>
          ))
        )}
      </Cartao>
    </ScrollView>
  );
}

function Indicador({
  valor,
  rotulo,
  cor,
}: {
  valor: string;
  rotulo: string;
  cor?: string;
}) {
  return (
    <View style={e.indicador} accessible accessibilityLabel={`${valor} ${rotulo}`}>
      <Text style={[e.indicadorValor, !!cor && { color: cor }]}>{valor}</Text>
      <Text style={e.indicadorRotulo}>{rotulo}</Text>
    </View>
  );
}

const e = StyleSheet.create({
  tela: { flex: 1, backgroundColor: cores.cinza100 },
  saudacao: { fontSize: fonte.tituloMedio, fontWeight: "700", color: cores.cinza900 },
  perfil: { fontSize: fonte.legenda, color: cores.cinza600, marginBottom: espaco.md },
  faixaPendente: {
    backgroundColor: cores.avisoClaro,
    borderLeftWidth: 4,
    borderLeftColor: cores.aviso,
    padding: espaco.md,
    borderRadius: raio.md,
    marginBottom: espaco.md,
  },
  faixaTexto: { fontSize: fonte.legenda, color: "#BF360C" },
  grade: { flexDirection: "row", flexWrap: "wrap", gap: espaco.md },
  indicador: {
    flexGrow: 1,
    flexBasis: "45%",
    backgroundColor: cores.branco,
    borderRadius: raio.md,
    padding: espaco.md,
    borderWidth: 1,
    borderColor: cores.cinza200,
  },
  indicadorValor: { fontSize: 26, fontWeight: "700", color: cores.cinza900 },
  indicadorRotulo: { fontSize: fonte.legenda, color: cores.cinza600, marginTop: espaco.xs },
  secao: {
    fontSize: fonte.tituloMedio,
    fontWeight: "700",
    color: cores.cinza900,
    marginTop: espaco.lg,
    marginBottom: espaco.md,
  },
  vazio: { fontSize: fonte.corpo, color: cores.cinza600 },
  barraLinha: { flexDirection: "row", alignItems: "center", marginBottom: espaco.sm },
  barraRotulo: { width: 110, fontSize: fonte.legenda, color: cores.cinza700 },
  barraTrilha: { flex: 1 },
  barra: {
    height: 24,
    backgroundColor: cores.primaria,
    borderRadius: raio.sm,
    justifyContent: "center",
    alignItems: "flex-end",
    paddingHorizontal: espaco.sm,
  },
  barraValor: { color: cores.branco, fontSize: fonte.legenda, fontWeight: "700" },
});
