// Navegação: cinco abas na parte de baixo, com pilhas dentro de Produtos
// e de Ajustes.

import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Text } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

import PainelScreen from "../screens/PainelScreen";
import ProdutosScreen from "../screens/ProdutosScreen";
import ProdutoFormScreen from "../screens/ProdutoFormScreen";
import ProdutoDetalhesScreen from "../screens/ProdutoDetalhesScreen";
import MovimentacaoScreen from "../screens/MovimentacaoScreen";
import RelatoriosScreen from "../screens/RelatoriosScreen";
import AjustesScreen from "../screens/AjustesScreen";
import FornecedoresScreen from "../screens/FornecedoresScreen";
import type { NomeIcone } from "../components/base";
import { cores, fonte } from "../theme/tema";
import type { RotasAbas, RotasAjustes, RotasProdutos } from "./rotas";
import { ContextoSessao } from "./sessao";

const PilhaProdutosNav = createNativeStackNavigator<RotasProdutos>();
const PilhaAjustesNav = createNativeStackNavigator<RotasAjustes>();
const Abas = createBottomTabNavigator<RotasAbas>();

// Cabeçalho no estilo do Figma: mesmo fundo da tela, sem sombra, título
// alinhado à esquerda.
const cabecalho = {
  headerStyle: { backgroundColor: cores.fundo },
  headerShadowVisible: false,
  headerTintColor: cores.texto,
  headerTitleAlign: "left" as const,
  headerTitleStyle: {
    fontSize: fonte.tituloVoltar,
    fontWeight: "800" as const,
    color: cores.texto,
  },
  contentStyle: { backgroundColor: cores.fundo },
};

const cabecalhoRaiz = {
  ...cabecalho,
  headerTitleStyle: { ...cabecalho.headerTitleStyle, fontSize: fonte.titulo },
};

function PilhaProdutos() {
  return (
    <PilhaProdutosNav.Navigator screenOptions={cabecalho}>
      <PilhaProdutosNav.Screen
        name="ProdutosLista"
        component={ProdutosScreen}
        options={{ title: "Produtos", ...cabecalhoRaiz }}
      />
      <PilhaProdutosNav.Screen
        name="ProdutoForm"
        component={ProdutoFormScreen}
        options={({ route }) => ({
          title: route.params?.id !== undefined ? "Editar produto" : "Novo produto",
        })}
      />
      <PilhaProdutosNav.Screen
        name="ProdutoDetalhes"
        component={ProdutoDetalhesScreen}
        options={{ title: "Detalhes do produto" }}
      />
    </PilhaProdutosNav.Navigator>
  );
}

function PilhaAjustes() {
  return (
    <PilhaAjustesNav.Navigator screenOptions={cabecalho}>
      <PilhaAjustesNav.Screen
        name="AjustesInicio"
        component={AjustesScreen}
        options={{ title: "Ajustes", ...cabecalhoRaiz }}
      />
      <PilhaAjustesNav.Screen
        name="Fornecedores"
        component={FornecedoresScreen}
        options={{ title: "Fornecedores" }}
      />
    </PilhaAjustesNav.Navigator>
  );
}

// ícone preenchido na aba ativa, contorno nas outras: a diferença não
// fica só na cor
function abaIcone(nome: string) {
  return ({ color, focused }: { color: string; focused: boolean }) => (
    <Ionicons
      name={(focused ? nome : `${nome}-outline`) as NomeIcone}
      size={22}
      color={color}
    />
  );
}

function abaRotulo(texto: string) {
  return ({ color, focused }: { color: string; focused: boolean }) => (
    <Text
      style={{
        color,
        fontSize: fonte.aba,
        fontWeight: focused ? "700" : "400",
      }}
    >
      {texto}
    </Text>
  );
}

export default function Navegacao({ onSair }: { onSair: () => void }) {
  const sessao = React.useMemo(() => ({ sair: onSair }), [onSair]);
  // o app desenha atrás da barra de gestos do Android; a altura dela entra
  // na barra de abas, senão os rótulos ficam embaixo da linha de gestos
  const { bottom } = useSafeAreaInsets();

  return (
    <ContextoSessao.Provider value={sessao}>
      <NavigationContainer>
        <Abas.Navigator
          screenOptions={{
            ...cabecalhoRaiz,
            tabBarActiveTintColor: cores.primaria,
            // com o teclado aberto a barra só tomaria espaço do formulário
            tabBarHideOnKeyboard: true,
            tabBarInactiveTintColor: cores.textoSuave,
            // altura confortável: a barra é tocada com o polegar, muitas
            // vezes com a outra mão ocupada
            tabBarStyle: {
              height: 64 + bottom,
              paddingBottom: 8 + bottom,
              paddingTop: 6,
              backgroundColor: cores.superficie,
              borderTopColor: cores.borda,
            },
          }}
        >
          <Abas.Screen
            name="Início"
            component={PainelScreen}
            options={{
              title: "Início",
              tabBarIcon: abaIcone("home"),
              tabBarLabel: abaRotulo("Início"),
            }}
          />
          <Abas.Screen
            name="Produtos"
            component={PilhaProdutos}
            options={{
              headerShown: false,
              tabBarIcon: abaIcone("grid"),
              tabBarLabel: abaRotulo("Produtos"),
            }}
          />
          <Abas.Screen
            name="Movimentar"
            component={MovimentacaoScreen}
            options={{
              title: "Movimentar",
              tabBarIcon: abaIcone("swap-horizontal"),
              tabBarLabel: abaRotulo("Movimentar"),
            }}
          />
          <Abas.Screen
            name="Relatórios"
            component={RelatoriosScreen}
            options={{
              title: "Relatórios",
              tabBarIcon: abaIcone("bar-chart"),
              tabBarLabel: abaRotulo("Relatórios"),
            }}
          />
          <Abas.Screen
            name="Ajustes"
            component={PilhaAjustes}
            options={{
              headerShown: false,
              tabBarIcon: abaIcone("settings"),
              tabBarLabel: abaRotulo("Ajustes"),
            }}
          />
        </Abas.Navigator>
      </NavigationContainer>
    </ContextoSessao.Provider>
  );
}
