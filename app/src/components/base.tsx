// Componentes reaproveitados nas telas.

import React from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  ViewStyle,
} from "react-native";
import {
  ALVO_TOQUE,
  cores,
  CORES_SITUACAO,
  espaco,
  fonte,
  raio,
} from "../theme/tema";
import { ROTULO_SITUACAO, SituacaoEstoque } from "../domain/tipos";

// ------------------------------------------------------------------ botão

interface BotaoProps {
  titulo: string;
  onPress: () => void;
  variante?: "primario" | "secundario" | "perigo";
  carregando?: boolean;
  desabilitado?: boolean;
}

export function Botao({
  titulo,
  onPress,
  variante = "primario",
  carregando = false,
  desabilitado = false,
}: BotaoProps) {
  const fundo =
    variante === "primario"
      ? cores.primaria
      : variante === "perigo"
        ? cores.perigo
        : cores.cinza200;
  const texto = variante === "secundario" ? cores.cinza900 : cores.branco;
  const inativo = desabilitado || carregando;

  return (
    <Pressable
      onPress={onPress}
      disabled={inativo}
      accessibilityRole="button"
      accessibilityLabel={titulo}
      accessibilityState={{ disabled: inativo, busy: carregando }}
      style={({ pressed }) => [
        e.botao,
        { backgroundColor: fundo, opacity: inativo ? 0.5 : pressed ? 0.85 : 1 },
      ]}
    >
      {carregando ? (
        <ActivityIndicator color={texto} />
      ) : (
        <Text style={[e.botaoTexto, { color: texto }]}>{titulo}</Text>
      )}
    </Pressable>
  );
}

// ------------------------------------------------------------------ campo

interface CampoProps {
  rotulo: string;
  valor: string;
  onChangeText: (t: string) => void;
  placeholder?: string;
  obrigatorio?: boolean;
  tipoTeclado?: "default" | "numeric" | "email-address" | "decimal-pad";
  senha?: boolean;
  ajuda?: string;
  multilinha?: boolean;
}

export function Campo({
  rotulo,
  valor,
  onChangeText,
  placeholder,
  obrigatorio = false,
  tipoTeclado = "default",
  senha = false,
  ajuda,
  multilinha = false,
}: CampoProps) {
  return (
    <View style={e.campoGrupo}>
      <Text style={e.campoRotulo}>
        {rotulo}
        {obrigatorio ? " *" : ""}
      </Text>
      <TextInput
        value={valor}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={cores.cinza600}
        keyboardType={tipoTeclado}
        secureTextEntry={senha}
        multiline={multilinha}
        accessibilityLabel={obrigatorio ? `${rotulo}, obrigatório` : rotulo}
        accessibilityHint={ajuda}
        style={[
          e.campo,
          multilinha && { height: 80, textAlignVertical: "top" },
        ]}
      />
      {!!ajuda && <Text style={e.campoAjuda}>{ajuda}</Text>}
    </View>
  );
}

// ------------------------------------------------------------------ cartão

export function Cartao({
  children,
  estilo,
}: {
  children: React.ReactNode;
  estilo?: ViewStyle;
}) {
  return <View style={[e.cartao, estilo]}>{children}</View>;
}

// ------------------------------------------------- etiqueta de situação

// mostra texto além da cor, para não depender só dela
export function EtiquetaSituacao({ situacao }: { situacao: SituacaoEstoque }) {
  const c = CORES_SITUACAO[situacao];
  return (
    <View style={[e.etiqueta, { backgroundColor: c.fundo }]}>
      <Text style={[e.etiquetaTexto, { color: c.texto }]}>
        {ROTULO_SITUACAO[situacao]}
      </Text>
    </View>
  );
}

// ------------------------------------------------------------------ avisos

export function Aviso({
  texto,
  tipo = "info",
}: {
  texto: string;
  tipo?: "info" | "erro" | "atencao" | "sucesso";
}) {
  const mapa = {
    info: {
      fundo: cores.secundariaClara,
      borda: cores.secundaria,
      texto: "#0D47A1",
    },
    erro: { fundo: cores.perigoClaro, borda: cores.perigo, texto: "#B71C1C" },
    atencao: { fundo: cores.avisoClaro, borda: cores.aviso, texto: "#BF360C" },
    sucesso: {
      fundo: cores.primariaClara,
      borda: cores.primaria,
      texto: cores.primariaEscura,
    },
  }[tipo];

  return (
    <View
      accessibilityRole="alert"
      style={[
        e.aviso,
        { backgroundColor: mapa.fundo, borderLeftColor: mapa.borda },
      ]}
    >
      <Text style={{ color: mapa.texto, fontSize: fonte.corpo }}>{texto}</Text>
    </View>
  );
}

export function ListaVazia({
  texto,
  acao,
}: {
  texto: string;
  acao?: { titulo: string; onPress: () => void };
}) {
  return (
    <View style={e.vazio}>
      <Text style={e.vazioTexto}>{texto}</Text>
      {acao && <Botao titulo={acao.titulo} onPress={acao.onPress} />}
    </View>
  );
}

export function Carregando({ texto = "Carregando..." }: { texto?: string }) {
  return (
    <View style={e.vazio}>
      <ActivityIndicator size="large" color={cores.primaria} />
      <Text style={[e.vazioTexto, { marginTop: espaco.md }]}>{texto}</Text>
    </View>
  );
}

const e = StyleSheet.create({
  botao: {
    minHeight: ALVO_TOQUE,
    borderRadius: raio.md,
    paddingHorizontal: espaco.lg,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: espaco.sm,
  },
  botaoTexto: { fontSize: fonte.corpo, fontWeight: "600" },
  campoGrupo: { marginBottom: espaco.md },
  campoRotulo: {
    fontSize: fonte.legenda,
    fontWeight: "600",
    color: cores.cinza700,
    marginBottom: espaco.xs,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  campo: {
    minHeight: ALVO_TOQUE,
    borderWidth: 1,
    borderColor: cores.cinza300,
    borderRadius: raio.md,
    paddingHorizontal: espaco.md,
    fontSize: fonte.corpo,
    color: cores.cinza900,
    backgroundColor: cores.branco,
  },
  campoAjuda: {
    fontSize: fonte.legenda,
    color: cores.cinza600,
    marginTop: espaco.xs,
  },
  cartao: {
    backgroundColor: cores.branco,
    borderRadius: raio.md,
    padding: espaco.md,
    marginBottom: espaco.md,
    borderWidth: 1,
    borderColor: cores.cinza200,
  },
  etiqueta: {
    alignSelf: "flex-start",
    paddingHorizontal: espaco.md,
    paddingVertical: espaco.xs,
    borderRadius: raio.completo,
  },
  etiquetaTexto: { fontSize: fonte.legenda, fontWeight: "700" },
  aviso: {
    padding: espaco.md,
    borderRadius: raio.md,
    borderLeftWidth: 4,
    marginBottom: espaco.md,
  },
  vazio: { padding: espaco.xl, alignItems: "center" },
  vazioTexto: {
    fontSize: fonte.corpo,
    color: cores.cinza600,
    textAlign: "center",
    marginBottom: espaco.md,
  },
});
