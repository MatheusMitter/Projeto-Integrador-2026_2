package br.pucgoias.stockeasy.config;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Date;
import java.util.Optional;
import javax.crypto.SecretKey;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

/**
 * Gera e valida o token de sessão (docs/03, seção 9). As claims carregam o
 * usuário, a loja e o perfil: toda consulta filtra pela loja do token, nunca
 * por parâmetro enviado pelo cliente (docs/02, "Escopo de loja").
 */
@Service
public class JwtService {

    /** O que o token identifica. */
    public record Sessao(long usuarioId, long lojaId, String perfil) {}

    private final SecretKey chave;
    private final long validadeHoras;

    public JwtService(
            @Value("${stockeasy.jwt.segredo}") String segredo,
            @Value("${stockeasy.jwt.validade-horas}") long validadeHoras) {
        this.chave = Keys.hmacShaKeyFor(segredo.getBytes(StandardCharsets.UTF_8));
        this.validadeHoras = validadeHoras;
    }

    public String gerar(Sessao sessao) {
        Instant agora = Instant.now();
        return Jwts.builder()
                .subject(String.valueOf(sessao.usuarioId()))
                .claim("loja_id", sessao.lojaId())
                .claim("perfil", sessao.perfil())
                .issuedAt(Date.from(agora))
                .expiration(Date.from(agora.plusSeconds(validadeHoras * 3600)))
                .signWith(chave)
                .compact();
    }

    /** Devolve a sessão do token, ou vazio se ele for inválido ou vencido. */
    public Optional<Sessao> validar(String token) {
        try {
            Claims claims = Jwts.parser().verifyWith(chave).build()
                    .parseSignedClaims(token).getPayload();
            return Optional.of(new Sessao(
                    Long.parseLong(claims.getSubject()),
                    claims.get("loja_id", Long.class),
                    claims.get("perfil", String.class)));
        } catch (JwtException | IllegalArgumentException e) {
            return Optional.empty();
        }
    }
}
