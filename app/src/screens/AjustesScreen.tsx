// Ajustes: perfil, cadastros auxiliares, situação dos dados e saída.

import { useCallback, useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { Botao, Cartao, type NomeIcone } from "../components/base";
import type { TelaAjustes } from "../navigation/rotas";
import { useSessao } from "../navigation/sessao";
import { sessaoAtual } from "../services/authService";
import { registrosNaoSincronizados } from "../services/sincronizacaoService";
import { ALVO_TOQUE, cores, espaco, fonte } from "../theme/tema";
import appConfig from "../../app.json";

function iniciais(nome: string): string {
  const partes = nome.trim().split(/\s+/);
  const primeira = partes[0]?.charAt(0) ?? "";
  const ultima = partes.length > 1 ? partes[partes.length - 1].charAt(0) : "";
  return (primeira + ultima).toUpperCase();
}

export default function AjustesScreen({ navigation }: TelaAjustes<"AjustesInicio">) {
  const { sair } = useSessao();
  const usuario = sessaoAtual();
  const [pendentes, setPendentes] = useState<number | null>(null);
  const [falhaPendentes, setFalhaPendentes] = useState(false);

  useFocusEffect(
    useCallback(() => {
      registrosNaoSincronizados()
        .then((n) => {
          setPendentes(n);
          setFalhaPendentes(false);
        })
        .catch(() => setFalhaPendentes(true));
    }, []),
  );

  function confirmarSaida() {
    Alert.alert(
      "Sair da conta",
      "Os registros ainda não sincronizados continuam salvos neste aparelho.",
      [
        { text: "Cancelar", style: "cancel" },
        { text: "Sair", style: "destructive", onPress: sair },
      ],
    );
  }

  const perfil =
    usuario?.tipoPerfil === "PROPRIETARIO" ? "Proprietário" : "Operador";

  return (
    <ScrollView style={e.tela} contentContainerStyle={e.conteudo}>
      <Cartao estilo={e.perfil}>
        <View style={e.avatar} accessibilityElementsHidden importantForAccessibility="no">
          <Text style={e.avatarTexto}>{iniciais(usuario?.nome ?? "?")}</Text>
        </View>
        <View style={{ flex: 1 }} accessible>
          <Text style={e.nome}>{usuario?.nome}</Text>
          <Text style={e.meta}>
            {perfil} · {usuario?.email}
          </Text>
        </View>
      </Cartao>
      <Text style={e.ajuda}>
        O proprietário tem acesso completo. O operador não vê preço de custo,
        margem nem valor do estoque (RN01).
      </Text>

      <Cartao estilo={e.grupo}>
        <Linha
          icone="business-outline"
          titulo="Gerenciar fornecedores"
          onPress={() => navigation.navigate("Fornecedores")}
          ultima
        />
      </Cartao>

      <Cartao estilo={e.grupo}>
        <Linha
          icone="cloud-offline-outline"
          titulo="Dados neste aparelho"
          descricao={
            falhaPendentes
              ? "Não foi possível verificar os registros deste aparelho."
              : pendentes === null
                ? "Verificando..."
                : `${pendentes} registro(s) ainda não enviados. O envio ao servidor ainda não está disponível nesta versão.`
          }
        />
        <Linha
          icone="information-circle-outline"
          titulo="Versão do aplicativo"
          descricao={appConfig.expo.version}
          ultima
        />
      </Cartao>

      <Botao
        titulo="Sair"
        variante="perigoContorno"
        icone="log-out-outline"
        onPress={confirmarSaida}
        estilo={{ marginTop: espaco.sm }}
      />
    </ScrollView>
  );
}

function Linha({
  icone,
  titulo,
  descricao,
  onPress,
  ultima = false,
}: {
  icone: NomeIcone;
  titulo: string;
  descricao?: string;
  onPress?: () => void;
  ultima?: boolean;
}) {
  const conteudo = (
    <>
      <Ionicons name={icone} size={22} color={cores.primaria} />
      <View style={{ flex: 1 }}>
        <Text style={e.linhaTitulo}>{titulo}</Text>
        {!!descricao && <Text style={e.meta}>{descricao}</Text>}
      </View>
      {onPress && (
        <Ionicons name="chevron-forward" size={20} color={cores.textoSuave} />
      )}
    </>
  );

  const estilo = [e.linha, ultima && { borderBottomWidth: 0 }];

  if (!onPress) {
    return (
      <View style={estilo} accessible>
        {conteudo}
      </View>
    );
  }
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      style={({ pressed }) => [...estilo, pressed && { opacity: 0.6 }]}
    >
      {conteudo}
    </Pressable>
  );
}

const e = StyleSheet.create({
  tela: { flex: 1, backgroundColor: cores.fundo },
  conteudo: { padding: espaco.md, paddingTop: espaco.xs, paddingBottom: espaco.xl },
  perfil: { flexDirection: "row", alignItems: "center", gap: espaco.md - 2 },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: cores.primariaSuave,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarTexto: { color: cores.primaria, fontWeight: "800", fontSize: 16 },
  nome: { fontSize: fonte.corpo + 1, fontWeight: "700", color: cores.texto },
  meta: { fontSize: fonte.legenda, color: cores.textoSuave, marginTop: 2 },
  ajuda: {
    fontSize: fonte.legenda - 1,
    color: cores.textoSuave,
    marginBottom: espaco.md,
    paddingHorizontal: 2,
  },
  grupo: { paddingVertical: 0 },
  linha: {
    minHeight: ALVO_TOQUE + 8,
    flexDirection: "row",
    alignItems: "center",
    gap: espaco.md - 2,
    paddingVertical: espaco.sm + 2,
    borderBottomWidth: 1,
    borderBottomColor: cores.borda,
  },
  linhaTitulo: { fontSize: fonte.corpo, color: cores.texto, fontWeight: "500" },
});
