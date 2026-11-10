// Registro de entrada e saída de estoque.

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  AccessibilityInfo,
  Pressable,
  type ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import {
  Aviso,
  Botao,
  Campo,
  CampoBusca,
  Carregando,
  Cartao,
  Chip,
  Link,
  Miniatura,
  RolagemDeFormulario,
  Segmentado,
} from "../components/base";
import { LeitorCodigo } from "../components/LeitorCodigo";
import {
  type ProdutoVisivel,
  ROTULO_SITUACAO,
  ROTULO_TIPO,
  type TipoMovimentacao,
  TIPOS_ENTRADA,
  TIPOS_SAIDA,
} from "../domain/tipos";
import type { TelaAba } from "../navigation/rotas";
import { registrarMovimentacao } from "../services/estoqueService";
import { listarProdutos } from "../services/produtoService";
import { classificarEstoque, validarMovimentacao } from "../services/regras";
import { ALVO_TOQUE, cores, espaco, fonte, raio } from "../theme/tema";

export default function MovimentacaoScreen({
  route,
  navigation,
}: TelaAba<"Movimentar">) {
  const [produtos, setProdutos] = useState<ProdutoVisivel[] | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [produtoId, setProdutoId] = useState<number | null>(null);
  const [entrada, setEntrada] = useState(true);
  const [tipo, setTipo] = useState<TipoMovimentacao>("COMPRA");
  const [quantidade, setQuantidade] = useState("1");
  const [observacoes, setObservacoes] = useState("");
  const [erroGravacao, setErroGravacao] = useState<string | null>(null);
  const [sucesso, setSucesso] = useState<string | null>(null);
  const [salvando, setSalvando] = useState(false);
  const [trocandoProduto, setTrocandoProduto] = useState(false);
  const [busca, setBusca] = useState("");
  const [leitorAberto, setLeitorAberto] = useState(false);
  // código lido pela câmera que não está no cadastro
  const [codigoDesconhecido, setCodigoDesconhecido] = useState<string | null>(null);
  const rolagem = useRef<ScrollView>(null);

  const carregar = useCallback(async () => {
    try {
      const lista = await listarProdutos();
      setProdutos(lista);
      setErro(null);
      // na primeira carga já deixa um produto escolhido
      setProdutoId((atual) => atual ?? lista[0]?.id ?? null);
    } catch {
      setErro("Não foi possível carregar os produtos.");
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      carregar();
      // a confirmação vale só para a movimentação recém-feita
      return () => setSucesso(null);
    }, [carregar]),
  );

  /**
   * Aplica o produto e o sentido vindos da tela de detalhes.
   *
   * Esta aba fica montada depois da primeira visita, então ler os params
   * apenas no valor inicial do estado faria a segunda navegação em diante
   * cair no produto anterior. O efeito consome os params e os limpa, o que
   * garante que a navegação seguinte volte a ser uma mudança de valor,
   * mesmo repetindo produto e sentido.
   */
  useEffect(() => {
    const p = route.params;
    if (!p) return;
    if (p.produtoId === undefined && p.entrada === undefined) return;

    if (typeof p.produtoId === "number") {
      setProdutoId(p.produtoId);
      setTrocandoProduto(false);
    }
    if (typeof p.entrada === "boolean") {
      setEntrada(p.entrada);
      setTipo(p.entrada ? "COMPRA" : "VENDA");
    }
    setErroGravacao(null);
    setSucesso(null);
    navigation.setParams({ produtoId: undefined, entrada: undefined });
  }, [route.params, navigation]);

  const produto = useMemo(
    () => produtos?.find((p) => p.id === produtoId) ?? null,
    [produtos, produtoId],
  );

  // usa a mesma função que valida na gravação, para não divergir
  const previsao = useMemo(() => {
    if (!produto) return null;
    const qtd = parseInt(quantidade, 10);
    if (Number.isNaN(qtd)) return null;
    return validarMovimentacao(
      tipo,
      qtd,
      produto.estoqueAtual,
      produto.estoqueMinimo,
    );
  }, [produto, quantidade, tipo]);

  function trocarAba(ehEntrada: boolean) {
    setEntrada(ehEntrada);
    setTipo(ehEntrada ? "COMPRA" : "VENDA");
    setErroGravacao(null);
  }

  function escolherProduto(id: number) {
    setProdutoId(id);
    setTrocandoProduto(false);
    setBusca("");
    setErroGravacao(null);
    setCodigoDesconhecido(null);
  }

  // Código lido pela câmera: seleciona o produto se ele existir; se não,
  // oferece o cadastro já com o código preenchido.
  function aoLerCodigo(codigo: string) {
    setLeitorAberto(false);
    const achado = (produtos ?? []).find((p) => p.codigoBarras === codigo);
    if (achado) escolherProduto(achado.id);
    else {
      setBusca(codigo);
      setCodigoDesconhecido(codigo);
    }
  }

  function ajustar(delta: number) {
    const atual = parseInt(quantidade, 10) || 0;
    setQuantidade(String(Math.max(1, atual + delta)));
  }

  async function confirmar() {
    if (!produto) return;
    const qtd = parseInt(quantidade, 10);
    setErroGravacao(null);
    setSucesso(null);
    setSalvando(true);
    try {
      const r = await registrarMovimentacao({
        produtoId: produto.id,
        tipo,
        quantidade: qtd,
        observacoes,
      });

      if (!r.sucesso) {
        setErroGravacao(r.mensagem ?? "Não foi possível registrar.");
        return;
      }

      const texto =
        `${entrada ? "Entrada" : "Saída"} registrada: ${qtd} un. de ${produto.nome}. ` +
        `Novo saldo: ${r.saldoResultante} unidades.` +
        (r.aviso
          ? " O produto está no estoque mínimo ou abaixo dele: inclua na próxima compra."
          : "");
      setSucesso(texto);
      setQuantidade("1");
      setObservacoes("");
      // O botão fica no fim da tela e a confirmação, no topo, longe da
      // previsão da próxima movimentação. A rolagem leva até ela, e o anúncio
      // avisa quem usa leitor de tela.
      rolagem.current?.scrollTo({ y: 0, animated: true });
      AccessibilityInfo.announceForAccessibility(texto);
      await carregar();
    } finally {
      setSalvando(false);
    }
  }

  if (!produtos) {
    if (!erro) return <Carregando texto="Carregando produtos..." />;
    return (
      <View style={[e.tela, { padding: espaco.md }]}>
        <Aviso tipo="erro" texto={erro} />
        <Botao titulo="Tentar novamente" onPress={carregar} />
      </View>
    );
  }

  if (produtos.length === 0) {
    return (
      <View style={[e.tela, { padding: espaco.md }]}>
        <Aviso
          tipo="info"
          texto="Cadastre um produto antes de registrar movimentação."
        />
        <Botao
          titulo="Ir para produtos"
          onPress={() => navigation.navigate("Produtos")}
        />
      </View>
    );
  }

  const tiposDisponiveis = entrada ? TIPOS_ENTRADA : TIPOS_SAIDA;
  const termo = busca.trim().toLowerCase();
  const encontrados = produtos
    .filter(
      (p) =>
        termo.length === 0 ||
        p.nome.toLowerCase().includes(termo) ||
        (p.codigoBarras ?? "").includes(termo),
    )
    .slice(0, 6);

  return (
    <RolagemDeFormulario
      ref={rolagem}
      style={e.tela}
      contentContainerStyle={e.conteudo}
    >
      {!!erro && <Aviso tipo="erro" texto={erro} />}
      {!!sucesso && <Aviso tipo="sucesso" texto={sucesso} />}

      {/* o estado ativo tem fundo, cor e peso de texto, não só cor */}
      <Segmentado
        opcoes={[
          { valor: "entrada", rotulo: "Entrada" },
          { valor: "saida", rotulo: "Saída" },
        ]}
        valor={entrada ? "entrada" : "saida"}
        onChange={(v) => trocarAba(v === "entrada")}
      />

      {/* seleção de produto: cartão do escolhido, ou busca para trocar */}
      {produto && !trocandoProduto ? (
        <Cartao estilo={e.produto}>
          <Miniatura texto={produto.nome} />
          <View style={{ flex: 1 }}>
            <Text style={e.produtoNome}>{produto.nome}</Text>
            <Text style={e.produtoMeta}>
              {produto.codigoBarras ? `${produto.codigoBarras} · ` : ""}
              Estoque atual: {produto.estoqueAtual} · mín.{" "}
              {produto.estoqueMinimo}
            </Text>
          </View>
          <Link titulo="Trocar" onPress={() => setTrocandoProduto(true)} />
        </Cartao>
      ) : (
        <View style={{ marginBottom: espaco.md }}>
          <CampoBusca
            valor={busca}
            onChangeText={(t) => {
              setBusca(t);
              setCodigoDesconhecido(null);
            }}
            placeholder="Buscar produto por nome ou código"
            rotuloAcessivel="Buscar produto para movimentar"
            acao={{
              icone: "barcode-outline",
              rotulo: "Ler código de barras com a câmera",
              onPress: () => setLeitorAberto(true),
            }}
          />
          {!!codigoDesconhecido && (
            <View style={{ marginTop: espaco.sm }}>
              <Aviso
                tipo="info"
                texto={`Nenhum produto com o código ${codigoDesconhecido}. Cadastre o produto para movimentar.`}
              />
              <Botao
                titulo="Cadastrar produto"
                variante="contorno"
                onPress={() =>
                  navigation.navigate("Produtos", {
                    screen: "ProdutoForm",
                    params: { codigoBarras: codigoDesconhecido },
                  })
                }
              />
            </View>
          )}
          <LeitorCodigo
            aberto={leitorAberto}
            onCancelar={() => setLeitorAberto(false)}
            onLer={aoLerCodigo}
          />
          <View style={e.resultados}>
            {encontrados.length === 0 ? (
              <Text style={e.produtoMeta}>Nenhum produto encontrado.</Text>
            ) : (
              encontrados.map((p) => (
                <Pressable
                  key={p.id}
                  onPress={() => escolherProduto(p.id)}
                  accessibilityRole="button"
                  accessibilityLabel={`${p.nome}, ${p.estoqueAtual} unidades em estoque`}
                  style={({ pressed }) => [
                    e.resultado,
                    pressed && { backgroundColor: cores.primariaSuave },
                  ]}
                >
                  <Text style={e.resultadoNome} numberOfLines={1}>
                    {p.nome}
                  </Text>
                  <Text style={e.produtoMeta}>{p.estoqueAtual} un</Text>
                </Pressable>
              ))
            )}
          </View>
        </View>
      )}

      {/* quantidade: campo editável com incrementadores de alvo grande,
          porque o registro acontece durante o atendimento */}
      <Cartao estilo={e.quantidade}>
        <Text style={e.quantidadeRotulo}>Quantidade</Text>
        <View style={e.contador}>
          <Pressable
            onPress={() => ajustar(-1)}
            accessibilityRole="button"
            accessibilityLabel="Diminuir quantidade"
            style={({ pressed }) => [e.botaoContador, pressed && { opacity: 0.7 }]}
          >
            <Ionicons name="remove" size={22} color={cores.primaria} />
          </Pressable>
          <TextInput
            value={quantidade}
            onChangeText={(t) => setQuantidade(t.replace(/[^0-9]/g, ""))}
            keyboardType="numeric"
            accessibilityLabel="Quantidade"
            style={e.contadorNumero}
            maxLength={5}
          />
          <Pressable
            onPress={() => ajustar(1)}
            accessibilityRole="button"
            accessibilityLabel="Aumentar quantidade"
            style={({ pressed }) => [e.botaoContador, pressed && { opacity: 0.7 }]}
          >
            <Ionicons name="add" size={22} color={cores.primaria} />
          </Pressable>
        </View>
      </Cartao>

      <Text style={e.rotulo}>Motivo</Text>
      <View style={e.opcoes} accessibilityRole="radiogroup">
        {tiposDisponiveis.map((t) => (
          <Chip
            key={t}
            rotulo={ROTULO_TIPO[t]}
            ativo={tipo === t}
            onPress={() => setTipo(t)}
          />
        ))}
      </View>

      <Campo
        rotulo="Observações"
        valor={observacoes}
        onChangeText={setObservacoes}
        placeholder="Opcional"
        multilinha
      />

      {/* Previsão do saldo antes de confirmar. Movimentação é imutável, e
          por isso o erro precisa ser evitado antes da gravação. */}
      {produto && previsao && (
        <View
          accessibilityRole="alert"
          accessibilityLiveRegion="polite"
          style={[
            e.previsao,
            !previsao.valido
              ? { backgroundColor: cores.perigoSuave, borderLeftColor: cores.perigo }
              : previsao.aviso
                ? { backgroundColor: cores.avisoSuave, borderLeftColor: cores.aviso }
                : { backgroundColor: cores.primariaSuave, borderLeftColor: cores.primaria },
          ]}
        >
          <Text style={e.previsaoTitulo}>Previsão após a movimentação</Text>
          <Text style={e.previsaoLinha}>
            Estoque atual: {produto.estoqueAtual} unidades
          </Text>
          {previsao.valido && (
            <Text style={e.previsaoLinha}>
              Depois: {previsao.saldoResultante} unidades (
              {ROTULO_SITUACAO[
                classificarEstoque(previsao.saldoResultante, produto.estoqueMinimo)
              ].toLowerCase()}
              )
            </Text>
          )}
          {!!previsao.mensagem && (
            <Text style={e.previsaoErro}>{previsao.mensagem}</Text>
          )}
          {!!previsao.aviso && (
            <Text style={e.previsaoAviso}>{previsao.aviso}</Text>
          )}
        </View>
      )}

      {!!erroGravacao && <Aviso tipo="erro" texto={erroGravacao} />}

      <Botao
        titulo={entrada ? "Registrar entrada" : "Registrar saída"}
        onPress={confirmar}
        carregando={salvando}
        desabilitado={!produto || !previsao?.valido || trocandoProduto}
      />
    </RolagemDeFormulario>
  );
}

const e = StyleSheet.create({
  tela: { flex: 1, backgroundColor: cores.fundo },
  conteudo: { padding: espaco.md, paddingTop: espaco.xs, paddingBottom: espaco.xl },
  rotulo: {
    fontSize: fonte.rotulo,
    fontWeight: "700",
    color: cores.texto,
    marginBottom: espaco.sm,
  },
  opcoes: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: espaco.sm,
    marginBottom: espaco.md,
  },
  produto: { flexDirection: "row", alignItems: "center", gap: espaco.md - 4 },
  produtoNome: { fontSize: fonte.corpo, fontWeight: "700", color: cores.texto },
  produtoMeta: { fontSize: fonte.legenda, color: cores.textoSuave, marginTop: 2 },
  resultados: {
    marginTop: espaco.sm,
    backgroundColor: cores.superficie,
    borderRadius: raio.padrao,
    borderWidth: 1,
    borderColor: cores.borda,
    overflow: "hidden",
  },
  resultado: {
    minHeight: ALVO_TOQUE,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: espaco.md,
    borderBottomWidth: 1,
    borderBottomColor: cores.borda,
  },
  resultadoNome: { flex: 1, fontSize: fonte.corpo, color: cores.texto, marginRight: espaco.sm },
  quantidade: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: espaco.md,
  },
  quantidadeRotulo: { fontSize: fonte.corpo, fontWeight: "700", color: cores.texto },
  contador: { flexDirection: "row", alignItems: "center", gap: espaco.sm },
  botaoContador: {
    width: ALVO_TOQUE,
    height: ALVO_TOQUE,
    borderRadius: ALVO_TOQUE / 2,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: cores.primariaSuave,
  },
  contadorNumero: {
    minWidth: 56,
    textAlign: "center",
    fontSize: 22,
    fontWeight: "800",
    color: cores.texto,
    paddingVertical: 4,
  },
  previsao: {
    padding: espaco.md,
    borderRadius: raio.padrao,
    borderLeftWidth: 4,
    marginBottom: espaco.md,
  },
  previsaoTitulo: { fontSize: fonte.corpo, fontWeight: "700", color: cores.texto },
  previsaoLinha: { fontSize: fonte.legenda, color: cores.texto, marginTop: espaco.xs },
  previsaoErro: {
    fontSize: fonte.legenda,
    color: cores.perigoTexto,
    marginTop: espaco.sm,
    fontWeight: "600",
  },
  previsaoAviso: {
    fontSize: fonte.legenda,
    color: cores.sobreAvisoSuave,
    marginTop: espaco.sm,
    fontWeight: "600",
  },
});
