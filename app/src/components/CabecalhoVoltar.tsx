// Cabeçalho "‹ Título" das telas de acesso, que ficam fora da navegação
// em pilha. Dentro do app o cabeçalho vem do React Navigation.

import { Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { ALVO_TOQUE, cores, espaco, fonte } from "../theme/tema";

export function CabecalhoVoltar({
  titulo,
  voltar,
}: {
  titulo: string;
  voltar: () => void;
}) {
  return (
    <View style={e.barra}>
      <Pressable
        onPress={voltar}
        accessibilityRole="button"
        accessibilityLabel="Voltar"
        hitSlop={8}
        style={e.voltar}
      >
        <Ionicons name="chevron-back" size={24} color={cores.texto} />
      </Pressable>
      <Text style={e.titulo} accessibilityRole="header">
        {titulo}
      </Text>
    </View>
  );
}

const e = StyleSheet.create({
  barra: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: espaco.sm,
    minHeight: 56,
  },
  voltar: {
    width: ALVO_TOQUE,
    height: ALVO_TOQUE,
    alignItems: "center",
    justifyContent: "center",
  },
  titulo: {
    fontSize: fonte.tituloVoltar,
    fontWeight: "800",
    color: cores.texto,
  },
});
