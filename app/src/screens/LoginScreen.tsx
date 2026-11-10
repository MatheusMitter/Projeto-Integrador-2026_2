import { useRef, useState } from "react";
import {
  type ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  Botao,
  Campo,
  Link,
  RolagemDeFormulario,
} from "../components/base";
import { FundoMarca } from "../components/FundoMarca";
import { entrar } from "../services/authService";
import { cores, espaco, fonte } from "../theme/tema";

interface Props {
  onEntrou: () => void;
  irParaCadastro: () => void;
  irParaRecuperar: () => void;
}

export default function LoginScreen({
  onEntrou,
  irParaCadastro,
  irParaRecuperar,
}: Props) {
  // O card vai do fim do bloco da marca até o rodapé. A altura é fixada em
  // vez de esticada por flex: assim o conteúdo não encolhe quando o teclado
  // abre, e a rolagem leva o campo em foco e o botão para cima dele.
  const { height } = useWindowDimensions();
  const alturaCard = Math.max(height - ALTURA_MARCA, 420);
  // Com o teclado aberto o Android não rola sozinho até o campo; a tela
  // rola até o fim, o que deixa os dois campos e o botão Entrar visíveis.
  const rolagem = useRef<ScrollView>(null);
  const mostrarFormulario = () =>
    setTimeout(() => rolagem.current?.scrollToEnd({ animated: true }), 80);

  // Campos começam vazios de propósito. A senha da carga inicial não é
  // impressa na tela: o esquema e as credenciais de teste estão em
  // docs/02-modelagem-de-dados.md e em app/README.md.
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erroEmail, setErroEmail] = useState<string | null>(null);
  const [erroSenha, setErroSenha] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(false);

  async function autenticar() {
    const faltaEmail = email.trim().length === 0;
    const faltaSenha = senha.length === 0;
    setErroEmail(faltaEmail ? "Informe o e-mail." : null);
    setErroSenha(faltaSenha ? "Informe a senha." : null);
    if (faltaEmail || faltaSenha) return;

    setCarregando(true);
    try {
      const r = await entrar(email, senha);
      if (r.sucesso) onEntrou();
      // a mensagem não diz qual dos dois errou, para não revelar quais
      // e-mails têm conta; fica sob a senha, que é onde o olho termina
      else setErroSenha(r.mensagem ?? "Não foi possível entrar.");
    } catch {
      setErroSenha("Erro ao acessar os dados locais. Tente novamente.");
    } finally {
      setCarregando(false);
    }
  }

  return (
    <FundoMarca>
      <SafeAreaView style={e.tela}>
        <RolagemDeFormulario ref={rolagem} contentContainerStyle={e.conteudo}>
          <View style={e.marca}>
            <Text style={e.nome} accessibilityRole="header">
              StockEasy
            </Text>
            <Text style={e.frase}>Controle de estoque inteligente</Text>
          </View>

          <View style={[e.card, { minHeight: alturaCard }]}>
            <Text style={e.titulo} accessibilityRole="header">
              Entrar
            </Text>
            <Text style={e.apoio}>Use o e-mail e a senha da sua conta</Text>

            <Campo
              rotulo="E-mail"
              valor={email}
              onChangeText={(t) => {
                setEmail(t);
                setErroEmail(null);
              }}
              placeholder="seu@email.com"
              tipoTeclado="email-address"
              erro={erroEmail}
              onFocar={mostrarFormulario}
            />
            <Campo
              rotulo="Senha"
              valor={senha}
              onChangeText={(t) => {
                setSenha(t);
                setErroSenha(null);
              }}
              placeholder="Sua senha"
              senha
              erro={erroSenha}
              onFocar={mostrarFormulario}
            />

            <Link
              titulo="Esqueci a senha"
              onPress={irParaRecuperar}
              alinhamento="flex-end"
            />
            <Botao
              titulo="Entrar"
              variante="acesso"
              onPress={autenticar}
              carregando={carregando}
            />
            <Link titulo="Não tem conta? Criar conta" onPress={irParaCadastro} />
          </View>
        </RolagemDeFormulario>
      </SafeAreaView>
    </FundoMarca>
  );
}

// No desenho aprovado o card começa a 250 de uma tela de 780.
const ALTURA_MARCA = 250;

const e = StyleSheet.create({
  tela: { flex: 1 },
  conteudo: {
    paddingHorizontal: espaco.md,
    width: "100%",
    maxWidth: 480,
    alignSelf: "center",
  },
  marca: { paddingHorizontal: espaco.sm, paddingTop: espaco.xl, height: ALTURA_MARCA - espaco.xl },
  nome: { fontSize: fonte.destaque, fontWeight: "800", color: cores.whiteLilac },
  frase: { fontSize: fonte.corpo, color: cores.azulClaro, marginTop: 2 },
  // O card vai até o fim da tela: cantos arredondados só em cima.
  card: {
    backgroundColor: cores.whiteLilac,
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    paddingHorizontal: espaco.lg,
    paddingTop: espaco.xl,
    paddingBottom: espaco.lg,
    elevation: 12,
    shadowColor: cores.azulNoite,
    shadowOpacity: 0.35,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: -6 },
  },
  titulo: { fontSize: fonte.titulo, fontWeight: "800", color: cores.texto },
  apoio: {
    fontSize: fonte.rotulo,
    color: cores.textoSuave,
    marginTop: 2,
    marginBottom: espaco.lg,
  },
});
