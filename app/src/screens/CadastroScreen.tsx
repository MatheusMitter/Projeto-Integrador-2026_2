import React, { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Aviso, Botao, Campo } from "../components/base";
import { cadastrar } from "../services/authService";
import { TipoPerfil } from "../domain/tipos";
import { ALVO_TOQUE, cores, espaco, fonte, raio } from "../theme/tema";

interface Props {
  onCadastrou: () => void;
  voltar: () => void;
}

export default function CadastroScreen({ onCadastrou, voltar }: Props) {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmacao, setConfirmacao] = useState("");
  const [perfil, setPerfil] = useState<TipoPerfil>("PROPRIETARIO");
  const [erro, setErro] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(false);

  async function criar() {
    setErro(null);
    setCarregando(true);
    try {
      const r = await cadastrar({
        nome,
        email,
        senha,
        confirmacao,
        tipoPerfil: perfil,
      });
      if (r.sucesso) onCadastrou();
      else setErro(r.mensagem ?? "Não foi possível criar a conta.");
    } finally {
      setCarregando(false);
    }
  }

  return (
    <ScrollView contentContainerStyle={e.conteudo} keyboardShouldPersistTaps="handled">
      <Text style={e.titulo}>Criar conta</Text>

      {!!erro && <Aviso texto={erro} tipo="erro" />}

      <Campo rotulo="Nome completo" valor={nome} onChangeText={setNome} obrigatorio />
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

      <Text style={e.rotuloPerfil}>Perfil de acesso *</Text>
      {(
        [
          {
            valor: "PROPRIETARIO" as TipoPerfil,
            titulo: "Proprietário",
            desc: "Acesso completo, incluindo custo, margem e relatórios financeiros.",
          },
          {
            valor: "OPERADOR" as TipoPerfil,
            titulo: "Operador",
            desc: "Registra movimentação e consulta produtos, sem ver informação financeira.",
          },
        ]
      ).map((op) => {
        const ativo = perfil === op.valor;
        return (
          <Pressable
            key={op.valor}
            onPress={() => setPerfil(op.valor)}
            accessibilityRole="radio"
            accessibilityState={{ selected: ativo }}
            accessibilityLabel={`${op.titulo}. ${op.desc}`}
            style={[e.opcao, ativo && e.opcaoAtiva]}
          >
            {/* O estado não depende só da cor: há marca e negrito (RNF06) */}
            <Text style={[e.opcaoTitulo, ativo && e.opcaoTituloAtivo]}>
              {ativo ? "\u25CF " : "\u25CB "}
              {op.titulo}
            </Text>
            <Text style={e.opcaoDesc}>{op.desc}</Text>
          </Pressable>
        );
      })}

      <View style={{ marginTop: espaco.md }}>
        <Botao titulo="Criar conta" onPress={criar} carregando={carregando} />
        <Botao titulo="Já tenho conta" variante="secundario" onPress={voltar} />
      </View>
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
  rotuloPerfil: {
    fontSize: fonte.legenda,
    fontWeight: "600",
    color: cores.cinza700,
    marginBottom: espaco.sm,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  opcao: {
    minHeight: ALVO_TOQUE,
    borderWidth: 2,
    borderColor: cores.cinza300,
    borderRadius: raio.md,
    padding: espaco.md,
    marginBottom: espaco.sm,
  },
  opcaoAtiva: { borderColor: cores.primaria, backgroundColor: cores.primariaClara },
  opcaoTitulo: { fontSize: fonte.corpo, color: cores.cinza900 },
  opcaoTituloAtivo: { fontWeight: "700", color: cores.primariaEscura },
  opcaoDesc: {
    fontSize: fonte.legenda,
    color: cores.cinza600,
    marginTop: espaco.xs,
  },
});
