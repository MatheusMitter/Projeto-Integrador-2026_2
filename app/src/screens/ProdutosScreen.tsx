import React, { useCallback, useState } from "react";
import { FlatList, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { Botao, Carregando, EtiquetaSituacao, ListaVazia } from "../components/base";
import { Produto } from "../domain/tipos";
import * as produtoRepo from "../repositories/produtoRepository";
import { sessaoAtual } from "../services/authService";
import { classificarEstoque, formatarReais, podeVerFinanceiro } from "../services/regras";
import { ALVO_TOQUE, cores, espaco, fonte, raio } from "../theme/tema";

interface Props {
  navigation: { navigate: (tela: string, params?: object) => void };
}

export default function ProdutosScreen({ navigation }: Props) {
  const [produtos, setProdutos] = useState<Produto[] | null>(null);
  const [termo, setTermo] = useState("");

  const verFinanceiro = podeVerFinanceiro(sessaoAtual()?.tipoPerfil ?? "OPERADOR");

  const carregar = useCallback(async (busca: string) => {
    setProdutos(await produtoRepo.listar(busca));
  }, []);

  useFocusEffect(
    useCallback(() => {
      carregar(termo);
    }, [carregar, termo]),
  );

  if (!produtos) return <Carregando texto="Carregando produtos..." />;

  return (
    <View style={e.tela}>
      <View style={e.barraBusca}>
        <TextInput
          value={termo}
          onChangeText={(t) => {
            setTermo(t);
            carregar(t);
          }}
          placeholder="Buscar por nome ou código..."
          placeholderTextColor={cores.cinza600}
          accessibilityLabel="Buscar produto por nome ou código de barras"
          style={e.campoBusca}
        />
      </View>

      <FlatList
        data={produtos}
        keyExtractor={(p) => String(p.id)}
        contentContainerStyle={{ padding: espaco.md, paddingBottom: 96 }}
        ListEmptyComponent={
          <ListaVazia
            texto={
              termo.length > 0
                ? `Nenhum produto encontrado para "${termo}".`
                : "Nenhum produto cadastrado ainda."
            }
            acao={
              termo.length === 0
                ? {
                    titulo: "Cadastrar primeiro produto",
                    onPress: () => navigation.navigate("ProdutoForm", {}),
                  }
                : undefined
            }
          />
        }
        renderItem={({ item }) => {
          const situacao = classificarEstoque(item.estoqueAtual, item.estoqueMinimo);
          return (
            <Pressable
              onPress={() => navigation.navigate("ProdutoDetalhes", { id: item.id })}
              accessibilityRole="button"
              accessibilityLabel={
                `${item.nome}. ${item.estoqueAtual} unidades. ` +
                `Mínimo ${item.estoqueMinimo}.`
              }
              style={({ pressed }) => [e.item, pressed && { opacity: 0.7 }]}
            >
              <View style={e.itemInfo}>
                <Text style={e.itemNome}>{item.nome}</Text>
                <Text style={e.itemMeta}>
                  {item.categoriaNome}
                  {item.codigoBarras ? ` · ${item.codigoBarras}` : ""}
                </Text>
                <View style={{ marginTop: espaco.xs }}>
                  <EtiquetaSituacao situacao={situacao} />
                </View>
              </View>
              <View style={e.itemNumeros}>
                <Text style={e.itemQtd}>{item.estoqueAtual}</Text>
                <Text style={e.itemMeta}>mín. {item.estoqueMinimo}</Text>
                {verFinanceiro && (
                  <Text style={e.itemPreco}>{formatarReais(item.precoVenda)}</Text>
                )}
              </View>
            </Pressable>
          );
        }}
      />

      <View style={e.rodape}>
        <Botao
          titulo="Cadastrar produto"
          onPress={() => navigation.navigate("ProdutoForm", {})}
        />
      </View>
    </View>
  );
}

const e = StyleSheet.create({
  tela: { flex: 1, backgroundColor: cores.cinza100 },
  barraBusca: {
    padding: espaco.md,
    backgroundColor: cores.branco,
    borderBottomWidth: 1,
    borderBottomColor: cores.cinza200,
  },
  campoBusca: {
    minHeight: ALVO_TOQUE,
    borderWidth: 1,
    borderColor: cores.cinza300,
    borderRadius: raio.completo,
    paddingHorizontal: espaco.md,
    fontSize: fonte.corpo,
    color: cores.cinza900,
  },
  item: {
    flexDirection: "row",
    backgroundColor: cores.branco,
    borderRadius: raio.md,
    padding: espaco.md,
    marginBottom: espaco.sm,
    borderWidth: 1,
    borderColor: cores.cinza200,
    minHeight: ALVO_TOQUE,
  },
  itemInfo: { flex: 1 },
  itemNome: { fontSize: fonte.corpo, fontWeight: "600", color: cores.cinza900 },
  itemMeta: { fontSize: fonte.legenda, color: cores.cinza600 },
  itemNumeros: { alignItems: "flex-end", marginLeft: espaco.md },
  itemQtd: { fontSize: fonte.tituloMedio, fontWeight: "700", color: cores.cinza900 },
  itemPreco: { fontSize: fonte.legenda, color: cores.cinza600, marginTop: espaco.xs },
  rodape: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: espaco.md,
    backgroundColor: cores.branco,
    borderTopWidth: 1,
    borderTopColor: cores.cinza200,
  },
});
