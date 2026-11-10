// Substituto do expo-network para os testes. Começa sem rede, para os testes
// que já existiam seguirem pelo caminho local; o teste que precisa de rede
// liga com definirRedeParaTeste(true).

let estado = { isConnected: false, isInternetReachable: false };

export async function getNetworkStateAsync() {
  return { ...estado };
}

export function addNetworkStateListener() {
  return { remove() {} };
}

export function definirRedeParaTeste(conectado) {
  estado = { isConnected: conectado, isInternetReachable: conectado };
}
