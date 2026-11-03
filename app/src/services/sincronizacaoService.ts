// Sincronização com o servidor. Por enquanto só informa quanto está
// pendente; o envio entra junto com a retaguarda.

import * as sincronizacaoRepo from "../repositories/sincronizacaoRepository";

/**
 * Quantos registros locais ainda não foram enviados ao servidor.
 *
 * Enquanto o envio não existe, este número nunca diminui, porque nada marca
 * `sincronizado = 1` — e é exatamente isso que a coluna deve indicar hoje:
 * tudo o que está no aparelho está só aqui. A coluna já entrou no esquema
 * para não exigir migração do banco depois.
 */
export function registrosNaoSincronizados(): Promise<number> {
  return sincronizacaoRepo.contarPendentes();
}
