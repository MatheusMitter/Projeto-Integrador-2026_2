// Rotas e parâmetros da navegação. Tipar aqui deixa o compilador conferir
// cada navigate, inclusive entre a pilha e as abas.

import type {
  CompositeScreenProps,
  NavigatorScreenParams,
} from "@react-navigation/native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { BottomTabScreenProps } from "@react-navigation/bottom-tabs";

export type FiltroProdutos = "TODOS" | "CRITICO" | "BAIXO" | "VENCENDO";

export type RotasProdutos = {
  ProdutosLista: { filtro?: FiltroProdutos } | undefined;
  ProdutoForm: { id?: number; codigoBarras?: string } | undefined;
  ProdutoDetalhes: { id: number };
};

export type RotasAjustes = {
  AjustesInicio: undefined;
  Fornecedores: undefined;
};

export type RotasAbas = {
  Início: undefined;
  Produtos: NavigatorScreenParams<RotasProdutos> | undefined;
  Movimentar: { produtoId?: number; entrada?: boolean } | undefined;
  Relatórios: undefined;
  Ajustes: NavigatorScreenParams<RotasAjustes> | undefined;
};

export type TelaAba<T extends keyof RotasAbas> = BottomTabScreenProps<RotasAbas, T>;

export type TelaProdutos<T extends keyof RotasProdutos> = CompositeScreenProps<
  NativeStackScreenProps<RotasProdutos, T>,
  BottomTabScreenProps<RotasAbas>
>;

export type TelaAjustes<T extends keyof RotasAjustes> = CompositeScreenProps<
  NativeStackScreenProps<RotasAjustes, T>,
  BottomTabScreenProps<RotasAbas>
>;
