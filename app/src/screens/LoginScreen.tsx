import React, { useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { Aviso, Botao, Campo } from "../components/base";
import { entrar } from "../services/authService";
import { cores, espaco, fonte, raio } from "../theme/tema";

interface Props {
  onEntrou: () => void;
  irParaCadastro: () => void;
}

export default function LoginScreen({ onEntrou, irParaCadastro }: Props) {
  // Pré-preenchido para a demonstração. As credenciais são as da carga
  // inicial do banco, documentada em docs/checkpoint1-der-modelagem.md.
  const [email, setEmail] = useState("proprietario@stockeasy.com");
  const [senha, setSenha] = useState("admin123");
  const [erro, setErro] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(false);

  async function autenticar() {
    setErro(null);
    setCarregando(true);
    try {
      const r = await entrar(email, senha);
      if (r.sucesso) onEntrou();
      else setErro(r.mensagem ?? "Não foi possível entrar.");
    } catch {
      setErro("Erro ao acessar os dados locais. Tente novamente.");
    } finally {
      setCarregando(false);
    }
  }

  return (
    <ScrollView contentContainerStyle={e.conteudo} keyboardShouldPersistTaps="handled">
      <View style={e.marca} accessible accessibilityLabel="StockEasy">
        <Text style={e.marcaLetra}>S</Text>
      </View>
      <Text style={e.titulo}>StockEasy</Text>
      <Text style={e.subtitulo}>Controle de Estoque Inteligente</Text>

      <View style={e.formulario}>
        {!!erro && <Aviso texto={erro} tipo="erro" />}

        <Campo
          rotulo="E-mail"
          valor={email}
          onChangeText={setEmail}
          placeholder="seu@email.com"
          tipoTeclado="email-address"
          obrigatorio
        />
        <Campo
          rotulo="Senha"
          valor={senha}
          onChangeText={setSenha}
          placeholder="Sua senha"
          senha
          obrigatorio
        />

        <Botao
          titulo="Entrar"
          onPress={autenticar}
          carregando={carregando}
        />
        <Botao
          titulo="Criar nova conta"
          variante="secundario"
          onPress={irParaCadastro}
        />

        <Aviso
          tipo="info"
          texto={
            "Dois perfis disponíveis nesta versão. " +
            "proprietario@stockeasy.com tem acesso completo. " +
            "operador@stockeasy.com não vê custo, margem nem valor do estoque, " +
            "conforme a regra RN01. Senha de ambos: admin123."
          }
        />
      </View>
    </ScrollView>
  );
}

const e = StyleSheet.create({
  conteudo: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: espaco.lg,
    backgroundColor: cores.branco,
  },
  marca: {
    width: 80,
    height: 80,
    borderRadius: raio.completo,
    backgroundColor: cores.primaria,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: espaco.lg,
  },
  marcaLetra: { color: cores.branco, fontSize: 32, fontWeight: "700" },
  titulo: {
    fontSize: fonte.tituloGrande,
    fontWeight: "700",
    color: cores.primariaEscura,
  },
  subtitulo: {
    fontSize: fonte.corpo,
    color: cores.cinza600,
    marginBottom: espaco.xl,
  },
  formulario: { width: "100%", maxWidth: 400 },
});
