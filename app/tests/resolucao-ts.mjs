// Hook de resolução para os testes.
//
// O código do aplicativo importa sem extensão ("../domain/tipos"), que é o
// que o Metro, empacotador do React Native, espera. O carregador de módulos
// do Node exige a extensão. Em vez de mudar os imports do aplicativo e
// arriscar o empacotamento, o ajuste fica aqui: quando um caminho relativo
// não resolve, tenta de novo com ".ts".
//
// Isso existe só para o teste conseguir importar as regras de verdade, em
// vez de manter uma cópia delas.
//
// Os módulos nativos do Expo só rodam no aparelho. Nos testes, cada um é
// trocado por um substituto sobre o Node: o expo-sqlite pelo SQLite do Node,
// para os repositórios e serviços rodarem o SQL de verdade; o expo-crypto
// pelo crypto do Node; o expo-secure-store por um cofre em memória; o
// expo-network por um estado de rede que o teste liga e desliga; e o
// expo-notifications por um registro do que o app agendou.

const SUBSTITUTOS = {
  "expo-sqlite": "./apoio/expo-sqlite-node.mjs",
  "expo-crypto": "./apoio/expo-crypto-node.mjs",
  "expo-secure-store": "./apoio/expo-secure-store-node.mjs",
  "expo-network": "./apoio/expo-network-node.mjs",
  "expo-notifications": "./apoio/expo-notifications-node.mjs",
};

export async function resolve(especificador, contexto, proximaResolucao) {
  if (especificador in SUBSTITUTOS) {
    return { url: new URL(SUBSTITUTOS[especificador], import.meta.url).href, shortCircuit: true };
  }
  try {
    return await proximaResolucao(especificador, contexto);
  } catch (erro) {
    const relativo = especificador.startsWith("./") || especificador.startsWith("../");
    const semExtensao = !/\.[a-z]+$/i.test(especificador);

    if (relativo && semExtensao) {
      return proximaResolucao(`${especificador}.ts`, contexto);
    }
    throw erro;
  }
}
