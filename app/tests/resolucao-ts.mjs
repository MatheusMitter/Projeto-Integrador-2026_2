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
// O expo-sqlite só roda no aparelho. Nos testes, ele é trocado por um
// adaptador sobre o SQLite do Node, para os repositórios e serviços rodarem
// o SQL de verdade.

const EXPO_SQLITE_NO_NODE = new URL("./apoio/expo-sqlite-node.mjs", import.meta.url).href;

export async function resolve(especificador, contexto, proximaResolucao) {
  if (especificador === "expo-sqlite") {
    return { url: EXPO_SQLITE_NO_NODE, shortCircuit: true };
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
