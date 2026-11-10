// Substituto do expo-secure-store para os testes: guarda em memória, só
// durante o processo do arquivo de teste.

const itens = new Map();

export async function getItemAsync(chave) {
  return itens.has(chave) ? itens.get(chave) : null;
}

export async function setItemAsync(chave, valor) {
  itens.set(chave, String(valor));
}

export async function deleteItemAsync(chave) {
  itens.delete(chave);
}

export function limparCofreParaTeste() {
  itens.clear();
}
