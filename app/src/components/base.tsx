// Componentes reaproveitados nas telas.

import React from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Pressable,
  ScrollView,
  type ScrollViewProps,
  StyleSheet,
  Text,
  TextInput,
  View,
  type ViewStyle,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
  ALVO_TOQUE,
  cores,
  CORES_SITUACAO,
  espaco,
  fonte,
  raio,
} from "../theme/tema";
import {
  ROTULO_SITUACAO,
  ROTULO_SITUACAO_CURTO,
  type SituacaoEstoque,
} from "../domain/tipos";

export type NomeIcone = React.ComponentProps<typeof Ionicons>["name"];

// ------------------------------------------------------------------ botão

type VarianteBotao =
  | "primario"
  | "acesso"
  | "contorno"
  | "suave"
  | "perigo"
  | "perigoContorno";

interface BotaoProps {
  titulo: string;
  onPress: () => void;
  variante?: VarianteBotao;
  icone?: NomeIcone;
  carregando?: boolean;
  // texto ao lado do indicador enquanto carrega; sem ele, só o indicador
  textoCarregando?: string;
  desabilitado?: boolean;
  estilo?: ViewStyle;
}

const ESTILO_BOTAO: Record<
  VarianteBotao,
  { fundo: string; texto: string; borda: string }
> = {
  primario: {
    fundo: cores.primaria,
    texto: cores.sobrePrimaria,
    borda: cores.primaria,
  },
  // Entrar, Criar conta, Recuperar senha (docs/07, tabela de botões)
  acesso: {
    fundo: cores.azulProfundo,
    texto: cores.whiteLilac,
    borda: cores.azulProfundo,
  },
  contorno: {
    fundo: cores.superficie,
    texto: cores.primaria,
    borda: cores.primaria,
  },
  suave: {
    fundo: cores.primariaSuave,
    texto: cores.primaria,
    borda: cores.primariaSuave,
  },
  perigo: {
    fundo: cores.perigo,
    texto: cores.sobrePrimaria,
    borda: cores.perigo,
  },
  perigoContorno: {
    fundo: cores.superficie,
    texto: cores.perigo,
    borda: cores.perigo,
  },
};

export function Botao({
  titulo,
  onPress,
  variante = "primario",
  icone,
  carregando = false,
  textoCarregando,
  desabilitado = false,
  estilo,
}: BotaoProps) {
  const v = ESTILO_BOTAO[variante];
  const inativo = desabilitado || carregando;

  return (
    <Pressable
      onPress={onPress}
      disabled={inativo}
      accessibilityRole="button"
      accessibilityLabel={carregando && textoCarregando ? textoCarregando : titulo}
      accessibilityState={{ disabled: inativo, busy: carregando }}
      style={({ pressed }) => [
        e.botao,
        {
          backgroundColor:
            pressed && variante === "primario"
              ? cores.primariaPressionada
              : v.fundo,
          borderColor: v.borda,
          opacity: inativo ? 0.5 : pressed && variante !== "primario" ? 0.8 : 1,
        },
        estilo,
      ]}
    >
      {carregando && textoCarregando ? (
        <View style={e.botaoConteudo}>
          <ActivityIndicator color={v.texto} />
          <Text style={[e.botaoTexto, { color: v.texto }]}>{textoCarregando}</Text>
        </View>
      ) : carregando ? (
        <ActivityIndicator color={v.texto} />
      ) : (
        <View style={e.botaoConteudo}>
          {!!icone && <Ionicons name={icone} size={18} color={v.texto} />}
          <Text style={[e.botaoTexto, { color: v.texto }]}>{titulo}</Text>
        </View>
      )}
    </Pressable>
  );
}

// Link de texto, como "Esqueci a senha". Mantém a área tocável mínima.
export function Link({
  titulo,
  onPress,
  alinhamento = "center",
}: {
  titulo: string;
  onPress: () => void;
  alinhamento?: "center" | "flex-end" | "flex-start";
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="link"
      style={({ pressed }) => [
        e.link,
        { alignSelf: alinhamento, opacity: pressed ? 0.6 : 1 },
      ]}
    >
      <Text style={e.linkTexto}>{titulo}</Text>
    </Pressable>
  );
}

// --------------------------------------------------- rolagem de formulário

/**
 * Rolagem das telas com campo de texto.
 *
 * O app desenha atrás das barras do sistema (edge-to-edge, obrigatório no
 * Android desde o Expo SDK 54), e por isso o Android não encolhe mais a
 * janela quando o teclado abre. O KeyboardAvoidingView devolve esse espaço:
 * a rolagem diminui, e o campo em foco e o botão logo abaixo dele continuam
 * visíveis.
 */
export function RolagemDeFormulario({
  ref,
  children,
  ...props
}: ScrollViewProps & { ref?: React.Ref<ScrollView> }) {
  return (
    <KeyboardAvoidingView behavior="padding" style={{ flex: 1 }}>
      <ScrollView ref={ref} keyboardShouldPersistTaps="handled" {...props}>
        {children}
      </ScrollView>
    </KeyboardAvoidingView>
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
  erro?: string | null;
  multilinha?: boolean;
  icone?: NomeIcone;
  // a tela pode reagir ao foco (rolar até o botão) e à saída do campo
  // (consultar um serviço com o valor digitado)
  onFocar?: () => void;
  onDesfocar?: () => void;
  // com ação, o ícone vira botão (ex.: abrir a câmera) e precisa de rótulo
  onPressIcone?: () => void;
  rotuloIcone?: string;
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
  erro,
  multilinha = false,
  icone,
  onFocar,
  onDesfocar,
  onPressIcone,
  rotuloIcone,
}: CampoProps) {
  const [focado, setFocado] = React.useState(false);

  return (
    <View style={e.campoGrupo}>
      <Text style={e.campoRotulo}>
        {rotulo}
        {obrigatorio ? " *" : ""}
      </Text>
      <View
        style={[
          e.campo,
          focado && e.campoFocado,
          !!erro && e.campoErro,
          multilinha && { minHeight: 88, alignItems: "flex-start" },
        ]}
      >
        <TextInput
          value={valor}
          onChangeText={onChangeText}
          onFocus={() => {
            setFocado(true);
            onFocar?.();
          }}
          onBlur={() => {
            setFocado(false);
            onDesfocar?.();
          }}
          placeholder={placeholder}
          placeholderTextColor={cores.textoSuave}
          keyboardType={tipoTeclado}
          autoCapitalize={
            tipoTeclado === "email-address" || senha ? "none" : "sentences"
          }
          secureTextEntry={senha}
          multiline={multilinha}
          accessibilityLabel={obrigatorio ? `${rotulo}, obrigatório` : rotulo}
          accessibilityHint={erro ?? ajuda}
          style={[
            e.campoTexto,
            multilinha && { textAlignVertical: "top", paddingTop: 12 },
          ]}
        />
        {!!icone && onPressIcone ? (
          <Pressable
            onPress={onPressIcone}
            accessibilityRole="button"
            accessibilityLabel={rotuloIcone ?? "Ação do campo"}
            hitSlop={12}
            style={({ pressed }) => [e.campoBotaoIcone, pressed && { opacity: 0.6 }]}
          >
            <Ionicons name={icone} size={22} color={cores.primaria} />
          </Pressable>
        ) : (
          !!icone && (
            <Ionicons
              name={icone}
              size={20}
              color={cores.textoSuave}
              accessibilityElementsHidden
              importantForAccessibility="no"
            />
          )
        )}
      </View>
      {erro ? (
        <Text style={e.campoErroTexto} accessibilityLiveRegion="polite">
          {erro}
        </Text>
      ) : (
        !!ajuda && <Text style={e.campoAjuda}>{ajuda}</Text>
      )}
    </View>
  );
}

export function CampoBusca({
  valor,
  onChangeText,
  placeholder,
  rotuloAcessivel,
  acao,
}: {
  valor: string;
  onChangeText: (t: string) => void;
  placeholder: string;
  rotuloAcessivel: string;
  // botão à direita, como a câmera para ler o código
  acao?: { icone: NomeIcone; rotulo: string; onPress: () => void };
}) {
  return (
    <View style={e.busca}>
      <Ionicons name="search" size={18} color={cores.textoSuave} />
      <TextInput
        value={valor}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={cores.textoSuave}
        accessibilityLabel={rotuloAcessivel}
        style={e.buscaTexto}
      />
      {acao && (
        <Pressable
          onPress={acao.onPress}
          accessibilityRole="button"
          accessibilityLabel={acao.rotulo}
          hitSlop={12}
          style={({ pressed }) => [e.campoBotaoIcone, pressed && { opacity: 0.6 }]}
        >
          <Ionicons name={acao.icone} size={22} color={cores.primaria} />
        </Pressable>
      )}
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

export function TituloSecao({ texto }: { texto: string }) {
  return (
    <Text style={e.tituloSecao} accessibilityRole="header">
      {texto}
    </Text>
  );
}

// ------------------------------------------------- seleção: chip e abas

export function Chip({
  rotulo,
  ativo,
  onPress,
  papel = "radio",
}: {
  rotulo: string;
  ativo: boolean;
  onPress: () => void;
  papel?: "radio" | "button";
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole={papel}
      accessibilityState={papel === "radio" ? { checked: ativo } : { selected: ativo }}
      style={({ pressed }) => [
        e.chip,
        ativo && e.chipAtivo,
        pressed && { opacity: 0.8 },
      ]}
    >
      <Text style={[e.chipTexto, ativo && e.chipTextoAtivo]}>{rotulo}</Text>
    </Pressable>
  );
}

// Controle segmentado, como Entrada/Saída. O estado ativo tem fundo,
// cor de texto e peso diferentes, não só cor.
export function Segmentado<T extends string>({
  opcoes,
  valor,
  onChange,
}: {
  opcoes: { valor: T; rotulo: string }[];
  valor: T;
  onChange: (v: T) => void;
}) {
  return (
    <View style={e.segmentado} accessibilityRole="tablist">
      {opcoes.map((o) => {
        const ativo = o.valor === valor;
        return (
          <Pressable
            key={o.valor}
            onPress={() => onChange(o.valor)}
            accessibilityRole="tab"
            accessibilityState={{ selected: ativo }}
            style={[e.segmento, ativo && e.segmentoAtivo]}
          >
            <Text style={[e.segmentoTexto, ativo && e.segmentoTextoAtivo]}>
              {o.rotulo}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

// ------------------------------------------------- badges e miniaturas

// mostra texto além da cor, para não depender só dela
export function EtiquetaSituacao({ situacao }: { situacao: SituacaoEstoque }) {
  const c = CORES_SITUACAO[situacao];
  return (
    <Selo
      texto={ROTULO_SITUACAO_CURTO[situacao]}
      fundo={c.fundo}
      cor={c.texto}
      rotuloAcessivel={ROTULO_SITUACAO[situacao]}
    />
  );
}

export function Selo({
  texto,
  fundo,
  cor = cores.sobrePrimaria,
  rotuloAcessivel,
}: {
  texto: string;
  fundo: string;
  cor?: string;
  rotuloAcessivel?: string;
}) {
  return (
    <View
      style={[e.selo, { backgroundColor: fundo }]}
      accessible
      accessibilityLabel={rotuloAcessivel ?? texto}
    >
      <Text style={[e.seloTexto, { color: cor }]}>{texto}</Text>
    </View>
  );
}

// Quadrado com a inicial, no lugar da foto do produto.
export function Miniatura({
  texto,
  icone,
  tamanho = 40,
}: {
  texto?: string;
  icone?: NomeIcone;
  tamanho?: number;
}) {
  return (
    <View
      style={[e.miniatura, { width: tamanho, height: tamanho }]}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    >
      {icone ? (
        <Ionicons name={icone} size={tamanho * 0.5} color={cores.primaria} />
      ) : (
        <Text style={e.miniaturaTexto}>
          {(texto ?? "?").trim().charAt(0).toUpperCase()}
        </Text>
      )}
    </View>
  );
}

// ------------------------------------------------------------------ FAB

export function BotaoFlutuante({
  rotulo,
  onPress,
}: {
  rotulo: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={rotulo}
      style={({ pressed }) => [
        e.fab,
        pressed && { backgroundColor: cores.primariaPressionada },
      ]}
    >
      <Ionicons name="add" size={28} color={cores.sobrePrimaria} />
    </Pressable>
  );
}

// ------------------------------------------------------------------ avisos

const MAPA_AVISO = {
  info: { fundo: cores.primariaSuave, borda: cores.primaria, texto: cores.primariaPressionada },
  erro: { fundo: cores.perigoSuave, borda: cores.perigo, texto: cores.perigoTexto },
  atencao: { fundo: cores.avisoSuave, borda: cores.aviso, texto: cores.sobreAvisoSuave },
  sucesso: { fundo: cores.sucessoSuave, borda: cores.sucesso, texto: cores.sobreSucessoSuave },
} as const;

export function Aviso({
  texto,
  tipo = "info",
}: {
  texto: string;
  tipo?: keyof typeof MAPA_AVISO;
}) {
  const mapa = MAPA_AVISO[tipo];
  return (
    <View
      accessibilityRole="alert"
      style={[
        e.aviso,
        { backgroundColor: mapa.fundo, borderLeftColor: mapa.borda },
      ]}
    >
      <Text style={{ color: mapa.texto, fontSize: fonte.legenda, lineHeight: 19 }}>
        {texto}
      </Text>
    </View>
  );
}

export function ListaVazia({
  texto,
  icone = "file-tray-outline",
  acao,
}: {
  texto: string;
  icone?: NomeIcone;
  acao?: { titulo: string; onPress: () => void };
}) {
  return (
    <View style={e.vazio}>
      <Miniatura icone={icone} tamanho={56} />
      <Text style={[e.vazioTexto, { marginTop: espaco.md }]}>{texto}</Text>
      {acao && <Botao titulo={acao.titulo} onPress={acao.onPress} />}
    </View>
  );
}

export function Carregando({ texto = "Carregando..." }: { texto?: string }) {
  return (
    <View style={[e.vazio, { flex: 1, justifyContent: "center", backgroundColor: cores.fundo }]}>
      <ActivityIndicator size="large" color={cores.primaria} />
      <Text style={[e.vazioTexto, { marginTop: espaco.md }]}>{texto}</Text>
    </View>
  );
}

const e = StyleSheet.create({
  botao: {
    minHeight: ALVO_TOQUE,
    borderRadius: raio.padrao,
    borderWidth: 1.5,
    paddingHorizontal: espaco.lg,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: espaco.sm,
  },
  botaoConteudo: { flexDirection: "row", alignItems: "center", gap: espaco.sm },
  botaoTexto: { fontSize: fonte.botao, fontWeight: "800" },
  link: {
    minHeight: ALVO_TOQUE,
    justifyContent: "center",
    paddingHorizontal: espaco.xs,
  },
  linkTexto: { color: cores.primaria, fontSize: fonte.corpo - 1, fontWeight: "700" },
  campoGrupo: { marginBottom: espaco.md },
  campoRotulo: {
    fontSize: fonte.rotulo,
    fontWeight: "700",
    color: cores.texto,
    marginBottom: 6,
  },
  campo: {
    minHeight: ALVO_TOQUE,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: cores.bordaCampo,
    borderRadius: raio.padrao,
    paddingHorizontal: espaco.md,
    backgroundColor: cores.superficie,
    gap: espaco.sm,
  },
  campoFocado: { borderColor: cores.primaria, borderWidth: 1.5 },
  campoErro: { borderColor: cores.perigo, borderWidth: 1.5 },
  campoTexto: {
    flex: 1,
    minHeight: ALVO_TOQUE - 2,
    fontSize: fonte.corpo,
    color: cores.texto,
  },
  // área de toque do ícone-botão dentro do campo
  campoBotaoIcone: { minWidth: 36, minHeight: 36, alignItems: "center", justifyContent: "center" },
  campoAjuda: {
    fontSize: fonte.legenda - 1,
    color: cores.textoSuave,
    marginTop: espaco.xs,
  },
  campoErroTexto: {
    fontSize: fonte.legenda - 1,
    color: cores.perigoTexto,
    marginTop: espaco.xs,
    fontWeight: "600",
  },
  busca: {
    minHeight: ALVO_TOQUE,
    flexDirection: "row",
    alignItems: "center",
    gap: espaco.sm,
    borderWidth: 1,
    borderColor: cores.bordaCampo,
    borderRadius: raio.padrao,
    paddingHorizontal: espaco.md,
    backgroundColor: cores.superficie,
  },
  buscaTexto: { flex: 1, fontSize: fonte.corpo, color: cores.texto, minHeight: ALVO_TOQUE - 2 },
  cartao: {
    backgroundColor: cores.superficie,
    borderRadius: raio.padrao,
    padding: espaco.md,
    marginBottom: espaco.sm,
    borderWidth: 1,
    borderColor: cores.borda,
  },
  tituloSecao: {
    fontSize: fonte.corpo + 1,
    fontWeight: "800",
    color: cores.texto,
    marginBottom: espaco.sm,
  },
  chip: {
    minHeight: ALVO_TOQUE,
    justifyContent: "center",
    paddingHorizontal: espaco.md,
    borderRadius: raio.completo,
    backgroundColor: cores.superficie,
    borderWidth: 1,
    borderColor: cores.borda,
  },
  chipAtivo: { backgroundColor: cores.primaria, borderColor: cores.primaria },
  chipTexto: { fontSize: fonte.legenda, color: cores.texto, fontWeight: "500" },
  chipTextoAtivo: { color: cores.sobrePrimaria, fontWeight: "700" },
  segmentado: {
    flexDirection: "row",
    backgroundColor: cores.primariaSuave,
    borderRadius: raio.padrao,
    padding: 4,
    marginBottom: espaco.md,
  },
  segmento: {
    flex: 1,
    minHeight: ALVO_TOQUE,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: raio.padrao - 2,
  },
  segmentoAtivo: { backgroundColor: cores.primaria },
  // texto suave sobre o fundo azul claro daria 4,46:1
  segmentoTexto: { fontSize: fonte.corpo - 1, fontWeight: "600", color: cores.texto },
  segmentoTextoAtivo: { color: cores.sobrePrimaria, fontWeight: "800" },
  selo: {
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: raio.completo,
  },
  seloTexto: { fontSize: fonte.badge, fontWeight: "700" },
  miniatura: {
    borderRadius: raio.miniatura,
    backgroundColor: cores.primariaSuave,
    alignItems: "center",
    justifyContent: "center",
  },
  miniaturaTexto: { color: cores.primaria, fontWeight: "800", fontSize: 16 },
  fab: {
    position: "absolute",
    right: 16,
    bottom: 16,
    width: 56,
    height: 56,
    borderRadius: raio.grande,
    backgroundColor: cores.primaria,
    alignItems: "center",
    justifyContent: "center",
    elevation: 6,
    shadowColor: cores.primaria,
    shadowOpacity: 0.35,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
  aviso: {
    padding: espaco.md,
    borderRadius: raio.padrao,
    borderLeftWidth: 4,
    marginBottom: espaco.md,
  },
  vazio: { padding: espaco.xl, alignItems: "center" },
  vazioTexto: {
    fontSize: fonte.corpo,
    color: cores.textoSuave,
    textAlign: "center",
    marginBottom: espaco.md,
  },
});
