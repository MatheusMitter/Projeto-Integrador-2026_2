package br.pucgoias.stockeasy.dto;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

/** Resposta de GET /sync/baixar: tudo da loja alterado depois de `desde`. */
public record AlteracoesDTO(List<Categoria> categorias, List<Fornecedor> fornecedores, List<Produto> produtos,
                            List<Movimentacao> movimentacoes, List<Alerta> alertas, Instant instanteServidor) {

    public record Categoria(UUID uuid, String nome, boolean ativo, Instant atualizadoEm) {}

    public record Fornecedor(UUID uuid, String nome, String telefone, String email, boolean ativo,
                             Instant atualizadoEm) {}

    public record Produto(UUID uuid, String nome, String codigoBarras, UUID categoriaUuid, UUID fornecedorUuid,
                          BigDecimal precoCusto, BigDecimal precoVenda, int estoqueAtual, int estoqueMinimo,
                          LocalDate dataValidade, boolean ativo, Instant atualizadoEm) {}

    public record Movimentacao(UUID uuid, UUID produtoUuid, UUID usuarioUuid, String tipo, int quantidade,
                               int saldoApos, Instant dataHora, String observacoes) {}

    public record Alerta(long id, UUID produtoUuid, String tipoAlerta, String mensagem, boolean lido,
                         Instant criadoEm) {}
}
