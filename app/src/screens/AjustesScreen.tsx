// Ajustes: perfil, cadastros auxiliares, sincronização, avisos e saída. A
// sincronização segue o desenho aprovado em 05/11 (item 01 da 4.3.2): o
// botão fica no cartão do estado que ele muda, e "Sair" fica sozinho no fim.
// O cartão "Avisos" segue o desenho da Fase 5 (item 01), aprovado em 05/11.

import { useCallback, useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Switch, Text, View } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { Aviso, Botao, Cartao, Segmentado, type NomeIcone } from "../components/base";
import type { TelaAjustes } from "../navigation/rotas";
import { useSessao } from "../navigation/sessao";
import { sessaoAtual } from "../services/authService";
import {
  atualizarResumoDiario,
  desligarNotificacoes,
  ligarNotificacoes,
  semEsperar,
} from "../services/notificacoesService";
import {
  gravarPrazoVencimento,
  notificacoesLigadas,
  prazoVencimento,
} from "../services/preferenciaService";
import {
  DIAS_ALERTA_VENCIMENTO,
  PRAZOS_VENCIMENTO,
  type PrazoVencimento,
} from "../services/regras";
import {
  aoTerminarSincronizacao,
  avisoDoResultado,
  descricaoDaSincronizacao,
  estadoDaSincronizacao,
  sincronizar,
  type AvisoDeTela,
  type EstadoDaSincronizacao,
} from "../services/sincronizacaoService";
import { ALVO_TOQUE, cores, espaco, fonte } from "../theme/tema";
import appConfig from "../../app.json";

function iconeDaSincronizacao(estado: EstadoDaSincronizacao | null): NomeIcone {
  if (!estado || !estado.temConta) return "cloud-offline-outline";
  return estado.pendentes > 0 ? "cloud-upload-outline" : "cloud-done-outline";
}

function iniciais(nome: string): string {
  const partes = nome.trim().split(/\s+/);
  const primeira = partes[0]?.charAt(0) ?? "";
  const ultima = partes.length > 1 ? partes[partes.length - 1].charAt(0) : "";
  return (primeira + ultima).toUpperCase();
}

export default function AjustesScreen({ navigation }: TelaAjustes<"AjustesInicio">) {
  const { sair } = useSessao();
  const usuario = sessaoAtual();
  const [estado, setEstado] = useState<EstadoDaSincronizacao | null>(null);
  const [falhaEstado, setFalhaEstado] = useState(false);
  const [sincronizando, setSincronizando] = useState(false);
  const [resultado, setResultado] = useState<AvisoDeTela | null>(null);
  // avisos (R8b, US14): null enquanto lê a preferência
  const [notificacoes, setNotificacoes] = useState<boolean | null>(null);
  const [mudandoNotificacoes, setMudandoNotificacoes] = useState(false);
  const [prazo, setPrazo] = useState<PrazoVencimento>(DIAS_ALERTA_VENCIMENTO);
  const [avisoAvisos, setAvisoAvisos] = useState<AvisoDeTela | null>(null);

  const carregarEstado = useCallback(() => {
    estadoDaSincronizacao()
      .then((e) => {
        setEstado(e);
        setFalhaEstado(false);
      })
      .catch(() => setFalhaEstado(true));
    Promise.all([notificacoesLigadas(), prazoVencimento()])
      .then(([ligadas, dias]) => {
        setNotificacoes(ligadas);
        setPrazo(dias);
      })
      .catch(() => setNotificacoes(false));
  }, []);

  // Ligar pede a permissão do Android na primeira vez; negada, o
  // interruptor volta e o aviso explica onde liberar.
  async function alternarNotificacoes(ligar: boolean) {
    setMudandoNotificacoes(true);
    setAvisoAvisos(null);
    try {
      if (ligar) {
        const permitido = await ligarNotificacoes();
        setNotificacoes(permitido);
        if (!permitido) {
          setAvisoAvisos({
            tipo: "atencao",
            texto:
              "O Android não permitiu as notificações do StockEasy. Para ligar, libere em " +
              "Configurações, Apps, StockEasy, Notificações.",
          });
        }
      } else {
        await desligarNotificacoes();
        setNotificacoes(false);
      }
    } catch {
      setAvisoAvisos({ tipo: "erro", texto: "Não foi possível mudar as notificações. Tente de novo." });
    } finally {
      setMudandoNotificacoes(false);
    }
  }

  async function escolherPrazo(dias: PrazoVencimento) {
    setPrazo(dias);
    try {
      await gravarPrazoVencimento(dias);
      semEsperar(atualizarResumoDiario());
    } catch {
      setAvisoAvisos({ tipo: "erro", texto: "Não foi possível salvar o prazo. Tente de novo." });
    }
  }

  // recarrega ao abrir a aba e quando uma sincronização termina, inclusive a
  // disparada sozinha em segundo plano. Se houver aviso na tela, ele passa a
  // mostrar o resultado mais novo, senão "Sem internet agora" ficaria ao
  // lado de "Tudo enviado".
  useFocusEffect(
    useCallback(() => {
      carregarEstado();
      return aoTerminarSincronizacao((r) => {
        setResultado((atual) => (atual ? avisoDoResultado(r) : null));
        carregarEstado();
      });
    }, [carregarEstado]),
  );

  async function sincronizarAgora() {
    setSincronizando(true);
    setResultado(null);
    try {
      setResultado(avisoDoResultado(await sincronizar()));
    } finally {
      setSincronizando(false);
      carregarEstado();
    }
  }

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
          icone={iconeDaSincronizacao(estado)}
          titulo="Sincronização"
          descricao={
            falhaEstado
              ? "Não foi possível verificar a sincronização deste aparelho."
              : estado === null
                ? "Verificando..."
                : descricaoDaSincronizacao(estado)
          }
          ultima
        />
        {/* sem conta no servidor não há para onde enviar: a frase explica */}
        {estado?.temConta && (
          <Botao
            titulo="Sincronizar agora"
            textoCarregando="Sincronizando..."
            variante="suave"
            icone="sync-outline"
            carregando={sincronizando}
            onPress={sincronizarAgora}
            estilo={e.botaoNoCartao}
          />
        )}
      </Cartao>
      {resultado && <Aviso tipo={resultado.tipo} texto={resultado.texto} />}

      <Cartao estilo={e.grupo}>
        {/* a linha inteira liga e desliga, com área de toque de 48 dp */}
        <Pressable
          onPress={() => alternarNotificacoes(!notificacoes)}
          disabled={notificacoes === null || mudandoNotificacoes}
          accessibilityRole="switch"
          accessibilityLabel="Notificações"
          accessibilityHint="Avisa estoque crítico na hora e, às 9h, os produtos perto do vencimento"
          accessibilityState={{
            checked: notificacoes === true,
            disabled: notificacoes === null || mudandoNotificacoes,
          }}
          style={({ pressed }) => [e.linha, { borderBottomWidth: 0 }, pressed && { opacity: 0.6 }]}
        >
          <Ionicons
            name={notificacoes ? "notifications-outline" : "notifications-off-outline"}
            size={22}
            color={cores.primaria}
          />
          <View style={{ flex: 1 }}>
            <Text style={e.linhaTitulo}>Notificações</Text>
            <Text style={e.meta}>
              Avisa estoque crítico na hora e, às 9h, os produtos perto do vencimento, mesmo com o
              app fechado.
            </Text>
          </View>
          <Switch
            value={notificacoes === true}
            onValueChange={alternarNotificacoes}
            disabled={notificacoes === null || mudandoNotificacoes}
            trackColor={{ false: cores.bordaCampo, true: cores.primaria }}
            thumbColor={cores.fundo}
            accessibilityElementsHidden
            importantForAccessibility="no-hide-descendants"
          />
        </Pressable>
        <Text style={e.subtitulo}>Prazo do alerta de vencimento</Text>
        <Segmentado
          opcoes={PRAZOS_VENCIMENTO.map((d) => ({ valor: String(d), rotulo: `${d} dias` }))}
          valor={String(prazo)}
          onChange={(v) => escolherPrazo(Number(v) as PrazoVencimento)}
        />
      </Cartao>
      {avisoAvisos && <Aviso tipo={avisoAvisos.tipo} texto={avisoAvisos.texto} />}

      <Cartao estilo={e.grupo}>
        <Linha
          icone="information-circle-outline"
          titulo="Versão do aplicativo"
          descricao={appConfig.expo.version}
          ultima
        />
      </Cartao>

      {/* sozinho no fim, com espaço, para ninguém sair da conta sem querer */}
      <Botao
        titulo="Sair"
        variante="perigoContorno"
        icone="log-out-outline"
        onPress={confirmarSaida}
        estilo={{ marginTop: espaco.xl }}
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
  botaoNoCartao: { marginBottom: espaco.md },
  subtitulo: {
    fontSize: fonte.legenda,
    color: cores.textoSuave,
    marginBottom: espaco.sm,
  },
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
