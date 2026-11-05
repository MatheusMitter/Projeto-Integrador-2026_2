// Endereço da retaguarda. Sem a variável EXPO_PUBLIC_API_URL, o app usa a
// hospedagem de homologação, que já é HTTPS. Para o servidor local no
// emulador, rodar com EXPO_PUBLIC_API_URL=http://10.0.2.2:8080; o HTTP sem
// criptografia só é aceito no APK de desenvolvimento.

const HOMOLOGACAO = "https://projeto-integrador-2026-2.onrender.com";

export const URL_API = (process.env.EXPO_PUBLIC_API_URL || HOMOLOGACAO).replace(/\/+$/, "");
