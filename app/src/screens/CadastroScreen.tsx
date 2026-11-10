import { useState } from "react";
import { StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  Aviso,
  Botao,
  Campo,
  Link,
  RolagemDeFormulario,
} from "../components/base";
import { CabecalhoVoltar } from "../components/CabecalhoVoltar";
import { cadastrar } from "../services/authService";
import { cores, espaco } from "../theme/tema";

interface Props {
  onCadastrou: () => void;
  voltar: () => void;
}

export default function CadastroScreen({ onCadastrou, voltar }: Props) {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmacao, setConfirmacao] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(false);

  async function criar() {
    setErro(null);
    setCarregando(true);
    try {
      const r = await cadastrar({ nome, email, senha, confirmacao });
      if (r.sucesso) onCadastrou();
      else setErro(r.mensagem ?? "Não foi possível criar a conta.");
    } catch {
      setErro("Erro ao acessar os dados locais. Tente novamente.");
    } finally {
      setCarregando(false);
    }
  }

  return (
    <SafeAreaView style={e.tela}>
      <CabecalhoVoltar titulo="Criar conta" voltar={voltar} />
      <RolagemDeFormulario
        contentContainerStyle={e.conteudo}
      >
        <Campo
          rotulo="Nome completo"
          valor={nome}
          onChangeText={setNome}
          obrigatorio
        />
        <Campo
          rotulo="E-mail"
          valor={email}
          onChangeText={setEmail}
          tipoTeclado="email-address"
          placeholder="seu@email.com"
          obrigatorio
        />
        <Campo
          rotulo="Senha"
          valor={senha}
          onChangeText={setSenha}
          senha
          obrigatorio
          ajuda="No mínimo 8 caracteres, com letras e números."
        />
        <Campo
          rotulo="Confirmar senha"
          valor={confirmacao}
          onChangeText={setConfirmacao}
          senha
          obrigatorio
        />

        {/* O perfil não é escolhido aqui de propósito: se fosse, bastaria ao
            operador criar uma conta de proprietário para contornar a RN01.
            Quem decide é o authService, pela posse da loja. */}
        <Aviso
          tipo="info"
          texto={
            "O primeiro usuário da loja é o proprietário. As contas criadas " +
            "depois entram como operador e não veem custo, margem nem valor " +
            "do estoque."
          }
        />

        {!!erro && <Aviso texto={erro} tipo="erro" />}
        <Botao titulo="Criar conta" onPress={criar} carregando={carregando} />
        <Link titulo="Já tenho conta" onPress={voltar} />
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
});
