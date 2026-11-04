package br.pucgoias.stockeasy.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

/**
 * Corpo de POST /sync/enviar. Os itens se identificam pelo uuid gerado no
 * aparelho; referências entre eles também são por uuid, nunca pelo id local.
 * atualizadoEm é só informativo: a ordem que vale é a de chegada (DA10).
 */
public record LoteDTO(
        @Valid List<Categoria> categorias,
        @Valid List<Fornecedor> fornecedores,
        @Valid List<Produto> produtos,
        @Valid List<Movimentacao> movimentacoes) {

    public LoteDTO {
        categorias = categorias == null ? List.of() : categorias;
        fornecedores = fornecedores == null ? List.of() : fornecedores;
        produtos = produtos == null ? List.of() : produtos;
        movimentacoes = movimentacoes == null ? List.of() : movimentacoes;
    }

    public record Categoria(@NotNull UUID uuid, @NotBlank String nome, boolean ativo, Instant atualizadoEm) {}

    public record Fornecedor(@NotNull UUID uuid, @NotBlank String nome, String telefone, String email,
                             boolean ativo, Instant atualizadoEm) {}

    public record Produto(@NotNull UUID uuid, @NotBlank String nome, String codigoBarras,
                          @NotNull UUID categoriaUuid, UUID fornecedorUuid,
                          @NotNull BigDecimal precoCusto, @NotNull BigDecimal precoVenda,
                          @Min(0) int estoqueMinimo, LocalDate dataValidade, boolean ativo,
                          Instant atualizadoEm) {}

    public record Movimentacao(@NotNull UUID uuid, @NotNull UUID produtoUuid, @NotBlank String tipo,
                               @Min(1) int quantidade, @NotNull Instant dataHora, String observacoes) {}
}
