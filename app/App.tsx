// Ponto de entrada. Decide entre as telas de acesso e a área autenticada.

import React, { useEffect, useState } from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { Platform, ScrollView, Text, View } from "react-native";

import LoginScreen from "./src/screens/LoginScreen";
import CadastroScreen from "./src/screens/CadastroScreen";
import Navegacao from "./src/navigation/Navegacao";
import { Aviso, Botao, Carregando } from "./src/components/base";
import { obterBanco } from "./src/database/conexao";
import { encerrarSessao } from "./src/services/authService";
import { cores, espaco } from "./src/theme/tema";

type Tela = "carregando" | "login" | "cadastro" | "app" | "falha" | "semBanco";

export default function App() {
  const [tela, setTela] = useState<Tela>("carregando");
  const [erro, setErro] = useState<string | null>(null);

  // abrir o banco cria o esquema e a carga inicial na primeira vez
  useEffect(() => {
    let cancelado = false;

    // expo-sqlite não funciona no navegador, então avisa em vez de
    // deixar estourar erro de banco
    if (Platform.OS === "web") {
      setTela("semBanco");
      return;
    }

    (async () => {
      try {
        await obterBanco();
        if (!cancelado) setTela("login");
      } catch (e) {
        if (!cancelado) {
          setErro(e instanceof Error ? e.message : String(e));
          setTela("falha");
        }
      }
    })();
    return () => {
      cancelado = true;
    };
  }, []);

  function sair() {
    encerrarSessao();
    setTela("login");
  }

  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      {tela === "carregando" && (
        <Carregando texto="Preparando o banco local..." />
      )}

      {tela === "semBanco" && (
        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
            justifyContent: "center",
            padding: espaco.lg,
            backgroundColor: cores.branco,
            maxWidth: 560,
            alignSelf: "center",
          }}
        >
          <Text
            style={{
              fontSize: 24,
              fontWeight: "700",
              color: cores.cinza900,
              marginBottom: espaco.md,
            }}
          >
            StockEasy
          </Text>
          <Aviso
            tipo="info"
            texto={
              "Este aplicativo guarda os dados em SQLite, no próprio aparelho. " +
              "O módulo de banco não tem implementação para navegador, então a " +
              "execução precisa acontecer em um celular ou emulador."
            }
          />
          <Text
            style={{
              fontSize: 14,
              color: cores.cinza800,
              lineHeight: 22,
              marginBottom: espaco.md,
            }}
          >
            Para executar no celular: rode{" "}
            <Text style={{ fontWeight: "700" }}>npx expo start</Text> na pasta
            do projeto e abra o projeto a partir do próprio terminal, para o
            Expo CLI instalar a versão do Expo Go compatível com este SDK. O
            celular e o computador precisam estar na mesma rede.
          </Text>
          <Text style={{ fontSize: 14, color: cores.cinza800, lineHeight: 22 }}>
            A escolha do SQLite está justificada em{" "}
            <Text style={{ fontWeight: "700" }}>docs/03-arquitetura.md</Text>: o
            banco local é o que permite operar sem conexão, requisito do
            ambiente de uso, onde o sinal falha no depósito da loja.
          </Text>
        </ScrollView>
      )}

      {tela === "falha" && (
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            padding: espaco.lg,
            backgroundColor: cores.branco,
          }}
        >
          <Aviso
            tipo="erro"
            texto={`Não foi possível preparar o banco de dados local. ${erro ?? ""}`}
          />
          <Botao
            titulo="Tentar novamente"
            onPress={() => setTela("carregando")}
          />
        </View>
      )}

      {tela === "login" && (
        <LoginScreen
          onEntrou={() => setTela("app")}
          irParaCadastro={() => setTela("cadastro")}
        />
      )}

      {tela === "cadastro" && (
        <CadastroScreen
          onCadastrou={() => setTela("app")}
          voltar={() => setTela("login")}
        />
      )}

      {tela === "app" && <Navegacao onSair={sair} />}
    </SafeAreaProvider>
  );
}
