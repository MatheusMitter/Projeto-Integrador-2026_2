import { useCallback, useEffect, useMemo, useState } from "react";
import { FlatList, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import {
  Aviso,
  Botao,
  BotaoFlutuante,
  CampoBusca,
  Carregando,
  Chip,
  EtiquetaSituacao,
  ListaVazia,
  Miniatura,
  Selo,
} from "../components/base";
import type { ProdutoVisivel } from "../domain/tipos";
import type { FiltroProdutos, TelaProdutos } from "../navigation/rotas";
import { listarProdutos } from "../services/produtoService";
import {
  classificarEstoque,
  diasParaVencer,
  estaVencendo,
} from "../services/regras";
import { ALVO_TOQUE, cores, espaco, fonte, raio } from "../theme/tema";

const FILTROS: { valor: FiltroProdutos; rotulo: string }[] = [
  { valor: "TODOS", rotulo: "Todos" },
  { valor: "CRITICO", rotulo: "Crítico" },
  { valor: "BAIXO", rotulo: "Baixo" },
  { valor: "VENCENDO", rotulo: "Vencendo" },
];

function passaNoFiltro(p: ProdutoVisivel, filtro: FiltroProdutos): boolean {
  if (filtro === "TODOS") return true;
  if (filtro === "VENCENDO") return estaVencendo(p.dataValidade);
  return classificarEstoque(p.estoqueAtual, p.estoqueMinimo) === filtro;
}

function textoValidade(dias: number): string {
  if (dias < 0) return `Venceu há ${-dias} dia${dias === -1 ? "" : "s"}`;
  if (dias === 0) return "Vence hoje";
  return `Vence em ${dias} dia${dias === 1 ? "" : "s"}`;
}

export default function ProdutosScreen({
  route,
  navigation,
}: TelaProdutos<"ProdutosLista">) {
  const [produtos, setProdutos] = useState<ProdutoVisivel[] | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [termo, setTermo] = useState("");
  const [filtro, setFiltro] = useState<FiltroProdutos>("TODOS");
  const [tentativa, setTentativa] = useState(0);

  // Recarrega ao focar a tela e a cada letra da busca. Se uma busca antiga
  // responder depois da atual, a resposta dela é descartada.
  useFocusEffect(
    useCallback(() => {
      let atual = true;
      listarProdutos(termo)
        .then((lista) => {
          if (!atual) return;
          setProdutos(lista);
          setErro(null);
        })
        .catch(() => {
          if (atual) setErro("Não foi possível carregar os produtos.");
        });
      return () => {
        atual = false;
      };
    }, [termo, tentativa]),
  );

  // filtro vindo dos cartões do painel; consumido e limpo, para a próxima
  // navegação com o mesmo filtro também ser percebida como mudança
  useEffect(() => {
    const vindo = route.params?.filtro;
    if (!vindo) return;
    setFiltro(vindo);
    navigation.setParams({ filtro: undefined });
  }, [route.params?.filtro, navigation]);

  const visiveis = useMemo(
    () => (produtos ?? []).filter((p) => passaNoFiltro(p, filtro)),
    [produtos, filtro],
  );

  const tentarDeNovo = () => setTentativa((t) => t + 1);

  if (!produtos) {
    if (!erro) return <Carregando texto="Carregando produtos..." />;
    return (
      <View style={[e.tela, { padding: espaco.md }]}>
        <Aviso tipo="erro" texto={erro} />
        <Botao titulo="Tentar novamente" onPress={tentarDeNovo} />
      </View>
    );
  }

  const novo = () => navigation.navigate("ProdutoForm");

  return (
    <View style={e.tela}>
      <View style={e.topo}>
        <CampoBusca
          valor={termo}
          onChangeText={setTermo}
          placeholder="Nome ou código de barras"
          rotuloAcessivel="Buscar produto por nome ou código de barras"
        />
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={e.filtros}
          accessibilityRole="radiogroup"
          accessibilityLabel="Filtrar por situação"
        >
          {FILTROS.map((f) => (
            <Chip
              key={f.valor}
              rotulo={f.rotulo}
              ativo={filtro === f.valor}
              onPress={() => setFiltro(f.valor)}
            />
          ))}
        </ScrollView>
        {!!erro && <Aviso tipo="erro" texto={erro} />}
      </View>

      <FlatList
        data={visiveis}
        keyExtractor={(p) => String(p.id)}
        contentContainerStyle={e.lista}
        ListEmptyComponent={
          <ListaVazia
            icone="cube-outline"
            texto={
              termo.length > 0
                ? `Nenhum produto encontrado para "${termo}".`
                : filtro !== "TODOS"
                  ? "Nenhum produto nesta situação."
                  : "Nenhum produto cadastrado ainda."
            }
            acao={
              termo.length === 0 && filtro === "TODOS"
                ? { titulo: "Cadastrar primeiro produto", onPress: novo }
                : undefined
            }
          />
        }
        renderItem={({ item }) => {
          const situacao = classificarEstoque(item.estoqueAtual, item.estoqueMinimo);
          const dias = diasParaVencer(item.dataValidade);
          const vencendo = estaVencendo(item.dataValidade);
          return (
            <Pressable
              onPress={() => navigation.navigate("ProdutoDetalhes", { id: item.id })}
              accessibilityRole="button"
              accessibilityLabel={
                `${item.nome}. ${item.estoqueAtual} unidades, mínimo ` +
                `${item.estoqueMinimo}.` +
                (vencendo && dias !== null ? ` ${textoValidade(dias)}.` : "")
              }
              style={({ pressed }) => [e.item, pressed && { opacity: 0.7 }]}
            >
              <Miniatura texto={item.nome} />
              <View style={e.itemInfo}>
                <Text style={e.itemNome} numberOfLines={1}>
                  {item.nome}
                </Text>
                <Text style={e.itemMeta}>
                  Estoque {item.estoqueAtual} · mín. {item.estoqueMinimo}
                </Text>
                {vencendo && dias !== null && (
                  <Text style={e.itemValidade}>{textoValidade(dias)}</Text>
                )}
              </View>
              <View style={e.itemSelos}>
                <EtiquetaSituacao situacao={situacao} />
                {vencendo && <Selo texto="Vence" fundo={cores.avisoTexto} />}
              </View>
            </Pressable>
          );
        }}
      />

      <BotaoFlutuante rotulo="Cadastrar produto" onPress={novo} />
    </View>
  );
}

const e = StyleSheet.create({
  tela: { flex: 1, backgroundColor: cores.fundo },
  topo: { paddingHorizontal: espaco.md, paddingBottom: espaco.xs },
  filtros: { gap: espaco.sm, paddingVertical: espaco.sm },
  lista: { paddingHorizontal: espaco.md, paddingBottom: 96 },
  item: {
    flexDirection: "row",
    alignItems: "center",
    gap: espaco.md - 4,
    backgroundColor: cores.superficie,
    borderRadius: raio.padrao,
    padding: espaco.md - 4,
    marginBottom: 6,
    borderWidth: 1,
    borderColor: cores.borda,
    minHeight: ALVO_TOQUE + 16,
  },
  itemInfo: { flex: 1 },
  itemNome: { fontSize: fonte.corpo, fontWeight: "700", color: cores.texto },
  itemMeta: { fontSize: fonte.legenda, color: cores.textoSuave, marginTop: 2 },
  itemValidade: {
    fontSize: fonte.legenda,
    color: cores.avisoTexto,
    fontWeight: "600",
    marginTop: 2,
  },
  itemSelos: { alignItems: "flex-end", gap: 4 },
});
