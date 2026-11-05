import { useCallback, useState } from "react";
import {
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import {
  Aviso,
  Botao,
  Cartao,
  Carregando,
  TituloSecao,
} from "../components/base";
import type { ResumoEstoque } from "../domain/tipos";
import type { FiltroProdutos, TelaAba } from "../navigation/rotas";
import { sessaoAtual } from "../services/authService";
import { resumoDoEstoque } from "../services/produtoService";
import { type ItemRanking, maisVendidos } from "../services/relatorioService";
import { prazoVencimento } from "../services/preferenciaService";
import { DIAS_ALERTA_VENCIMENTO, formatarReais } from "../services/regras";
import {
  aoTerminarSincronizacao,
  avisoDoPainel,
  estadoDaSincronizacao,
  type AvisoDeTela,
} from "../services/sincronizacaoService";
import { cores, espaco, fonte, raio } from "../theme/tema";

export default function PainelScreen({ navigation }: TelaAba<"Início">) {
  const [resumo, setResumo] = useState<ResumoEstoque | null>(null);
  const [ranking, setRanking] = useState<ItemRanking[]>([]);
  // desenho aprovado em 05/11 (item 02): um aviso de sincronização por vez
  const [avisoSincronizacao, setAvisoSincronizacao] = useState<AvisoDeTela | null>(null);
  // prazo escolhido em Ajustes, o mesmo usado na contagem (US14)
  const [prazo, setPrazo] = useState<number>(DIAS_ALERTA_VENCIMENTO);
  const [atualizando, setAtualizando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const usuario = sessaoAtual();

  const carregar = useCallback(async () => {
    try {
      const [r, m, s, dias] = await Promise.all([
        resumoDoEstoque(),
        maisVendidos(5),
        estadoDaSincronizacao(),
        prazoVencimento(),
      ]);
      setResumo(r);
      setRanking(m);
      setAvisoSincronizacao(avisoDoPainel(s));
      setPrazo(dias);
      setErro(null);
    } catch {
      setErro("Não foi possível carregar o resumo do estoque.");
    }
  }, []);

  // Recarrega ao voltar para a aba, porque uma movimentação em outra tela
  // muda esses números, e quando uma sincronização termina, porque o saldo
  // pode ter vindo do servidor.
  useFocusEffect(
    useCallback(() => {
      carregar();
      return aoTerminarSincronizacao(() => {
        void carregar();
      });
    }, [carregar]),
  );

  if (!resumo) {
    if (!erro) return <Carregando texto="Carregando o resumo do estoque..." />;
    return (
      <View style={[e.tela, e.conteudo]}>
        <Aviso tipo="erro" texto={erro} />
        <Botao titulo="Tentar novamente" onPress={carregar} />
      </View>
    );
  }

  const maior = ranking.length > 0 ? ranking[0].total : 1;

  const primeiroNome = usuario?.nome.split(" ")[0] ?? "usuário";
  const perfil =
    usuario?.tipoPerfil === "PROPRIETARIO" ? "Proprietário" : "Operador";
  // conta cujo nome já é o perfil não repete a palavra
  const saudacao =
    primeiroNome === perfil
      ? `Olá, ${primeiroNome}`
      : `Olá, ${primeiroNome} · ${perfil}`;

  // RN01: o valor do estoque já chega nulo da camada de negócio para o
  // operador; a tela só decide o que mostrar no lugar
  const valor = resumo.valorTotalEstoque;

  function abrirProdutos(filtro: FiltroProdutos) {
    navigation.navigate("Produtos", {
      screen: "ProdutosLista",
      params: { filtro },
    });
  }

  return (
    <ScrollView
      style={e.tela}
      contentContainerStyle={e.conteudo}
      refreshControl={
        <RefreshControl
          refreshing={atualizando}
          colors={[cores.primaria]}
          onRefresh={async () => {
            setAtualizando(true);
            await carregar();
            setAtualizando(false);
          }}
        />
      }
    >
      <Text style={e.saudacao}>{saudacao}</Text>

      {!!erro && <Aviso tipo="erro" texto={erro} />}

      <View
        style={e.destaque}
        accessible
        accessibilityLabel={
          valor !== null
            ? `Valor total do estoque: ${formatarReais(valor)}. ${resumo.totalProdutos} produtos ativos.`
            : `${resumo.totalProdutos} produtos ativos.`
        }
      >
        {valor !== null ? (
          <>
            <Text style={e.destaqueRotulo}>Valor total do estoque</Text>
            <Text style={e.destaqueValor}>{formatarReais(valor)}</Text>
            <Text style={e.destaqueRodape}>
              {resumo.totalProdutos} produtos ativos · pelo preço de custo
            </Text>
          </>
        ) : (
          <>
            <Text style={e.destaqueRotulo}>Produtos ativos</Text>
            <Text style={e.destaqueValor}>{resumo.totalProdutos}</Text>
            <Text style={e.destaqueRodape}>no estoque desta loja</Text>
          </>
        )}
      </View>

      <View style={e.grade}>
        <Indicador
          valor={resumo.produtosCriticos}
          rotulo="No mínimo ou abaixo"
          cor={resumo.produtosCriticos > 0 ? cores.perigo : cores.texto}
          onPress={() => abrirProdutos("CRITICO")}
        />
        <Indicador
          valor={resumo.produtosVencendo}
          rotulo={`Vencendo em ${prazo} dias`}
          cor={resumo.produtosVencendo > 0 ? cores.aviso : cores.texto}
          onPress={() => abrirProdutos("VENCENDO")}
        />
      </View>

      {avisoSincronizacao && (
        <Aviso tipo={avisoSincronizacao.tipo} texto={avisoSincronizacao.texto} />
      )}

      <Cartao>
        <TituloSecao texto="Mais vendidos" />
        {ranking.length === 0 ? (
          <Text style={e.vazio}>
            Nenhuma venda registrada ainda. Registre uma saída do tipo Venda
            para o ranking aparecer.
          </Text>
        ) : (
          ranking.map((item) => (
            <View
              key={item.produtoId}
              style={e.barraLinha}
              accessible
              accessibilityLabel={`${item.nome}: ${item.total} unidades vendidas`}
            >
              <View style={e.barraCabecalho}>
                <Text style={e.barraRotulo} numberOfLines={1}>
                  {item.nome}
                </Text>
                <Text style={e.barraValor}>{item.total} un</Text>
              </View>
              <View style={e.barraTrilha}>
                <View
                  style={[
                    e.barra,
                    { width: `${Math.max(6, (item.total / maior) * 100)}%` },
                  ]}
                />
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
  onPress,
}: {
  valor: number;
  rotulo: string;
  cor: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [e.indicador, pressed && { opacity: 0.8 }]}
      accessibilityRole="button"
      accessibilityLabel={`${valor} produtos: ${rotulo}`}
      accessibilityHint="Abre a lista de produtos com este filtro"
    >
      <Text style={[e.indicadorValor, { color: cor }]}>{valor}</Text>
      <Text style={e.indicadorRotulo}>{rotulo}</Text>
    </Pressable>
  );
}

const e = StyleSheet.create({
  tela: { flex: 1, backgroundColor: cores.fundo },
  conteudo: { padding: espaco.md, paddingTop: 0 },
  saudacao: {
    fontSize: fonte.legenda,
    color: cores.textoSuave,
    marginBottom: espaco.md,
  },
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
  destaqueRodape: { color: cores.sobrePrimaria, fontSize: fonte.legenda - 1 },
  grade: { flexDirection: "row", gap: espaco.sm, marginBottom: espaco.sm },
  indicador: {
    flex: 1,
    backgroundColor: cores.superficie,
    borderRadius: raio.padrao,
    padding: espaco.md,
    borderWidth: 1,
    borderColor: cores.borda,
  },
  indicadorValor: { fontSize: fonte.kpi, fontWeight: "700" },
  indicadorRotulo: {
    fontSize: fonte.legenda,
    color: cores.textoSuave,
    marginTop: 2,
  },
  vazio: { fontSize: fonte.corpo, color: cores.textoSuave },
  barraLinha: { marginBottom: espaco.md },
  barraCabecalho: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  barraRotulo: { flex: 1, fontSize: fonte.legenda, color: cores.texto },
  barraValor: {
    fontSize: fonte.legenda,
    color: cores.textoSuave,
    fontWeight: "700",
    marginLeft: espaco.sm,
  },
  barraTrilha: {
    height: 8,
    backgroundColor: cores.primariaSuave,
    borderRadius: raio.completo,
    overflow: "hidden",
  },
  barra: {
    height: 8,
    backgroundColor: cores.primaria,
    borderRadius: raio.completo,
  },
});
