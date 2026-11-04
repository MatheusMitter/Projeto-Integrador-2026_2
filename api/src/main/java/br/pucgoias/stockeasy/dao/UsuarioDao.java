package br.pucgoias.stockeasy.dao;

import java.util.Optional;
import java.util.UUID;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.support.GeneratedKeyHolder;
import org.springframework.stereotype.Repository;

/** Loja e usuário: só o que a autenticação precisa. */
@Repository
public class UsuarioDao {

    public record Usuario(long id, UUID uuid, long lojaId, String nome, String email,
                          String senhaHash, String perfil, boolean ativo) {}

    public record Loja(long id, UUID uuid, String nome) {}

    private final JdbcTemplate jdbc;

    public UsuarioDao(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    public Optional<Usuario> porEmail(String email) {
        return jdbc.query(
                "SELECT id, uuid, loja_id, nome, email, senha_hash, tipo_perfil, ativo FROM usuario WHERE email = ?",
                (rs, i) -> new Usuario(rs.getLong("id"), rs.getObject("uuid", UUID.class), rs.getLong("loja_id"),
                        rs.getString("nome"), rs.getString("email"), rs.getString("senha_hash"),
                        rs.getString("tipo_perfil"), rs.getBoolean("ativo")),
                email).stream().findFirst();
    }

    public Loja lojaPorId(long id) {
        return jdbc.queryForObject("SELECT id, uuid, nome FROM loja WHERE id = ?",
                (rs, i) -> new Loja(rs.getLong("id"), rs.getObject("uuid", UUID.class), rs.getString("nome")), id);
    }

    public long criarLoja(String nome) {
        var chaves = new GeneratedKeyHolder();
        jdbc.update(con -> {
            var ps = con.prepareStatement("INSERT INTO loja (nome) VALUES (?)", new String[] {"id"});
            ps.setString(1, nome);
            return ps;
        }, chaves);
        return chaves.getKey().longValue();
    }

    public long criarUsuario(long lojaId, String nome, String email, String senhaHash, String perfil) {
        var chaves = new GeneratedKeyHolder();
        jdbc.update(con -> {
            var ps = con.prepareStatement(
                    "INSERT INTO usuario (loja_id, nome, email, senha_hash, tipo_perfil) VALUES (?, ?, ?, ?, ?)",
                    new String[] {"id"});
            ps.setLong(1, lojaId);
            ps.setString(2, nome);
            ps.setString(3, email);
            ps.setString(4, senhaHash);
            ps.setString(5, perfil);
            return ps;
        }, chaves);
        return chaves.getKey().longValue();
    }

    public Optional<Usuario> porId(long id) {
        return jdbc.query(
                "SELECT id, uuid, loja_id, nome, email, senha_hash, tipo_perfil, ativo FROM usuario WHERE id = ?",
                (rs, i) -> new Usuario(rs.getLong("id"), rs.getObject("uuid", UUID.class), rs.getLong("loja_id"),
                        rs.getString("nome"), rs.getString("email"), rs.getString("senha_hash"),
                        rs.getString("tipo_perfil"), rs.getBoolean("ativo")),
                id).stream().findFirst();
    }
}
