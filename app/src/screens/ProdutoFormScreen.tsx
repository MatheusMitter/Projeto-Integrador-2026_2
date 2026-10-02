// Cadastro e edição de produto.

import React, { useCallback, useEffect, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Aviso, Botao, Campo } from "../components/base";
import { Categoria, Fornecedor } from "../domain/tipos";
import * as cadastroRepo from "../repositories/cadastroRepository";
import * as produtoRepo from "../repositories/produtoRepository";
import { sessaoAtual } from "../services/authService";
import { registrarMovimentacao } from "../services/estoqueService";
import {
  avisoPreco,
  calcularMargem,
  paraDataBr,
  paraDataIso,
  podeVerFinanceiro,
  validarDataValidade,
} from "../services/regras";
import { ALVO_TOQUE, cores, espaco, fonte, raio } from "../theme/tema";

interface Props {
  route?: { params?: { id?: number } };
  navigation: { goBack: () => void };
}

export default function ProdutoFormScreen({ route, navigation }: Props) {
  const id = route?.params?.id;
  const editando = typeof id === "number";

  const [nome, setNome] = useState("");
  const [codigoBarras, setCodigoBarras] = useState("");
  const [categoriaId, setCategoriaId] = useState<number | null>(null);
  const [fornecedorId, setFornecedorId] = useState<number | null>(null);
  const [precoCusto, setPrecoCusto] = useState("");
  const [precoVenda, setPrecoVenda] = useState("");
  const [quantidadeInicial, setQuantidadeInicial] = useState("0");
  const [estoqueMinimo, setEstoqueMinimo] = useState("");
  const [dataValidade, setDataValidade] = useState("");

  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [fornecedores, setFornecedores] = useState<Fornecedor[]>([]);
  const [erro, setErro] = useState<string | null>(null);
  const [salvando, setSalvando] = useState(false);

  const verFinanceiro = podeVerFinanceiro(
    sessaoAtual()?.tipoPerfil ?? "OPERADOR",
  );

  const carregar = useCallback(async () => {
    const [cats, forns] = await Promise.all([
      cadastroRepo.listarCategorias(),
      cadastroRepo.listarFornecedores(),
    ]);
    setCategorias(cats);
    setFornecedores(forns);
    if (cats.length > 0 && categoriaId === null) setCategoriaId(cats[0].id);

    if (editando && typeof id === "number") {
      const p = await produtoRepo.buscarPorId(id);
      if (p) {
        setNome(p.nome);
        setCodigoBarras(p.codigoBarras ?? "");
        setCategoriaId(p.categoriaId);
        setFornecedorId(p.fornecedorId);
        setPrecoCusto(String(p.precoCusto));
        setPrecoVenda(String(p.precoVenda));
        setEstoqueMinimo(String(p.estoqueMinimo));
        setDataValidade(paraDataBr(p.dataValidade));
      }
    }
  }, [editando, id, categoriaId]);

  useEffect(() => {
    carregar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const custo = parseFloat(precoCusto.replace(",", ".")) || 0;
  const venda = parseFloat(precoVenda.replace(",", ".")) || 0;
  const margem = calcularMargem(custo, venda);
  const alertaPreco = avisoPreco(custo, venda);

  function validar(): string | null {
    if (nome.trim().length < 2) return "Informe o nome do produto.";
    if (categoriaId === null) return "Selecione a categoria.";
    if (custo < 0 || venda < 0) return "Os preços não podem ser negativos.";
    const minimo = parseInt(estoqueMinimo, 10);
    if (Number.isNaN(minimo) || minimo < 0)
      return "Informe o estoque mínimo (zero ou mais).";
    const inicial = parseInt(quantidadeInicial, 10);
    if (!editando && (Number.isNaN(inicial) || inicial < 0))
      return "Informe a quantidade inicial (zero ou mais).";
    return validarDataValidade(dataValidade);
  }

  async function salvar() {
    const problema = validar();
    if (problema) {
      setErro(problema);
      return;
    }
    setErro(null);
    setSalvando(true);

    try {
      const dados = {
        nome,
        codigoBarras: codigoBarras.trim() || null,
        categoriaId: categoriaId as number,
        fornecedorId,
        precoCusto: custo,
        precoVenda: venda,
        estoqueMinimo: parseInt(estoqueMinimo, 10),
        dataValidade: paraDataIso(dataValidade),
      };

      if (editando && typeof id === "number") {
        await produtoRepo.atualizar(id, dados);
      } else {
        const novoId = await produtoRepo.inserir(dados);
        const inicial = parseInt(quantidadeInicial, 10);
        // entra como movimentação para o histórico ficar coerente
        if (inicial > 0) {
          await registrarMovimentacao({
            produtoId: novoId,
            usuarioId: sessaoAtual()?.id ?? 1,
            tipo: "COMPRA",
            quantidade: inicial,
            observacoes: "Estoque inicial do cadastro",
          });
        }
      }
      navigation.goBack();
    } catch {
      setErro(
        "Não foi possível salvar. Verifique se o código de barras já está em uso.",
      );
    } finally {
      setSalvando(false);
    }
  }

  return (
    <ScrollView
      style={e.tela}
      contentContainerStyle={{ padding: espaco.md }}
      keyboardShouldPersistTaps="handled"
    >
      {!!erro && <Aviso texto={erro} tipo="erro" />}

      <Campo
        rotulo="Nome do produto"
        valor={nome}
        onChangeText={setNome}
        obrigatorio
      />
      <Campo
        rotulo="Código de barras"
        valor={codigoBarras}
        onChangeText={setCodigoBarras}
        tipoTeclado="numeric"
        ajuda="Opcional nesta versão. A leitura pela câmera entra no Ciclo 3."
      />

      <Text style={e.rotulo}>Categoria *</Text>
      <View style={e.opcoes}>
        {categorias.map((c) => {
          const ativo = categoriaId === c.id;
          return (
            <Pressable
              key={c.id}
              onPress={() => setCategoriaId(c.id)}
              accessibilityRole="radio"
              accessibilityState={{ selected: ativo }}
              style={[e.chip, ativo && e.chipAtivo]}
            >
              <Text style={[e.chipTexto, ativo && e.chipTextoAtivo]}>
                {ativo ? "\u25CF " : ""}
                {c.nome}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <Text style={e.rotulo}>Fornecedor</Text>
      <View style={e.opcoes}>
        <Pressable
          onPress={() => setFornecedorId(null)}
          accessibilityRole="radio"
          accessibilityState={{ selected: fornecedorId === null }}
          style={[e.chip, fornecedorId === null && e.chipAtivo]}
        >
          <Text
            style={[e.chipTexto, fornecedorId === null && e.chipTextoAtivo]}
          >
            {fornecedorId === null ? "\u25CF " : ""}Sem fornecedor
          </Text>
        </Pressable>
        {fornecedores.map((f) => {
          const ativo = fornecedorId === f.id;
          return (
            <Pressable
              key={f.id}
              onPress={() => setFornecedorId(f.id)}
              accessibilityRole="radio"
              accessibilityState={{ selected: ativo }}
              style={[e.chip, ativo && e.chipAtivo]}
            >
              <Text style={[e.chipTexto, ativo && e.chipTextoAtivo]}>
                {ativo ? "\u25CF " : ""}
                {f.nome}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {/* RN01: preço de custo e margem só para o proprietário */}
      {verFinanceiro && (
        <Campo
          rotulo="Preço de custo"
          valor={precoCusto}
          onChangeText={setPrecoCusto}
          tipoTeclado="decimal-pad"
          placeholder="0,00"
        />
      )}
      <Campo
        rotulo="Preço de venda"
        valor={precoVenda}
        onChangeText={setPrecoVenda}
        tipoTeclado="decimal-pad"
        placeholder="0,00"
      />

      {verFinanceiro && margem && (
        <Aviso
          tipo={alertaPreco ? "atencao" : "sucesso"}
          texto={
            alertaPreco ??
            `Margem de lucro: R$ ${margem.valor.toFixed(2)} (${margem.percentual.toFixed(1)}%)`
          }
        />
      )}

      {!editando && (
        <Campo
          rotulo="Quantidade inicial"
          valor={quantidadeInicial}
          onChangeText={setQuantidadeInicial}
          tipoTeclado="numeric"
          obrigatorio
          ajuda="Será registrada como entrada no histórico."
        />
      )}

      <Campo
        rotulo="Estoque mínimo"
        valor={estoqueMinimo}
        onChangeText={setEstoqueMinimo}
        tipoTeclado="numeric"
        obrigatorio
        ajuda="Você é avisado quando o estoque ficar neste valor ou abaixo dele."
      />

      <Campo
        rotulo="Data de validade"
        valor={dataValidade}
        onChangeText={setDataValidade}
        placeholder="DD/MM/AAAA"
        tipoTeclado="numeric"
        ajuda="Opcional. Produtos a 15 dias ou menos do vencimento aparecem no painel."
      />

      <Botao
        titulo={editando ? "Salvar alterações" : "Cadastrar produto"}
        onPress={salvar}
        carregando={salvando}
      />
      <Botao
        titulo="Cancelar"
        variante="secundario"
        onPress={navigation.goBack}
      />
    </ScrollView>
  );
}

const e = StyleSheet.create({
  tela: { flex: 1, backgroundColor: cores.cinza100 },
  rotulo: {
    fontSize: fonte.legenda,
    fontWeight: "600",
    color: cores.cinza700,
    marginBottom: espaco.sm,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  opcoes: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: espaco.sm,
    marginBottom: espaco.md,
  },
  chip: {
    minHeight: ALVO_TOQUE,
    justifyContent: "center",
    paddingHorizontal: espaco.md,
    borderRadius: raio.completo,
    backgroundColor: cores.branco,
    borderWidth: 1,
    borderColor: cores.cinza300,
  },
  chipAtivo: { backgroundColor: cores.primaria, borderColor: cores.primaria },
  chipTexto: { fontSize: fonte.legenda, color: cores.cinza800 },
  chipTextoAtivo: { color: cores.branco, fontWeight: "700" },
});
