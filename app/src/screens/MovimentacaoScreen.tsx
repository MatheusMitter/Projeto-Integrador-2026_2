// Registro de entrada e saída de estoque.

import React, { useCallback, useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { Aviso, Botao, Campo, Cartao, Carregando } from "../components/base";
import {
  Produto,
  ROTULO_TIPO,
  TipoMovimentacao,
  TIPOS_ENTRADA,
  TIPOS_SAIDA,
} from "../domain/tipos";
import * as produtoRepo from "../repositories/produtoRepository";
import { sessaoAtual } from "../services/authService";
import { registrarMovimentacao } from "../services/estoqueService";
import { classificarEstoque, validarMovimentacao } from "../services/regras";
import { ALVO_TOQUE, cores, espaco, fonte, raio } from "../theme/tema";

interface Props {
  route?: { params?: { produtoId?: number; entrada?: boolean } };
  navigation: { navigate: (tela: string, params?: object) => void };
}

export default function MovimentacaoScreen({ route, navigation }: Props) {
  const [produtos, setProdutos] = useState<Produto[] | null>(null);
  const [produtoId, setProdutoId] = useState<number | null>(
    route?.params?.produtoId ?? null,
  );
  const [entrada, setEntrada] = useState(route?.params?.entrada ?? true);
  const [tipo, setTipo] = useState<TipoMovimentacao>("COMPRA");
  const [quantidade, setQuantidade] = useState("1");
  const [observacoes, setObservacoes] = useState("");
  const [mensagem, setMensagem] = useState<{
    texto: string;
    tipo: "erro" | "sucesso";
  } | null>(null);
  const [salvando, setSalvando] = useState(false);

  const carregar = useCallback(async () => {
    const lista = await produtoRepo.listar();
    setProdutos(lista);
    if (produtoId === null && lista.length > 0) setProdutoId(lista[0].id);
  }, [produtoId]);

  useFocusEffect(
    useCallback(() => {
      carregar();
    }, [carregar]),
  );

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
    setMensagem(null);
  }

  function ajustar(delta: number) {
    const atual = parseInt(quantidade, 10) || 0;
    setQuantidade(String(Math.max(1, atual + delta)));
  }

  async function confirmar() {
    if (!produto) return;
    setMensagem(null);
    setSalvando(true);
    try {
      const r = await registrarMovimentacao({
        produtoId: produto.id,
        usuarioId: sessaoAtual()?.id ?? 1,
        tipo,
        quantidade: parseInt(quantidade, 10),
        observacoes,
      });

      if (!r.sucesso) {
        setMensagem({
          texto: r.mensagem ?? "Não foi possível registrar.",
          tipo: "erro",
        });
        return;
      }

      setMensagem({
        texto:
          `Movimentação registrada. Novo saldo: ${r.saldoResultante} unidades.` +
          (r.aviso ? ` ${r.aviso}` : ""),
        tipo: "sucesso",
      });
      setQuantidade("1");
      setObservacoes("");
      await carregar();
    } finally {
      setSalvando(false);
    }
  }

  if (!produtos) return <Carregando texto="Carregando produtos..." />;

  if (produtos.length === 0) {
    return (
      <View style={e.tela}>
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

  return (
    <ScrollView style={e.tela} contentContainerStyle={{ padding: espaco.md }}>
      {/* seleção de produto */}
      <Text style={e.rotulo}>Produto</Text>
      <View style={e.listaProdutos}>
        {produtos.map((p) => {
          const ativo = p.id === produtoId;
          return (
            <Pressable
              key={p.id}
              onPress={() => {
                setProdutoId(p.id);
                setMensagem(null);
              }}
              accessibilityRole="radio"
              accessibilityState={{ selected: ativo }}
              accessibilityLabel={`${p.nome}, ${p.estoqueAtual} unidades em estoque`}
              style={[e.chip, ativo && e.chipAtivo]}
            >
              <Text style={[e.chipTexto, ativo && e.chipTextoAtivo]}>
                {ativo ? "\u25CF " : ""}
                {p.nome}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {produto && (
        <Cartao>
          <Text style={e.produtoNome}>{produto.nome}</Text>
          <Text style={e.produtoMeta}>
            Estoque atual: {produto.estoqueAtual} unidades · mínimo{" "}
            {produto.estoqueMinimo}
          </Text>
        </Cartao>
      )}

      {/* abas entrada e saída: o estado tem texto e marca, não só cor */}
      <Text style={e.rotulo}>Tipo de movimentação</Text>
      <View style={e.abas}>
        <Pressable
          onPress={() => trocarAba(true)}
          accessibilityRole="tab"
          accessibilityState={{ selected: entrada }}
          style={[e.aba, entrada && e.abaEntradaAtiva]}
        >
          <Text style={[e.abaTexto, entrada && e.abaTextoAtivo]}>Entrada</Text>
        </Pressable>
        <Pressable
          onPress={() => trocarAba(false)}
          accessibilityRole="tab"
          accessibilityState={{ selected: !entrada }}
          style={[e.aba, !entrada && e.abaSaidaAtiva]}
        >
          <Text style={[e.abaTexto, !entrada && e.abaTextoAtivo]}>Saída</Text>
        </Pressable>
      </View>

      <Text style={e.rotulo}>Motivo</Text>
      <View style={e.listaProdutos}>
        {tiposDisponiveis.map((t) => {
          const ativo = tipo === t;
          return (
            <Pressable
              key={t}
              onPress={() => setTipo(t)}
              accessibilityRole="radio"
              accessibilityState={{ selected: ativo }}
              style={[e.chip, ativo && e.chipAtivo]}
            >
              <Text style={[e.chipTexto, ativo && e.chipTextoAtivo]}>
                {ativo ? "\u25CF " : ""}
                {ROTULO_TIPO[t]}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {/* quantidade com incrementadores: alvo de toque grande porque o
          registro acontece durante o atendimento */}
      <Text style={e.rotulo}>Quantidade *</Text>
      <View style={e.contador}>
        <Pressable
          onPress={() => ajustar(-1)}
          accessibilityRole="button"
          accessibilityLabel="Diminuir quantidade"
          style={e.botaoContador}
        >
          <Text style={e.botaoContadorTexto}>-</Text>
        </Pressable>
        <View style={e.contadorValor}>
          <Text style={e.contadorNumero}>{quantidade}</Text>
        </View>
        <Pressable
          onPress={() => ajustar(1)}
          accessibilityRole="button"
          accessibilityLabel="Aumentar quantidade"
          style={e.botaoContador}
        >
          <Text style={e.botaoContadorTexto}>+</Text>
        </Pressable>
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
              ? {
                  backgroundColor: cores.perigoClaro,
                  borderLeftColor: cores.perigo,
                }
              : previsao.aviso
                ? {
                    backgroundColor: cores.avisoClaro,
                    borderLeftColor: cores.aviso,
                  }
                : {
                    backgroundColor: cores.primariaClara,
                    borderLeftColor: cores.primaria,
                  },
          ]}
        >
          <Text style={e.previsaoTitulo}>Previsão após a movimentação</Text>
          <Text style={e.previsaoLinha}>
            Estoque atual: {produto.estoqueAtual} unidades
          </Text>
          {previsao.valido && (
            <Text style={e.previsaoLinha}>
              Após esta movimentação: {previsao.saldoResultante} unidades (
              {classificarEstoque(
                previsao.saldoResultante,
                produto.estoqueMinimo,
              ).toLowerCase()}
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

      {!!mensagem && (
        <Aviso
          texto={mensagem.texto}
          tipo={mensagem.tipo === "erro" ? "erro" : "sucesso"}
        />
      )}

      <Botao
        titulo="Confirmar movimentação"
        onPress={confirmar}
        carregando={salvando}
        desabilitado={!produto || !previsao?.valido}
        variante={entrada ? "primario" : "perigo"}
      />
    </ScrollView>
  );
}

const e = StyleSheet.create({
  tela: { flex: 1, backgroundColor: cores.cinza100, padding: espaco.md },
  rotulo: {
    fontSize: fonte.legenda,
    fontWeight: "600",
    color: cores.cinza700,
    marginBottom: espaco.sm,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  listaProdutos: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: espaco.sm,
    marginBottom: espaco.md,
  },
  chip: {
    minHeight: ALVO_TOQUE,
    justifyContent: "center",
    paddingHorizontal: espaco.md,
    borderRadius: raio.completo,
    backgroundColor: cores.branco,
    borderWidth: 1,
    borderColor: cores.cinza300,
  },
  chipAtivo: { backgroundColor: cores.primaria, borderColor: cores.primaria },
  chipTexto: { fontSize: fonte.legenda, color: cores.cinza800 },
  chipTextoAtivo: { color: cores.branco, fontWeight: "700" },
  produtoNome: {
    fontSize: fonte.corpo,
    fontWeight: "700",
    color: cores.cinza900,
  },
  produtoMeta: {
    fontSize: fonte.legenda,
    color: cores.cinza600,
    marginTop: espaco.xs,
  },
  abas: { flexDirection: "row", gap: espaco.sm, marginBottom: espaco.md },
  aba: {
    flex: 1,
    minHeight: ALVO_TOQUE,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: raio.md,
    borderWidth: 2,
    borderColor: cores.cinza300,
    backgroundColor: cores.branco,
  },
  abaEntradaAtiva: {
    backgroundColor: cores.primaria,
    borderColor: cores.primaria,
  },
  abaSaidaAtiva: { backgroundColor: cores.perigo, borderColor: cores.perigo },
  abaTexto: { fontSize: fonte.corpo, fontWeight: "600", color: cores.cinza700 },
  abaTextoAtivo: { color: cores.branco },
  contador: { flexDirection: "row", gap: espaco.sm, marginBottom: espaco.md },
  botaoContador: {
    width: 56,
    minHeight: ALVO_TOQUE,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: cores.cinza200,
    borderRadius: raio.md,
  },
  botaoContadorTexto: {
    fontSize: 22,
    fontWeight: "700",
    color: cores.cinza900,
  },
  contadorValor: {
    flex: 1,
    minHeight: ALVO_TOQUE,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: cores.branco,
    borderWidth: 1,
    borderColor: cores.cinza300,
    borderRadius: raio.md,
  },
  contadorNumero: {
    fontSize: fonte.tituloMedio,
    fontWeight: "700",
    color: cores.cinza900,
  },
  previsao: {
    padding: espaco.md,
    borderRadius: raio.md,
    borderLeftWidth: 4,
    marginBottom: espaco.md,
  },
  previsaoTitulo: {
    fontSize: fonte.corpo,
    fontWeight: "700",
    color: cores.cinza900,
  },
  previsaoLinha: {
    fontSize: fonte.corpo,
    color: cores.cinza900,
    marginTop: espaco.xs,
  },
  previsaoErro: {
    fontSize: fonte.corpo,
    color: "#B71C1C",
    marginTop: espaco.sm,
    fontWeight: "600",
  },
  previsaoAviso: {
    fontSize: fonte.corpo,
    color: "#BF360C",
    marginTop: espaco.sm,
    fontWeight: "600",
  },
});
