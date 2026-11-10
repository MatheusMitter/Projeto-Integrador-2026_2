// Cadastro e edição de produto.

import { useCallback, useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import {
  Aviso,
  Botao,
  Campo,
  Carregando,
  Chip,
  RolagemDeFormulario,
} from "../components/base";
import type { Categoria, Fornecedor } from "../domain/tipos";
import type { TelaProdutos } from "../navigation/rotas";
import { sessaoAtual } from "../services/authService";
import {
  listarCategorias,
  listarFornecedores,
} from "../services/cadastroService";
import { buscarProduto, salvarProduto } from "../services/produtoService";
import {
  avisoPreco,
  calcularMargem,
  DIAS_ALERTA_VENCIMENTO,
  formatarPercentual,
  formatarReais,
  lerValor,
  paraDataBr,
  podeVerFinanceiro,
} from "../services/regras";
import { cores, espaco, fonte } from "../theme/tema";

// 6.5 → "6,50": o campo mostra o valor como o comerciante digita
const paraCampo = (valor: number) => valor.toFixed(2).replace(".", ",");

export default function ProdutoFormScreen({
  route,
  navigation,
}: TelaProdutos<"ProdutoForm">) {
  const id = route.params?.id;
  const editando = id !== undefined;

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
  const [carregando, setCarregando] = useState(true);
  const [erroCarga, setErroCarga] = useState<string | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [salvando, setSalvando] = useState(false);

  // RN01 na interface: o operador não vê nem informa o custo
  const verFinanceiro = podeVerFinanceiro(
    sessaoAtual()?.tipoPerfil ?? "OPERADOR",
  );

  const carregar = useCallback(async () => {
    setCarregando(true);
    setErroCarga(null);
    try {
      const [cats, { fornecedores: forns }, produto] = await Promise.all([
        listarCategorias(),
        listarFornecedores(),
        id === undefined ? Promise.resolve(null) : buscarProduto(id),
      ]);
      setCategorias(cats);
      setFornecedores(forns);

      if (id === undefined) {
        setCategoriaId((atual) => atual ?? cats[0]?.id ?? null);
      } else if (produto) {
        setNome(produto.nome);
        setCodigoBarras(produto.codigoBarras ?? "");
        setCategoriaId(produto.categoriaId);
        setFornecedorId(produto.fornecedorId);
        setPrecoCusto(produto.precoCusto === null ? "" : paraCampo(produto.precoCusto));
        setPrecoVenda(paraCampo(produto.precoVenda));
        setEstoqueMinimo(String(produto.estoqueMinimo));
        setDataValidade(paraDataBr(produto.dataValidade));
      } else {
        setErroCarga("Produto não encontrado. Ele pode ter sido desativado.");
      }
    } catch {
      setErroCarga("Não foi possível carregar o formulário.");
    } finally {
      setCarregando(false);
    }
  }, [id]);

  useEffect(() => {
    carregar();
  }, [carregar]);

  const custo = lerValor(precoCusto) ?? 0;
  const venda = lerValor(precoVenda) ?? 0;
  const margem = calcularMargem(custo, venda);
  const alertaPreco = avisoPreco(custo, venda);

  async function salvar() {
    setErro(null);
    setSalvando(true);
    try {
      const r = await salvarProduto(
        {
          nome,
          codigoBarras,
          categoriaId,
          fornecedorId,
          precoCusto,
          precoVenda,
          estoqueMinimo,
          quantidadeInicial,
          dataValidade,
        },
        id,
      );
      if (r.sucesso) navigation.goBack();
      else setErro(r.mensagem ?? "Não foi possível salvar o produto.");
    } finally {
      setSalvando(false);
    }
  }

  if (carregando) return <Carregando texto="Carregando o formulário..." />;

  if (erroCarga) {
    return (
      <View style={[e.tela, e.conteudo]}>
        <Aviso tipo="erro" texto={erroCarga} />
        {editando ? (
          <Botao titulo="Voltar" onPress={() => navigation.goBack()} />
        ) : (
          <Botao titulo="Tentar novamente" onPress={carregar} />
        )}
      </View>
    );
  }

  return (
    <RolagemDeFormulario
      style={e.tela}
      contentContainerStyle={e.conteudo}
    >
      <Campo
        rotulo="Nome"
        valor={nome}
        onChangeText={setNome}
        placeholder="Ex.: Leite Integral 1L"
        obrigatorio
      />
      <Campo
        rotulo="Código de barras"
        valor={codigoBarras}
        onChangeText={setCodigoBarras}
        tipoTeclado="numeric"
        icone="barcode-outline"
        ajuda="Opcional. Nesta versão o código é digitado."
      />

      {/* RN01: preço de custo e margem só para o proprietário */}
      <View style={e.linha}>
        {verFinanceiro && (
          <View style={e.coluna}>
            <Campo
              rotulo="Custo (R$)"
              valor={precoCusto}
              onChangeText={setPrecoCusto}
              tipoTeclado="decimal-pad"
              placeholder="0,00"
              obrigatorio
            />
          </View>
        )}
        <View style={e.coluna}>
          <Campo
            rotulo="Venda (R$)"
            valor={precoVenda}
            onChangeText={setPrecoVenda}
            tipoTeclado="decimal-pad"
            placeholder="0,00"
            obrigatorio
            ajuda={
              verFinanceiro
                ? undefined
                : "O preço de custo é informado pelo proprietário."
            }
          />
        </View>
      </View>

      {verFinanceiro && custo > 0 && margem && (
        <Aviso
          tipo={alertaPreco ? "atencao" : "sucesso"}
          texto={
            alertaPreco ??
            `Margem de lucro: ${formatarReais(margem.valor)} (${formatarPercentual(margem.percentual)})`
          }
        />
      )}

      <View style={e.linha}>
        <View style={e.coluna}>
          <Campo
            rotulo="Estoque mínimo"
            valor={estoqueMinimo}
            onChangeText={setEstoqueMinimo}
            tipoTeclado="numeric"
            placeholder="0"
            obrigatorio
          />
        </View>
        <View style={e.coluna}>
          <Campo
            rotulo="Validade"
            valor={dataValidade}
            onChangeText={setDataValidade}
            placeholder="DD/MM/AAAA"
            tipoTeclado="numeric"
          />
        </View>
      </View>
      <Text style={e.ajuda}>
        Você é avisado quando o estoque chegar ao mínimo e quando faltarem{" "}
        {DIAS_ALERTA_VENCIMENTO} dias ou menos para a validade, que é opcional.
      </Text>

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

      <Text style={e.rotulo}>Categoria *</Text>
      <View style={e.opcoes} accessibilityRole="radiogroup">
        {categorias.map((c) => (
          <Chip
            key={c.id}
            rotulo={c.nome}
            ativo={categoriaId === c.id}
            onPress={() => setCategoriaId(c.id)}
          />
        ))}
      </View>

      <Text style={e.rotulo}>Fornecedor</Text>
      <View style={e.opcoes} accessibilityRole="radiogroup">
        <Chip
          rotulo="Sem fornecedor"
          ativo={fornecedorId === null}
          onPress={() => setFornecedorId(null)}
        />
        {fornecedores.map((f) => (
          <Chip
            key={f.id}
            rotulo={f.nome}
            ativo={fornecedorId === f.id}
            onPress={() => setFornecedorId(f.id)}
          />
        ))}
      </View>

      {/* perto do botão, onde o olho está ao salvar; no topo de um
          formulário longo a mensagem ficaria fora da tela */}
      {!!erro && <Aviso texto={erro} tipo="erro" />}

      <Botao
        titulo={editando ? "Salvar alterações" : "Salvar produto"}
        onPress={salvar}
        carregando={salvando}
      />
      <Botao
        titulo="Cancelar"
        variante="contorno"
        onPress={() => navigation.goBack()}
      />
    </RolagemDeFormulario>
  );
}

const e = StyleSheet.create({
  tela: { flex: 1, backgroundColor: cores.fundo },
  conteudo: { padding: espaco.md, paddingTop: espaco.xs, paddingBottom: espaco.xl },
  linha: { flexDirection: "row", gap: espaco.sm },
  coluna: { flex: 1 },
  ajuda: {
    fontSize: fonte.legenda - 1,
    color: cores.textoSuave,
    marginTop: -espaco.sm,
    marginBottom: espaco.md,
  },
  rotulo: {
    fontSize: fonte.rotulo,
    fontWeight: "700",
    color: cores.texto,
    marginBottom: espaco.sm,
  },
  opcoes: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: espaco.sm,
    marginBottom: espaco.lg,
  },
});
