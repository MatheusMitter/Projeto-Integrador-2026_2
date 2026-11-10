// Recuperação de senha. O envio do e-mail depende do servidor, que ainda
// não existe; a tela já valida o endereço e diz isso com clareza, em vez de
// fingir que mandou um link.

import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  Aviso,
  Botao,
  Campo,
  Cartao,
  Link,
  Miniatura,
  RolagemDeFormulario,
} from "../components/base";
import { CabecalhoVoltar } from "../components/CabecalhoVoltar";
import { emailValido } from "../services/regras";
import { cores, espaco, fonte } from "../theme/tema";

export default function RecuperarSenhaScreen({ voltar }: { voltar: () => void }) {
  const [email, setEmail] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [pedido, setPedido] = useState(false);

  function enviar() {
    if (!emailValido(email)) {
      setErro("Informe um e-mail válido.");
      return;
    }
    setErro(null);
    setPedido(true);
  }

  return (
    <SafeAreaView style={e.tela}>
      <CabecalhoVoltar titulo="Recuperar senha" voltar={voltar} />
      <RolagemDeFormulario
        contentContainerStyle={e.conteudo}
      >
        <Cartao estilo={e.explicacao}>
          <Miniatura icone="mail" tamanho={56} />
          <Text style={e.explicacaoTitulo}>Informe seu e-mail</Text>
          <Text style={e.explicacaoTexto}>
            Enviaremos um link para você criar uma nova senha.
          </Text>
        </Cartao>

        <Campo
          rotulo="E-mail"
          valor={email}
          onChangeText={(t) => {
            setEmail(t);
            setErro(null);
            setPedido(false);
          }}
          placeholder="seu@email.com"
          tipoTeclado="email-address"
          erro={erro}
        />

        {/* A resposta é a mesma, exista ou não a conta, para a tela não
            servir de consulta de e-mails cadastrados. */}
        {pedido && (
          <Aviso
            tipo="info"
            texto={
              "O envio do link depende do servidor, que ainda não está ligado " +
              "a esta versão do aplicativo. Nenhum e-mail foi enviado."
            }
          />
        )}

        <Botao titulo="Enviar link" onPress={enviar} />
        <View style={{ alignItems: "center" }}>
          <Link titulo="Voltar ao login" onPress={voltar} />
        </View>
      </RolagemDeFormulario>
    </SafeAreaView>
  );
}

const e = StyleSheet.create({
  tela: { flex: 1, backgroundColor: cores.fundo },
  conteudo: {
    padding: espaco.lg,
    paddingTop: espaco.sm,
    width: "100%",
    maxWidth: 480,
    alignSelf: "center",
  },
  explicacao: {
    alignItems: "center",
    paddingVertical: espaco.xl,
    marginBottom: espaco.lg,
  },
  explicacaoTitulo: {
    fontSize: fonte.corpo + 1,
    fontWeight: "800",
    color: cores.texto,
    marginTop: espaco.md,
  },
  explicacaoTexto: {
    fontSize: fonte.legenda,
    color: cores.textoSuave,
    textAlign: "center",
    marginTop: espaco.xs,
    lineHeight: 19,
  },
});
