/**
 * Navegação da aplicação — camada de apresentação.
 *
 * Duas estruturas combinadas, como o requisito R1 pede ("fluxo de navegação
 * estruturado e coerente com as tarefas do usuário"):
 *
 *   - abas na parte de baixo, para as quatro áreas principais, alcançáveis
 *     de qualquer lugar em um toque
 *   - pilha dentro da aba de produtos, para entrar em detalhe e voltar
 *
 * A escolha não é estética: o operador registra saída durante o atendimento,
 * e a movimentação precisa estar a um toque de distância em qualquer tela.
 */

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

/** Pilha da área de produtos: lista, formulário e detalhes. */
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
      {/* O cast é necessário porque a tela declara parâmetros obrigatórios
          de rota, e o tipo genérico do navegador espera propriedades
          opcionais. Tipar a lista de rotas resolveria de forma mais limpa,
          e está previsto para o Ciclo 2. */}
      <Pilha.Screen
        name="ProdutoDetalhes"
        component={ProdutoDetalhesScreen as React.ComponentType}
        options={{ title: "Detalhes do produto" }}
      />
    </Pilha.Navigator>
  );
}

/**
 * Rótulo da aba. Usamos texto em vez de ícone: o rótulo já é o nome
 * acessível, e não há risco de o símbolo ser lido de forma estranha pelo
 * leitor de tela.
 */
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
