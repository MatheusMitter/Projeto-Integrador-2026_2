import React, { useCallback, useState } from "react";
import { Alert, ScrollView, StyleSheet, Text, View } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { Botao, Cartao, Carregando, EtiquetaSituacao } from "../components/base";
import { Movimentacao, Produto, ROTULO_TIPO } from "../domain/tipos";
import * as produtoRepo from "../repositories/produtoRepository";
import { sessaoAtual } from "../services/authService";
import { ehEntrada, historicoDoProduto } from "../services/estoqueService";
import {
  calcularMargem,
  classificarEstoque,
  formatarReais,
  podeVerFinanceiro,
} from "../services/regras";
import { cores, espaco, fonte, raio } from "../theme/tema";

interface Props {
  route: { params: { id: number } };
  navigation: {
    navigate: (tela: string, params?: object) => void;
    goBack: () => void;
  };
}

export default function ProdutoDetalhesScreen({ route, navigation }: Props) {
  const { id } = route.params;
  const [produto, setProduto] = useState<Produto | null>(null);
  const [historico, setHistorico] = useState<Movimentacao[]>([]);

  const verFinanceiro = podeVerFinanceiro(sessaoAtual()?.tipoPerfil ?? "OPERADOR");

  const carregar = useCallback(async () => {
    const [p, h] = await Promise.all([
      produtoRepo.buscarPorId(id),
      historicoDoProduto(id, 10),
    ]);
    setProduto(p);
    setHistorico(h);
  }, [id]);

  useFocusEffect(
    useCallback(() => {
      carregar();
    }, [carregar]),
  );

  if (!produto) return <Carregando />;

  const situacao = classificarEstoque(produto.estoqueAtual, produto.estoqueMinimo);
  const margem = calcularMargem(produto.precoCusto, produto.precoVenda);

  /** RN12 — desativa em vez de excluir, preservando o histórico. */
  function confirmarDesativacao() {
    Alert.alert(
      "Desativar produto",
      `Desativar ${produto?.nome}?\n\nEle deixa de aparecer nas listagens, ` +
        `mas o histórico de movimentações é preservado para auditoria.`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Desativar",
          style: "destructive",
          onPress: async () => {
            await produtoRepo.desativar(id);
            navigation.goBack();
          },
        },
      ],
    );
  }

  return (
    <ScrollView style={e.tela} contentContainerStyle={{ padding: espaco.md }}>
      <Text style={e.nome}>{produto.nome}</Text>
      <Text style={e.meta}>
        {produto.categoriaNome}
        {produto.codigoBarras ? ` · ${produto.codigoBarras}` : ""}
      </Text>
      <View style={{ marginVertical: espaco.md }}>
        <EtiquetaSituacao situacao={situacao} />
      </View>

      <Cartao>
        <Text style={e.secao}>Estoque</Text>
        <View style={e.linha}>
          <Text style={e.chave}>Quantidade atual</Text>
          <Text style={e.valorDestaque}>{produto.estoqueAtual} un</Text>
        </View>
        <View style={e.linha}>
          <Text style={e.chave}>Estoque mínimo</Text>
          <Text style={e.valor}>{produto.estoqueMinimo} un</Text>
        </View>
      </Cartao>

      {/* RN01: bloco financeiro oculto para o perfil Operador */}
      {verFinanceiro && (
        <Cartao>
          <Text style={e.secao}>Precificação</Text>
          <View style={e.linha}>
            <Text style={e.chave}>Preço de custo</Text>
            <Text style={e.valor}>{formatarReais(produto.precoCusto)}</Text>
          </View>
          <View style={e.linha}>
            <Text style={e.chave}>Preço de venda</Text>
            <Text style={e.valor}>{formatarReais(produto.precoVenda)}</Text>
          </View>
          {margem && (
            <View style={[e.linha, e.linhaTotal]}>
              <Text style={e.chaveDestaque}>Margem de lucro</Text>
              <Text style={e.chaveDestaque}>
                {formatarReais(margem.valor)} ({margem.percentual.toFixed(1)}%)
              </Text>
            </View>
          )}
        </Cartao>
      )}

      {!!produto.fornecedorNome && (
        <Cartao>
          <Text style={e.secao}>Fornecedor</Text>
          <Text style={e.valor}>{produto.fornecedorNome}</Text>
        </Cartao>
      )}

      <Text style={e.secaoFora}>Últimas movimentações</Text>
      {historico.length === 0 ? (
        <Cartao>
          <Text style={e.chave}>Nenhuma movimentação registrada.</Text>
        </Cartao>
      ) : (
        historico.map((m) => {
          const entrada = ehEntrada(m.tipo);
          return (
            <Cartao key={m.id} estilo={{ marginBottom: espaco.sm }}>
              <View style={e.linha}>
                <View style={{ flex: 1 }}>
                  {/* o tipo é indicado por texto, não só por cor */}
                  <Text style={e.movTipo}>
                    {entrada ? "ENTRADA" : "SAÍDA"} · {ROTULO_TIPO[m.tipo]}
                  </Text>
                  <Text style={e.chave}>
                    {m.dataHora} · por {m.usuarioNome}
                  </Text>
                </View>
                <View style={{ alignItems: "flex-end" }}>
                  <Text
                    style={[
                      e.movQtd,
                      { color: entrada ? cores.primariaEscura : cores.perigo },
                    ]}
                  >
                    {entrada ? "+" : "-"}
                    {m.quantidade} un
                  </Text>
                  <Text style={e.chave}>saldo {m.saldoApos}</Text>
                </View>
              </View>
            </Cartao>
          );
        })
      )}

      <View style={{ marginTop: espaco.lg }}>
        <Botao
          titulo="Registrar entrada"
          onPress={() =>
            navigation.navigate("Movimentação", { produtoId: id, entrada: true })
          }
        />
        <Botao
          titulo="Registrar saída"
          variante="perigo"
          onPress={() =>
            navigation.navigate("Movimentação", { produtoId: id, entrada: false })
          }
        />
        <Botao
          titulo="Editar produto"
          variante="secundario"
          onPress={() => navigation.navigate("ProdutoForm", { id })}
        />
        {verFinanceiro && (
          <Botao
            titulo="Desativar produto"
            variante="secundario"
            onPress={confirmarDesativacao}
          />
        )}
      </View>
    </ScrollView>
  );
}

const e = StyleSheet.create({
  tela: { flex: 1, backgroundColor: cores.cinza100 },
  nome: { fontSize: fonte.tituloGrande, fontWeight: "700", color: cores.cinza900 },
  meta: { fontSize: fonte.legenda, color: cores.cinza600, marginTop: espaco.xs },
  secao: { fontSize: fonte.corpo, fontWeight: "700", color: cores.cinza900, marginBottom: espaco.sm },
  secaoFora: {
    fontSize: fonte.tituloMedio,
    fontWeight: "700",
    color: cores.cinza900,
    marginTop: espaco.md,
    marginBottom: espaco.md,
  },
  linha: { flexDirection: "row", justifyContent: "space-between", marginBottom: espaco.xs },
  linhaTotal: {
    borderTopWidth: 1,
    borderTopColor: cores.cinza300,
    paddingTop: espaco.sm,
    marginTop: espaco.xs,
  },
  chave: { fontSize: fonte.legenda, color: cores.cinza600 },
  chaveDestaque: { fontSize: fonte.corpo, fontWeight: "700", color: cores.primariaEscura },
  valor: { fontSize: fonte.corpo, color: cores.cinza900, fontWeight: "600" },
  valorDestaque: { fontSize: fonte.tituloMedio, fontWeight: "700", color: cores.cinza900 },
  movTipo: { fontSize: fonte.legenda, fontWeight: "700", color: cores.cinza800 },
  movQtd: { fontSize: fonte.corpo, fontWeight: "700" },
});
