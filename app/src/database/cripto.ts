// Identificadores e resumo de senha guardados no banco do aparelho.
//
// O uuid segue o formato padrão (versão 4), o mesmo do tipo `uuid` do
// PostgreSQL da retaguarda; o formato antigo, com o relógio em hexadecimal,
// era recusado pelo servidor. A senha nunca fica em texto puro: guarda-se o
// SHA-256 da senha com um sal aleatório por usuário (DA11), o bastante para o
// login sem rede sem que uma cópia do banco revele a senha.

import * as Crypto from "expo-crypto";

const FORMATO_UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const PREFIXO_RESUMO = "sha256";

export function novoUuid(): string {
  return Crypto.randomUUID();
}

export function ehUuid(valor: string): boolean {
  return FORMATO_UUID.test(valor);
}

function emHexadecimal(bytes: Uint8Array): string {
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

/** Resumo no formato sha256$<sal>$<resumo>. Sem sal informado, sorteia um. */
export async function resumirSenha(
  senha: string,
  sal = emHexadecimal(Crypto.getRandomBytes(16)),
): Promise<string> {
  const resumo = await Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    `${sal}:${senha}`,
  );
  return `${PREFIXO_RESUMO}$${sal}$${resumo}`;
}

export function ehResumo(guardado: string): boolean {
  return guardado.startsWith(`${PREFIXO_RESUMO}$`);
}

/** Refaz o resumo com o sal guardado e compara com o que está no banco. */
export async function conferirSenha(senha: string, guardado: string): Promise<boolean> {
  const [prefixo, sal, resumo] = guardado.split("$");
  if (prefixo !== PREFIXO_RESUMO || !sal || !resumo) return false;
  return (await resumirSenha(senha, sal)) === guardado;
}
