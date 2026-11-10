package br.pucgoias.stockeasy.dto;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

/** Resposta de POST /sync/enviar. */
public record RetornoLoteDTO(Aceitos aceitos, List<Divergencia> divergencias, Instant instanteServidor) {

    public record Aceitos(List<UUID> categorias, List<UUID> fornecedores, List<UUID> produtos,
                          List<UUID> movimentacoes) {}

    /** Produto cujo saldo ficou negativo ao aplicar o lote (DA09). */
    public record Divergencia(UUID produtoUuid, int saldo) {}
}
