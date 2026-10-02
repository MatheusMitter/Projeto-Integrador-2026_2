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

export async function resolve(especificador, contexto, proximaResolucao) {
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
