// Manutenção de fornecedores.

import { useCallback, useState } from "react";
import {
  Alert,
  BackHandler,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import {
  Aviso,
  Botao,
  BotaoFlutuante,
  Campo,
  CampoBusca,
  Carregando,
  ListaVazia,
  Miniatura,
  RolagemDeFormulario,
  Selo,
  TituloSecao,
} from "../components/base";
import type { Fornecedor } from "../domain/tipos";
import { sessaoAtual } from "../services/authService";
import {
  excluirFornecedor,
  listarFornecedores,
  salvarFornecedor,
} from "../services/cadastroService";
import { podeGerenciarCadastros } from "../services/regras";
import { ALVO_TOQUE, cores, espaco, fonte, raio } from "../theme/tema";

export default function FornecedoresScreen() {
  const [lista, setLista] = useState<Fornecedor[] | null>(null);
  const [contagens, setContagens] = useState<Record<number, number>>({});
  const [erroLista, setErroLista] = useState<string | null>(null);
  const [busca, setBusca] = useState("");
  const [editandoId, setEditandoId] = useState<number | null>(null);
  const [formAberto, setFormAberto] = useState(false);
  const [nome, setNome] = useState("");
  const [telefone, setTelefone] = useState("");
  const [email, setEmail] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [salvando, setSalvando] = useState(false);

  // RN01: manter fornecedor é operação do proprietário; o serviço confere
  // de novo, a tela só não oferece o que não vai funcionar
  const proprietario = podeGerenciarCadastros(
    sessaoAtual()?.tipoPerfil ?? "OPERADOR",
  );

  const carregar = useCallback(async () => {
    try {
      const { fornecedores, vinculados } = await listarFornecedores();
      setLista(fornecedores);
      setContagens(vinculados);
      setErroLista(null);
    } catch {
      setErroLista("Não foi possível carregar os fornecedores.");
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      carregar();
    }, [carregar]),
  );

  // com o formulário aberto, o Voltar do Android fecha o formulário em vez
  // de sair da tela, como faria se o formulário fosse uma tela própria
  useFocusEffect(
    useCallback(() => {
      if (!formAberto) return;
      const assinatura = BackHandler.addEventListener("hardwareBackPress", () => {
        setFormAberto(false);
        return true;
      });
      return () => assinatura.remove();
    }, [formAberto]),
  );

  function abrirNovo() {
    setEditandoId(null);
    setNome("");
    setTelefone("");
    setEmail("");
    setErro(null);
    setFormAberto(true);
  }

  function abrirEdicao(f: Fornecedor) {
    setEditandoId(f.id);
    setNome(f.nome);
    setTelefone(f.telefone ?? "");
    setEmail(f.email ?? "");
    setErro(null);
    setFormAberto(true);
  }

  async function salvar() {
    setErro(null);
    setSalvando(true);
    try {
      const r = await salvarFornecedor({ nome, telefone, email }, editandoId);
      if (!r.sucesso) {
        setErro(r.mensagem ?? "Não foi possível salvar o fornecedor.");
        return;
      }
      setFormAberto(false);
      await carregar();
    } finally {
      setSalvando(false);
    }
  }

  function confirmarExclusao() {
    if (editandoId === null) return;
    Alert.alert(
      "Excluir fornecedor",
      `Excluir ${nome}?\n\nEle deixa de aparecer na lista e no cadastro de ` +
        `produtos. O registro continua guardado para o histórico.`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Excluir",
          style: "destructive",
          onPress: async () => {
            const r = await excluirFornecedor(editandoId);
            if (!r.sucesso) {
              Alert.alert("Não foi possível excluir", r.mensagem ?? "");
              return;
            }
            setFormAberto(false);
            await carregar();
          },
        },
      ],
    );
  }

  if (!lista) {
    if (!erroLista) return <Carregando texto="Carregando fornecedores..." />;
    return (
      <View style={[e.tela, e.conteudo]}>
        <Aviso tipo="erro" texto={erroLista} />
        <Botao titulo="Tentar novamente" onPress={carregar} />
      </View>
    );
  }

  if (formAberto) {
    const vinculados = editandoId === null ? 0 : (contagens[editandoId] ?? 0);
    return (
      <RolagemDeFormulario
        style={e.tela}
        contentContainerStyle={e.conteudo}
      >
        <TituloSecao
          texto={editandoId === null ? "Novo fornecedor" : "Editar fornecedor"}
        />
        <Campo rotulo="Nome" valor={nome} onChangeText={setNome} obrigatorio />
        <Campo
          rotulo="Telefone"
          valor={telefone}
          onChangeText={setTelefone}
          placeholder="(62) 3333-4444"
        />
        <Campo
          rotulo="E-mail"
          valor={email}
          onChangeText={setEmail}
          tipoTeclado="email-address"
          placeholder="contato@fornecedor.com.br"
        />
        {!!erro && <Aviso texto={erro} tipo="erro" />}
        <Botao titulo="Salvar" onPress={salvar} carregando={salvando} />
        <Botao
          titulo="Cancelar"
          variante="contorno"
          onPress={() => setFormAberto(false)}
        />
        {editandoId !== null && (
          <>
            <Botao
              titulo="Excluir fornecedor"
              variante="perigoContorno"
              onPress={confirmarExclusao}
            />
            {vinculados > 0 && (
              <Text style={e.ajuda}>
                {vinculados} produto{vinculados === 1 ? "" : "s"} vinculado
                {vinculados === 1 ? "" : "s"}: a exclusão será recusada até
                que eles mudem de fornecedor (RN13).
              </Text>
            )}
          </>
        )}
      </RolagemDeFormulario>
    );
  }

  const termo = busca.trim().toLowerCase();
  const visiveis = lista.filter(
    (f) => termo.length === 0 || f.nome.toLowerCase().includes(termo),
  );

  return (
    <View style={e.tela}>
      <ScrollView contentContainerStyle={[e.conteudo, { paddingBottom: 96 }]}>
        <View style={{ marginBottom: espaco.sm }}>
          <CampoBusca
            valor={busca}
            onChangeText={setBusca}
            placeholder="Buscar fornecedor"
            rotuloAcessivel="Buscar fornecedor pelo nome"
          />
        </View>

        {!!erroLista && <Aviso tipo="erro" texto={erroLista} />}

        {visiveis.length === 0 && (
          <ListaVazia
            icone="business-outline"
            texto={
              termo.length > 0
                ? `Nenhum fornecedor encontrado para "${busca}".`
                : "Nenhum fornecedor cadastrado."
            }
          />
        )}

        {visiveis.map((f) => {
          const vinculados = contagens[f.id] ?? 0;
          const descricao =
            `${f.nome}. ${f.telefone ? f.telefone + ". " : ""}` +
            `${vinculados} produto${vinculados === 1 ? "" : "s"} vinculado${vinculados === 1 ? "" : "s"}.`;
          return (
            <Pressable
              key={f.id}
              disabled={!proprietario}
              onPress={() => abrirEdicao(f)}
              accessibilityRole={proprietario ? "button" : undefined}
              accessibilityLabel={descricao}
              accessibilityHint={proprietario ? "Abre a edição do fornecedor" : undefined}
              style={({ pressed }) => [e.item, pressed && { opacity: 0.7 }]}
            >
              <Miniatura icone="business-outline" />
              <View style={{ flex: 1 }}>
                <Text style={e.nome}>{f.nome}</Text>
                <Text style={e.meta}>
                  {f.telefone ? `${f.telefone} · ` : ""}
                  {vinculados} produto{vinculados === 1 ? "" : "s"}
                </Text>
              </View>
              <Selo texto={String(vinculados)} fundo={cores.sucessoTexto} />
            </Pressable>
          );
        })}

        <Aviso
          tipo="info"
          texto="Um fornecedor só pode ser excluído quando não há produtos vinculados a ele (RN13)."
        />
      </ScrollView>

      {proprietario && (
        <BotaoFlutuante rotulo="Cadastrar fornecedor" onPress={abrirNovo} />
      )}
    </View>
  );
}

const e = StyleSheet.create({
  tela: { flex: 1, backgroundColor: cores.fundo },
  conteudo: { padding: espaco.md, paddingTop: espaco.xs },
  item: {
    flexDirection: "row",
    alignItems: "center",
    gap: espaco.md - 4,
    backgroundColor: cores.superficie,
    borderRadius: raio.padrao,
    borderWidth: 1,
    borderColor: cores.borda,
    padding: espaco.md - 4,
    marginBottom: 6,
    minHeight: ALVO_TOQUE + 16,
  },
  nome: { fontSize: fonte.corpo, fontWeight: "700", color: cores.texto },
  meta: { fontSize: fonte.legenda, color: cores.textoSuave, marginTop: 2 },
  ajuda: { fontSize: fonte.legenda - 1, color: cores.textoSuave, marginTop: espaco.xs },
});
