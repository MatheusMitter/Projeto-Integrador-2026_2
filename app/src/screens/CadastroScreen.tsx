import React, { useState } from "react";
import { ScrollView, StyleSheet, Text } from "react-native";
import { Aviso, Botao, Campo } from "../components/base";
import { cadastrar } from "../services/authService";
import { cores, espaco, fonte } from "../theme/tema";

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
    } finally {
      setCarregando(false);
    }
  }

  return (
    <ScrollView
      contentContainerStyle={e.conteudo}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={e.titulo}>Criar conta</Text>

      {!!erro && <Aviso texto={erro} tipo="erro" />}

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
          "O perfil de acesso não é escolhido no cadastro. O primeiro usuário " +
          "da loja é o proprietário; as contas criadas depois entram como " +
          "operador e não veem custo, margem nem valor do estoque. Só um " +
          "proprietário pode alterar o perfil de outra pessoa."
        }
      />

      <Botao titulo="Criar conta" onPress={criar} carregando={carregando} />
      <Botao titulo="Já tenho conta" variante="secundario" onPress={voltar} />
    </ScrollView>
  );
}

const e = StyleSheet.create({
  conteudo: { padding: espaco.lg, backgroundColor: cores.branco, flexGrow: 1 },
  titulo: {
    fontSize: fonte.tituloGrande,
    fontWeight: "700",
    color: cores.cinza900,
    marginBottom: espaco.lg,
  },
});
