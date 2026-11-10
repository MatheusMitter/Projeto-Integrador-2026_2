// Token da retaguarda, guardado no armazenamento seguro do sistema e nunca no
// SQLite (DA11). É do aparelho, não da tela: fica guardado ao sair da conta,
// para a sincronização continuar, e só é apagado quando o servidor o recusa.

import * as SecureStore from "expo-secure-store";

const CHAVE_TOKEN = "stockeasy_token";

export async function lerToken(): Promise<string | null> {
  try {
    return await SecureStore.getItemAsync(CHAVE_TOKEN);
  } catch {
    return null;
  }
}

export async function guardarToken(token: string): Promise<void> {
  await SecureStore.setItemAsync(CHAVE_TOKEN, token);
}

export async function apagarToken(): Promise<void> {
  await SecureStore.deleteItemAsync(CHAVE_TOKEN);
}
