/**
 * Manutenção de fornecedores.
 *
 * Esta tela existe para atender ao requisito R3, que exige operações
 * completas de inclusão, consulta, alteração e exclusão sobre no mínimo
 * duas entidades. Produto é a primeira; fornecedor é a segunda.
 *
 * É também onde a regra RN13 aparece: fornecedor com produtos vinculados
 * não pode ser excluído.
 */

import React, { useCallback, useState } from "react";
import { Alert, ScrollView, StyleSheet, Text, View } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { Aviso, Botao, Campo, Cartao, Carregando } from "../components/base";
import { Fornecedor } from "../domain/tipos";
import * as cadastroRepo from "../repositories/cadastroRepository";
import { sessaoAtual } from "../services/authService";
import { podeVerFinanceiro } from "../services/regras";
import { cores, espaco, fonte } from "../theme/tema";

export default function FornecedoresScreen() {
  const [lista, setLista] = useState<Fornecedor[] | null>(null);
  const [contagens, setContagens] = useState<Record<number, number>>({});
  const [editandoId, setEditandoId] = useState<number | null>(null);
  const [formAberto, setFormAberto] = useState(false);
  const [nome, setNome] = useState("");
  const [telefone, setTelefone] = useState("");
  const [email, setEmail] = useState("");
  const [erro, setErro] = useState<string | null>(null);

  // RN01: manutenção de cadastro é operação do proprietário
  const proprietario = podeVerFinanceiro(sessaoAtual()?.tipoPerfil ?? "OPERADOR");

  const carregar = useCallback(async () => {
    const forns = await cadastroRepo.listarFornecedores();
    setLista(forns);
    const mapa: Record<number, number> = {};
    for (const f of forns) {
      mapa[f.id] = await cadastroRepo.contarProdutosDoFornecedor(f.id);
    }
    setContagens(mapa);
  }, []);

  useFocusEffect(
    useCallback(() => {
      carregar();
    }, [carregar]),
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
    if (nome.trim().length < 2) {
      setErro("Informe o nome do fornecedor.");
      return;
    }
    setErro(null);
    const dados = { nome, telefone, email };
    if (editandoId === null) await cadastroRepo.inserirFornecedor(dados);
    else await cadastroRepo.atualizarFornecedor(editandoId, dados);
    setFormAberto(false);
    await carregar();
  }

  function confirmarExclusao(f: Fornecedor) {
    Alert.alert("Excluir fornecedor", `Excluir ${f.nome}?`, [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Excluir",
        style: "destructive",
        onPress: async () => {
          const r = await cadastroRepo.excluirFornecedor(f.id);
          if (!r.sucesso) Alert.alert("Não foi possível excluir", r.mensagem ?? "");
          await carregar();
        },
      },
    ]);
  }

  if (!lista) return <Carregando texto="Carregando fornecedores..." />;

  if (formAberto) {
    return (
      <ScrollView style={e.tela} contentContainerStyle={{ padding: espaco.md }}>
        <Text style={e.titulo}>
          {editandoId === null ? "Novo fornecedor" : "Editar fornecedor"}
        </Text>
        {!!erro && <Aviso texto={erro} tipo="erro" />}
        <Campo rotulo="Nome" valor={nome} onChangeText={setNome} obrigatorio />
        <Campo rotulo="Telefone" valor={telefone} onChangeText={setTelefone} />
        <Campo
          rotulo="E-mail"
          valor={email}
          onChangeText={setEmail}
          tipoTeclado="email-address"
        />
        <Botao titulo="Salvar" onPress={salvar} />
        <Botao
          titulo="Cancelar"
          variante="secundario"
          onPress={() => setFormAberto(false)}
        />
      </ScrollView>
    );
  }

  return (
    <ScrollView style={e.tela} contentContainerStyle={{ padding: espaco.md }}>
      <Text style={e.titulo}>
        {lista.length} fornecedor{lista.length === 1 ? "" : "es"}
      </Text>

      {lista.map((f) => {
        const vinculados = contagens[f.id] ?? 0;
        return (
          <Cartao key={f.id}>
            <Text style={e.nome}>{f.nome}</Text>
            {!!f.telefone && <Text style={e.meta}>{f.telefone}</Text>}
            <Text style={e.meta}>
              {vinculados} produto{vinculados === 1 ? "" : "s"} vinculado
              {vinculados === 1 ? "" : "s"}
            </Text>
            {proprietario && (
              <View style={{ marginTop: espaco.sm }}>
                <Botao
                  titulo="Editar"
                  variante="secundario"
                  onPress={() => abrirEdicao(f)}
                />
                <Botao
                  titulo="Excluir"
                  variante="perigo"
                  onPress={() => confirmarExclusao(f)}
                />
              </View>
            )}
          </Cartao>
        );
      })}

      <Aviso
        tipo="info"
        texto="Um fornecedor só pode ser excluído quando não há produtos vinculados a ele. Regra RN13."
      />

      {proprietario && <Botao titulo="Novo fornecedor" onPress={abrirNovo} />}
    </ScrollView>
  );
}

const e = StyleSheet.create({
  tela: { flex: 1, backgroundColor: cores.cinza100 },
  titulo: {
    fontSize: fonte.tituloMedio,
    fontWeight: "700",
    color: cores.cinza900,
    marginBottom: espaco.md,
  },
  nome: { fontSize: fonte.corpo, fontWeight: "700", color: cores.cinza900 },
  meta: { fontSize: fonte.legenda, color: cores.cinza600, marginTop: espaco.xs },
});
