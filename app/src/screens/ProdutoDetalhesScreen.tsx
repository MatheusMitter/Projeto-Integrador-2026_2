import { useCallback, useState } from "react";
import { Alert, ScrollView, StyleSheet, Text, View } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import {
  Aviso,
  Botao,
  Cartao,
  Carregando,
  EtiquetaSituacao,
  TituloSecao,
} from "../components/base";
import { type Movimentacao, type ProdutoVisivel, ROTULO_TIPO } from "../domain/tipos";
import type { TelaProdutos } from "../navigation/rotas";
import { sessaoAtual } from "../services/authService";
import { historicoDoProduto } from "../services/estoqueService";
import { buscarProduto, desativarProduto } from "../services/produtoService";
import {
  calcularMargem,
  classificarEstoque,
  ehEntrada,
  formatarDataHora,
  formatarPercentual,
  formatarReais,
  paraDataBr,
  podeGerenciarCadastros,
} from "../services/regras";
import { cores, CORES_SITUACAO, espaco, fonte, raio } from "../theme/tema";

export default function ProdutoDetalhesScreen({
  route,
  navigation,
}: TelaProdutos<"ProdutoDetalhes">) {
  const { id } = route.params;
  // undefined enquanto carrega; null se o produto não existe mais
  const [produto, setProduto] = useState<ProdutoVisivel | null | undefined>(undefined);
  const [historico, setHistorico] = useState<Movimentacao[]>([]);
  const [erro, setErro] = useState<string | null>(null);

  const podeDesativar = podeGerenciarCadastros(
    sessaoAtual()?.tipoPerfil ?? "OPERADOR",
  );

  const carregar = useCallback(async () => {
    try {
      const [p, h] = await Promise.all([
        buscarProduto(id),
        historicoDoProduto(id, 10),
      ]);
      setProduto(p);
      setHistorico(h);
      setErro(null);
    } catch {
      setErro("Não foi possível carregar o produto.");
    }
  }, [id]);

  useFocusEffect(
    useCallback(() => {
      carregar();
    }, [carregar]),
  );

  if (produto === undefined) {
    if (!erro) return <Carregando />;
    return (
      <View style={[e.tela, e.conteudo]}>
        <Aviso tipo="erro" texto={erro} />
        <Botao titulo="Tentar novamente" onPress={carregar} />
      </View>
    );
  }

  if (produto === null) {
    return (
      <View style={[e.tela, e.conteudo]}>
        <Aviso
          tipo="info"
          texto="Produto não encontrado. Ele pode ter sido desativado."
        />
        <Botao titulo="Voltar" onPress={() => navigation.goBack()} />
      </View>
    );
  }

  const situacao = classificarEstoque(
    produto.estoqueAtual,
    produto.estoqueMinimo,
  );
  // RN01: para o operador o custo já chega nulo, e a precificação some
  const custo = produto.precoCusto;
  const margem = custo !== null ? calcularMargem(custo, produto.precoVenda) : null;

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
            const r = await desativarProduto(id);
            if (!r.sucesso) {
              Alert.alert("Não foi possível desativar", r.mensagem ?? "");
              return;
            }
            navigation.goBack();
          },
        },
      ],
    );
  }

  const corEstoque =
    situacao === "NORMAL" || situacao === "EXCESSO"
      ? cores.texto
      : situacao === "BAIXO"
        ? cores.aviso
        : CORES_SITUACAO.CRITICO.fundo;

  function movimentar(entrada: boolean) {
    navigation.navigate("Movimentar", { produtoId: id, entrada });
  }

  return (
    <ScrollView style={e.tela} contentContainerStyle={e.conteudo}>
      {!!erro && <Aviso tipo="erro" texto={erro} />}

      <Cartao estilo={e.cabecalho}>
        <View style={{ flex: 1 }}>
          <Text style={e.nome}>{produto.nome}</Text>
          <Text style={e.meta}>
            {produto.categoriaNome}
            {produto.fornecedorNome ? ` · ${produto.fornecedorNome}` : ""}
          </Text>
          {!!produto.codigoBarras && (
            <Text style={e.meta}>{produto.codigoBarras}</Text>
          )}
        </View>
        <EtiquetaSituacao situacao={situacao} />
      </Cartao>

      <View style={e.blocos}>
        <Bloco
          valor={String(produto.estoqueAtual)}
          rotulo="Estoque"
          cor={corEstoque}
        />
        <Bloco valor={String(produto.estoqueMinimo)} rotulo="Mínimo" />
        <Bloco
          valor={produto.precoVenda.toFixed(2).replace(".", ",")}
          rotulo="Venda R$"
        />
      </View>

      {!!produto.dataValidade && (
        <Cartao estilo={e.linhaCartao}>
          <Text style={e.chave}>Validade</Text>
          <Text style={e.valor}>{paraDataBr(produto.dataValidade)}</Text>
        </Cartao>
      )}

      {custo !== null && (
        <Cartao>
          <TituloSecao texto="Precificação" />
          <View style={e.linha}>
            <Text style={e.chave}>Preço de custo</Text>
            <Text style={e.valor}>{formatarReais(custo)}</Text>
          </View>
          <View style={e.linha}>
            <Text style={e.chave}>Preço de venda</Text>
            <Text style={e.valor}>{formatarReais(produto.precoVenda)}</Text>
          </View>
          {margem && (
            <View style={[e.linha, e.linhaTotal]}>
              <Text style={e.chaveDestaque}>Margem de lucro</Text>
              <Text style={e.chaveDestaque}>
                {formatarReais(margem.valor)} ({formatarPercentual(margem.percentual)})
              </Text>
            </View>
          )}
        </Cartao>
      )}

      <Cartao>
        <TituloSecao texto="Movimentações" />
        {historico.length === 0 ? (
          <Text style={e.chave}>Nenhuma movimentação registrada.</Text>
        ) : (
          historico.map((m, i) => {
            const entrada = ehEntrada(m.tipo);
            return (
              <View
                key={m.id}
                style={[e.mov, i === historico.length - 1 && { borderBottomWidth: 0 }]}
                accessible
                accessibilityLabel={
                  `${entrada ? "Entrada" : "Saída"}, ${ROTULO_TIPO[m.tipo]}, ` +
                  `${m.quantidade} unidades, ${formatarDataHora(m.dataHora)}, ` +
                  `por ${m.usuarioNome}. Saldo após: ${m.saldoApos}.`
                }
              >
                <View style={{ flex: 1 }}>
                  {/* o tipo é indicado por texto, não só por cor */}
                  <Text style={e.movTipo}>
                    {entrada ? "Entrada" : "Saída"} · {ROTULO_TIPO[m.tipo]}
                  </Text>
                  <Text style={e.chave}>
                    {formatarDataHora(m.dataHora)} · {m.usuarioNome}
                  </Text>
                </View>
                <View style={{ alignItems: "flex-end" }}>
                  <Text
                    style={[
                      e.movQtd,
                      { color: entrada ? cores.sucessoTexto : cores.perigo },
                    ]}
                  >
                    {entrada ? "+" : "−"}
                    {m.quantidade}
                  </Text>
                  <Text style={e.chave}>saldo {m.saldoApos}</Text>
                </View>
              </View>
            );
          })
        )}
      </Cartao>

      <View style={e.acoes}>
        <Botao
          titulo="Entrada"
          variante="contorno"
          icone="arrow-down"
          onPress={() => movimentar(true)}
          estilo={{ flex: 1 }}
        />
        <Botao
          titulo="Saída"
          icone="arrow-up"
          onPress={() => movimentar(false)}
          estilo={{ flex: 1 }}
        />
      </View>
      <Botao
        titulo="Editar produto"
        variante="suave"
        icone="create-outline"
        onPress={() => navigation.navigate("ProdutoForm", { id })}
      />
      {podeDesativar && (
        <Botao
          titulo="Desativar produto"
          variante="perigoContorno"
          onPress={confirmarDesativacao}
        />
      )}
    </ScrollView>
  );
}

function Bloco({
  valor,
  rotulo,
  cor = cores.texto,
}: {
  valor: string;
  rotulo: string;
  cor?: string;
}) {
  return (
    <View style={e.bloco} accessible accessibilityLabel={`${rotulo}: ${valor}`}>
      <Text style={[e.blocoValor, { color: cor }]}>{valor}</Text>
      <Text style={e.chave}>{rotulo}</Text>
    </View>
  );
}

const e = StyleSheet.create({
  tela: { flex: 1, backgroundColor: cores.fundo },
  conteudo: { padding: espaco.md, paddingTop: espaco.xs, paddingBottom: espaco.xl },
  cabecalho: { flexDirection: "row", alignItems: "flex-start", gap: espaco.sm },
  nome: { fontSize: fonte.tituloVoltar, fontWeight: "800", color: cores.texto },
  meta: { fontSize: fonte.legenda, color: cores.textoSuave, marginTop: 2 },
  blocos: { flexDirection: "row", gap: 6, marginBottom: espaco.sm },
  bloco: {
    flex: 1,
    backgroundColor: cores.superficie,
    borderRadius: raio.padrao,
    borderWidth: 1,
    borderColor: cores.borda,
    padding: espaco.md - 2,
  },
  blocoValor: { fontSize: fonte.kpi, fontWeight: "700" },
  linhaCartao: { flexDirection: "row", justifyContent: "space-between" },
  linha: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: espaco.xs,
  },
  linhaTotal: {
    borderTopWidth: 1,
    borderTopColor: cores.borda,
    paddingTop: espaco.sm,
    marginTop: espaco.xs,
  },
  chave: { fontSize: fonte.legenda, color: cores.textoSuave },
  chaveDestaque: {
    fontSize: fonte.corpo,
    fontWeight: "700",
    color: cores.sucessoTexto,
  },
  valor: { fontSize: fonte.corpo, color: cores.texto, fontWeight: "600" },
  mov: {
    flexDirection: "row",
    paddingVertical: espaco.sm,
    borderBottomWidth: 1,
    borderBottomColor: cores.borda,
  },
  movTipo: { fontSize: fonte.corpo - 1, fontWeight: "600", color: cores.texto },
  movQtd: { fontSize: fonte.corpo, fontWeight: "800" },
  acoes: { flexDirection: "row", gap: espaco.sm, marginTop: espaco.sm },
});
