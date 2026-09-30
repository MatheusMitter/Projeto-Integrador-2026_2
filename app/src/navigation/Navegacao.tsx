// Navegação: abas na parte de baixo, com pilha dentro da aba de produtos.

import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Pressable, Text } from "react-native";

import PainelScreen from "../screens/PainelScreen";
import ProdutosScreen from "../screens/ProdutosScreen";
import ProdutoFormScreen from "../screens/ProdutoFormScreen";
import ProdutoDetalhesScreen from "../screens/ProdutoDetalhesScreen";
import MovimentacaoScreen from "../screens/MovimentacaoScreen";
import FornecedoresScreen from "../screens/FornecedoresScreen";
import { ALVO_TOQUE, cores, espaco, fonte } from "../theme/tema";

const Pilha = createNativeStackNavigator();
const Abas = createBottomTabNavigator();

/**
 * O encerramento de sessão chega por contexto, não por prop.
 *
 * A pilha de produtos é um componente de módulo, declarado fora do
 * Navegacao para não remontar a cada render. Isso significa que ela não
 * recebe props do Navegacao — e o botão de sair precisa aparecer tanto no
 * cabeçalho das abas quanto no da pilha. O contexto resolve os dois sem
 * recriar componente.
 */
const ContextoSessao = React.createContext<{ sair: () => void }>({
  sair: () => {},
});

function BotaoSair() {
  const { sair } = React.useContext(ContextoSessao);
  return (
    <Pressable
      onPress={sair}
      accessibilityRole="button"
      accessibilityLabel="Sair da conta"
      accessibilityHint="Encerra a sessão e volta para a tela de acesso"
      style={{
        minHeight: ALVO_TOQUE,
        minWidth: ALVO_TOQUE,
        justifyContent: "center",
        alignItems: "flex-end",
        paddingHorizontal: espaco.md,
      }}
    >
      <Text
        style={{
          color: cores.primariaEscura,
          fontSize: fonte.corpo,
          fontWeight: "700",
        }}
      >
        Sair
      </Text>
    </Pressable>
  );
}

const cabecalho = {
  headerStyle: { backgroundColor: cores.branco },
  headerTintColor: cores.cinza900,
  headerTitleStyle: { fontWeight: "700" as const },
};

// Só nas telas de nível raiz. Num formulário, um "Sair" ao lado do voltar
// convida ao toque errado e o que se perde é o que estava sendo digitado.
const cabecalhoRaiz = { ...cabecalho, headerRight: () => <BotaoSair /> };

function PilhaProdutos() {
  return (
    <Pilha.Navigator screenOptions={cabecalho}>
      <Pilha.Screen
        name="ProdutosLista"
        component={ProdutosScreen}
        options={{ title: "Produtos", ...cabecalhoRaiz }}
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
  const sessao = React.useMemo(() => ({ sair: onSair }), [onSair]);

  return (
    <ContextoSessao.Provider value={sessao}>
      <NavigationContainer>
        <Abas.Navigator
          screenOptions={{
            ...cabecalhoRaiz,
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
    </ContextoSessao.Provider>
  );
}
