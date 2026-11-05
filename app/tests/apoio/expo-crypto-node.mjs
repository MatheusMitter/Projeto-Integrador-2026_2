// Substituto do expo-crypto para os testes, sobre o crypto do Node.
// Implementa só o que o aplicativo usa: uuid, bytes aleatórios e SHA-256.

import { createHash, randomBytes, randomUUID as uuidDoNode } from "node:crypto";

export const CryptoDigestAlgorithm = { SHA256: "SHA-256" };
export const CryptoEncoding = { HEX: "hex", BASE64: "base64" };

export function randomUUID() {
  return uuidDoNode();
}

export function getRandomBytes(quantidade) {
  return new Uint8Array(randomBytes(quantidade));
}

export async function digestStringAsync(algoritmo, dados, opcoes = {}) {
  if (algoritmo !== CryptoDigestAlgorithm.SHA256) {
    throw new Error(`Algoritmo sem substituto nos testes: ${algoritmo}`);
  }
  const saida = opcoes.encoding === CryptoEncoding.BASE64 ? "base64" : "hex";
  return createHash("sha256").update(dados, "utf8").digest(saida);
}
