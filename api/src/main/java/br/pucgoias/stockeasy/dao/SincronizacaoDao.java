package br.pucgoias.stockeasy.dao;

import br.pucgoias.stockeasy.dto.AlteracoesDTO;
import br.pucgoias.stockeasy.dto.LoteDTO;
import java.sql.Date;
import java.sql.Timestamp;
import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

/**
 * SQL da sincronização. Toda consulta recebe o loja_id vindo do token:
 * um aparelho nunca lê nem grava fora da própria loja.
 */
@Repository
public class SincronizacaoDao {

    private final JdbcTemplate jdbc;

    public SincronizacaoDao(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    // ---- envio (upsert por uuid; o mais recente pela chegada vence, RN09) ----

    // Os três salvar* devolvem 0 quando o uuid já pertence a outra loja: o
    // WHERE do ON CONFLICT impede a alteração e o serviço recusa o lote.

    public int salvarCategoria(long lojaId, LoteDTO.Categoria c) {
        return jdbc.update("""
                INSERT INTO categoria (uuid, loja_id, nome, ativo) VALUES (?, ?, ?, ?)
                ON CONFLICT (uuid) DO UPDATE SET nome = EXCLUDED.nome, ativo = EXCLUDED.ativo
                WHERE categoria.loja_id = EXCLUDED.loja_id""",
                c.uuid(), lojaId, c.nome(), c.ativo());
    }

    public int salvarFornecedor(long lojaId, LoteDTO.Fornecedor f) {
        return jdbc.update("""
                INSERT INTO fornecedor (uuid, loja_id, nome, telefone, email, ativo) VALUES (?, ?, ?, ?, ?, ?)
                ON CONFLICT (uuid) DO UPDATE SET nome = EXCLUDED.nome, telefone = EXCLUDED.telefone,
                    email = EXCLUDED.email, ativo = EXCLUDED.ativo
                WHERE fornecedor.loja_id = EXCLUDED.loja_id""",
                f.uuid(), lojaId, f.nome(), f.telefone(), f.email(), f.ativo());
    }

    /** estoque_atual não vem do aparelho: só as movimentações o alteram. */
    public int salvarProduto(long lojaId, LoteDTO.Produto p, long categoriaId, Long fornecedorId) {
        return jdbc.update("""
                INSERT INTO produto (uuid, loja_id, nome, codigo_barras, categoria_id, fornecedor_id,
                    preco_custo, preco_venda, estoque_minimo, data_validade, ativo)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                ON CONFLICT (uuid) DO UPDATE SET nome = EXCLUDED.nome, codigo_barras = EXCLUDED.codigo_barras,
                    categoria_id = EXCLUDED.categoria_id, fornecedor_id = EXCLUDED.fornecedor_id,
                    preco_custo = EXCLUDED.preco_custo, preco_venda = EXCLUDED.preco_venda,
                    estoque_minimo = EXCLUDED.estoque_minimo, data_validade = EXCLUDED.data_validade,
                    ativo = EXCLUDED.ativo
                WHERE produto.loja_id = EXCLUDED.loja_id""",
                p.uuid(), lojaId, p.nome(), p.codigoBarras(), categoriaId, fornecedorId,
                p.precoCusto(), p.precoVenda(), p.estoqueMinimo(),
                p.dataValidade() == null ? null : Date.valueOf(p.dataValidade()), p.ativo());
    }

    public Optional<Long> idCategoria(long lojaId, UUID uuid) {
        return idPorUuid("categoria", lojaId, uuid);
    }

    public Optional<Long> idFornecedor(long lojaId, UUID uuid) {
        return idPorUuid("fornecedor", lojaId, uuid);
    }

    private Optional<Long> idPorUuid(String tabela, long lojaId, UUID uuid) {
        return jdbc.queryForList("SELECT id FROM " + tabela + " WHERE uuid = ? AND loja_id = ?",
                Long.class, uuid, lojaId).stream().findFirst();
    }

    /** Tranca a linha do produto até o fim da transação e devolve id e saldo. */
    public record ProdutoTrancado(long id, int estoqueAtual) {}

    public Optional<ProdutoTrancado> trancarProduto(long lojaId, UUID uuid) {
        return jdbc.query("SELECT id, estoque_atual FROM produto WHERE uuid = ? AND loja_id = ? FOR UPDATE",
                (rs, i) -> new ProdutoTrancado(rs.getLong("id"), rs.getInt("estoque_atual")),
                uuid, lojaId).stream().findFirst();
    }

    /** Loja da movimentação já gravada com este uuid, ou vazio se ela é nova. */
    public Optional<Long> lojaDaMovimentacao(UUID uuid) {
        return jdbc.queryForList("""
                SELECT p.loja_id FROM movimentacao m JOIN produto p ON p.id = m.produto_id
                WHERE m.uuid = ?""", Long.class, uuid).stream().findFirst();
    }

    public void inserirMovimentacao(LoteDTO.Movimentacao m, long produtoId, long usuarioId, int saldoApos) {
        jdbc.update("""
                INSERT INTO movimentacao (uuid, produto_id, usuario_id, tipo, quantidade, saldo_apos, data_hora, observacoes)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)""",
                m.uuid(), produtoId, usuarioId, m.tipo(), m.quantidade(), saldoApos,
                Timestamp.from(m.dataHora()), m.observacoes());
    }

    public void atualizarEstoque(long produtoId, int estoqueAtual) {
        jdbc.update("UPDATE produto SET estoque_atual = ? WHERE id = ?", estoqueAtual, produtoId);
    }

    public void inserirAlerta(long produtoId, String tipo, String mensagem) {
        jdbc.update("INSERT INTO alerta (produto_id, tipo_alerta, mensagem) VALUES (?, ?, ?)",
                produtoId, tipo, mensagem);
    }

    // ---- download (tudo da loja alterado depois de `desde`) ----

    private static Timestamp desde(Instant desde) {
        return Timestamp.from(desde == null ? Instant.EPOCH : desde);
    }

    private static Instant instante(Timestamp t) {
        return t == null ? null : t.toInstant();
    }

    public List<AlteracoesDTO.Categoria> categorias(long lojaId, Instant desde) {
        return jdbc.query("""
                SELECT uuid, nome, ativo, atualizado_em FROM categoria
                WHERE loja_id = ? AND atualizado_em > ? ORDER BY atualizado_em""",
                (rs, i) -> new AlteracoesDTO.Categoria(rs.getObject("uuid", UUID.class), rs.getString("nome"),
                        rs.getBoolean("ativo"), instante(rs.getTimestamp("atualizado_em"))),
                lojaId, desde(desde));
    }

    public List<AlteracoesDTO.Fornecedor> fornecedores(long lojaId, Instant desde) {
        return jdbc.query("""
                SELECT uuid, nome, telefone, email, ativo, atualizado_em FROM fornecedor
                WHERE loja_id = ? AND atualizado_em > ? ORDER BY atualizado_em""",
                (rs, i) -> new AlteracoesDTO.Fornecedor(rs.getObject("uuid", UUID.class), rs.getString("nome"),
                        rs.getString("telefone"), rs.getString("email"), rs.getBoolean("ativo"),
                        instante(rs.getTimestamp("atualizado_em"))),
                lojaId, desde(desde));
    }

    public List<AlteracoesDTO.Produto> produtos(long lojaId, Instant desde) {
        return jdbc.query("""
                SELECT p.uuid, p.nome, p.codigo_barras, c.uuid AS categoria_uuid, f.uuid AS fornecedor_uuid,
                       p.preco_custo, p.preco_venda, p.estoque_atual, p.estoque_minimo, p.data_validade,
                       p.ativo, p.atualizado_em
                FROM produto p
                JOIN categoria c ON c.id = p.categoria_id
                LEFT JOIN fornecedor f ON f.id = p.fornecedor_id
                WHERE p.loja_id = ? AND p.atualizado_em > ? ORDER BY p.atualizado_em""",
                (rs, i) -> new AlteracoesDTO.Produto(rs.getObject("uuid", UUID.class), rs.getString("nome"),
                        rs.getString("codigo_barras"), rs.getObject("categoria_uuid", UUID.class),
                        rs.getObject("fornecedor_uuid", UUID.class), rs.getBigDecimal("preco_custo"),
                        rs.getBigDecimal("preco_venda"), rs.getInt("estoque_atual"), rs.getInt("estoque_minimo"),
                        rs.getDate("data_validade") == null ? null : rs.getDate("data_validade").toLocalDate(),
                        rs.getBoolean("ativo"), instante(rs.getTimestamp("atualizado_em"))),
                lojaId, desde(desde));
    }

    /** Movimentação nunca muda: o corte é pelo instante em que o servidor a recebeu (V2). */
    public List<AlteracoesDTO.Movimentacao> movimentacoes(long lojaId, Instant desde) {
        return jdbc.query("""
                SELECT m.uuid, p.uuid AS produto_uuid, u.uuid AS usuario_uuid, m.tipo, m.quantidade,
                       m.saldo_apos, m.data_hora, m.observacoes
                FROM movimentacao m
                JOIN produto p ON p.id = m.produto_id
                JOIN usuario u ON u.id = m.usuario_id
                WHERE p.loja_id = ? AND m.recebido_em > ? ORDER BY m.id""",
                (rs, i) -> new AlteracoesDTO.Movimentacao(rs.getObject("uuid", UUID.class),
                        rs.getObject("produto_uuid", UUID.class), rs.getObject("usuario_uuid", UUID.class),
                        rs.getString("tipo"), rs.getInt("quantidade"), rs.getInt("saldo_apos"),
                        instante(rs.getTimestamp("data_hora")), rs.getString("observacoes")),
                lojaId, desde(desde));
    }

    public List<AlteracoesDTO.Alerta> alertas(long lojaId, Instant desde) {
        return jdbc.query("""
                SELECT a.id, p.uuid AS produto_uuid, a.tipo_alerta, a.mensagem, a.lido, a.criado_em
                FROM alerta a JOIN produto p ON p.id = a.produto_id
                WHERE p.loja_id = ? AND a.criado_em > ? ORDER BY a.id""",
                (rs, i) -> new AlteracoesDTO.Alerta(rs.getLong("id"), rs.getObject("produto_uuid", UUID.class),
                        rs.getString("tipo_alerta"), rs.getString("mensagem"), rs.getBoolean("lido"),
                        instante(rs.getTimestamp("criado_em"))),
                lojaId, desde(desde));
    }

    public Instant agora() {
        return jdbc.queryForObject("SELECT NOW()", Timestamp.class).toInstant();
    }
}
