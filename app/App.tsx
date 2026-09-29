/**
 * Ponto de entrada da aplicação.
 *
 * Decide entre a área autenticada e as telas de acesso, e garante que o
 * banco local esteja criado antes de qualquer tela tentar consultar.
 */

import React, { useEffect, useState } from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { View } from "react-native";

import LoginScreen from "./src/screens/LoginScreen";
import CadastroScreen from "./src/screens/CadastroScreen";
import Navegacao from "./src/navigation/Navegacao";
import { Aviso, Botao, Carregando } from "./src/components/base";
import { obterBanco } from "./src/database/conexao";
import { encerrarSessao } from "./src/services/authService";
import { cores, espaco } from "./src/theme/tema";

type Tela = "carregando" | "login" | "cadastro" | "app" | "falha";

export default function App() {
  const [tela, setTela] = useState<Tela>("carregando");
  const [erro, setErro] = useState<string | null>(null);

  // Abrir o banco cria o esquema e a carga inicial na primeira execução.
  // Se falhar, a aplicação avisa em vez de abrir uma tela quebrada.
  useEffect(() => {
    let cancelado = false;
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
      {tela === "carregando" && <Carregando texto="Preparando o banco local..." />}

      {tela === "falha" && (
        <View style={{ flex: 1, justifyContent: "center", padding: espaco.lg, backgroundColor: cores.branco }}>
          <Aviso
            tipo="erro"
            texto={`Não foi possível preparar o banco de dados local. ${erro ?? ""}`}
          />
          <Botao titulo="Tentar novamente" onPress={() => setTela("carregando")} />
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
