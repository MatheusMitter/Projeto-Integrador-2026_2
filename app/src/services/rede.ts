// Conferência de internet antes de falar com a retaguarda. Sem rede, o app
// segue pelo caminho local, como sempre funcionou (RF37).

import * as Network from "expo-network";

export async function temInternet(): Promise<boolean> {
  try {
    const estado = await Network.getNetworkStateAsync();
    // isInternetReachable pode vir indefinido logo depois de a rede voltar;
    // só um "false" explícito impede a tentativa
    return estado.isConnected === true && estado.isInternetReachable !== false;
  } catch {
    return false;
  }
}

/** Avisa quando a rede volta, para a sincronização tentar na hora. */
export function aoVoltarARede(acao: () => void): () => void {
  const assinatura = Network.addNetworkStateListener((estado) => {
    if (estado.isConnected && estado.isInternetReachable !== false) acao();
  });
  return () => assinatura.remove();
}
