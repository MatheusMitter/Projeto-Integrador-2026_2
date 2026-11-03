import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  Botao,
  Campo,
  Link,
  RolagemDeFormulario,
} from "../components/base";
import { entrar } from "../services/authService";
import { cores, espaco, fonte, raio } from "../theme/tema";

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
    <SafeAreaView style={e.tela}>
      <RolagemDeFormulario
        contentContainerStyle={e.conteudo}
      >
        <View style={e.marca} accessible accessibilityLabel="StockEasy">
          <Text style={e.marcaLetra}>SE</Text>
        </View>
        <Text style={e.titulo} accessibilityRole="header">
          StockEasy
        </Text>
        <Text style={e.subtitulo}>Controle de estoque inteligente</Text>

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
        />

        <Link
          titulo="Esqueci a senha"
          onPress={irParaRecuperar}
          alinhamento="flex-end"
        />
        <Botao titulo="Entrar" onPress={autenticar} carregando={carregando} />
        <Link titulo="Não tem conta? Criar conta" onPress={irParaCadastro} />
      </RolagemDeFormulario>
    </SafeAreaView>
  );
}

const e = StyleSheet.create({
  tela: { flex: 1, backgroundColor: cores.fundo },
  conteudo: {
    flexGrow: 1,
    justifyContent: "center",
    padding: espaco.lg,
    width: "100%",
    maxWidth: 480,
    alignSelf: "center",
  },
  marca: {
    width: 64,
    height: 64,
    borderRadius: raio.grande,
    backgroundColor: cores.primaria,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: espaco.md,
  },
  marcaLetra: { color: cores.sobrePrimaria, fontSize: 24, fontWeight: "800" },
  titulo: {
    fontSize: 28,
    fontWeight: "800",
    color: cores.texto,
  },
  subtitulo: {
    fontSize: fonte.corpo,
    color: cores.textoSuave,
    marginTop: 2,
    marginBottom: espaco.xl,
  },
});
