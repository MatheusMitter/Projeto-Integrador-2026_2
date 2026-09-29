// Navegação: abas na parte de baixo, com pilha dentro da aba de produtos.

import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Text } from "react-native";

import PainelScreen from "../screens/PainelScreen";
import ProdutosScreen from "../screens/ProdutosScreen";
import ProdutoFormScreen from "../screens/ProdutoFormScreen";
import ProdutoDetalhesScreen from "../screens/ProdutoDetalhesScreen";
import MovimentacaoScreen from "../screens/MovimentacaoScreen";
import FornecedoresScreen from "../screens/FornecedoresScreen";
import { cores, fonte } from "../theme/tema";

const Pilha = createNativeStackNavigator();
const Abas = createBottomTabNavigator();

const cabecalho = {
  headerStyle: { backgroundColor: cores.branco },
  headerTintColor: cores.cinza900,
  headerTitleStyle: { fontWeight: "700" as const },
};


function PilhaProdutos() {
  return (
    <Pilha.Navigator screenOptions={cabecalho}>
      <Pilha.Screen
        name="ProdutosLista"
        component={ProdutosScreen}
        options={{ title: "Produtos" }}
      />
      <Pilha.Screen
        name="ProdutoForm"
        component={ProdutoFormScreen}
        options={({ route }) => ({
          title:
            (route.params as { id?: number } | undefined)?.id !== undefined
              ? "Editar produto"
              : "Novo produto",
        })}
      />
      {/* cast porque a tela exige params e o tipo do navigator espera
          opcionais; tipar a lista de rotas resolve melhor, fica para depois */}
      <Pilha.Screen
        name="ProdutoDetalhes"
        component={ProdutoDetalhesScreen as React.ComponentType}
        options={{ title: "Detalhes do produto" }}
      />
    </Pilha.Navigator>
  );
}

// texto em vez de ícone, para o leitor de tela não ler símbolo estranho
function abaIcone(texto: string) {
  return ({ color }: { color: string }) => (
    <Text style={{ color, fontSize: 18, fontWeight: "700" }}>{texto}</Text>
  );
}

export default function Navegacao({ onSair }: { onSair: () => void }) {
  return (
    <NavigationContainer>
      <Abas.Navigator
        screenOptions={{
          ...cabecalho,
          tabBarActiveTintColor: cores.primariaEscura,
          tabBarInactiveTintColor: cores.cinza600,
          tabBarLabelStyle: { fontSize: fonte.legenda },
          // altura confortável: a barra é tocada com o polegar, muitas
          // vezes com a outra mão ocupada
          tabBarStyle: { height: 64, paddingBottom: 8, paddingTop: 6 },
        }}
      >
        <Abas.Screen
          name="Início"
          component={PainelScreen}
          options={{ title: "Início", tabBarIcon: abaIcone("|||") }}
        />
        <Abas.Screen
          name="Produtos"
          component={PilhaProdutos}
          options={{ headerShown: false, tabBarIcon: abaIcone("[ ]") }}
        />
        <Abas.Screen
          name="Movimentação"
          component={MovimentacaoScreen}
          options={{ title: "Movimentação", tabBarIcon: abaIcone("<>") }}
        />
        <Abas.Screen
          name="Fornecedores"
          component={FornecedoresScreen}
          options={{ title: "Fornecedores", tabBarIcon: abaIcone("( )") }}
        />
      </Abas.Navigator>
    </NavigationContainer>
  );
}
