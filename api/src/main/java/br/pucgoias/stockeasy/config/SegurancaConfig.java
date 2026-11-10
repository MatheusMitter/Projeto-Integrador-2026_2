package br.pucgoias.stockeasy.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.List;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.filter.OncePerRequestFilter;

/**
 * /auth/** é público; o resto exige o token no cabeçalho Authorization.
 * Sem sessão de servidor: cada requisição se identifica pelo token.
 */
@Configuration
public class SegurancaConfig {

    @Bean
    PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    SecurityFilterChain filtros(HttpSecurity http, JwtService jwt) throws Exception {
        http.csrf(csrf -> csrf.disable())
                .sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(a -> a
                        .requestMatchers("/auth/**").permitAll()
                        .anyRequest().authenticated())
                .exceptionHandling(e -> e.authenticationEntryPoint(
                        (req, res, ex) -> res.sendError(HttpStatus.UNAUTHORIZED.value())))
                .addFilterBefore(new FiltroJwt(jwt), UsernamePasswordAuthenticationFilter.class);
        return http.build();
    }

    /** Lê o Bearer token e coloca a sessão no contexto de segurança. */
    static class FiltroJwt extends OncePerRequestFilter {
        private final JwtService jwt;

        FiltroJwt(JwtService jwt) {
            this.jwt = jwt;
        }

        @Override
        protected void doFilterInternal(HttpServletRequest req, HttpServletResponse res, FilterChain chain)
                throws ServletException, IOException {
            String cabecalho = req.getHeader("Authorization");
            if (cabecalho != null && cabecalho.startsWith("Bearer ")) {
                jwt.validar(cabecalho.substring(7)).ifPresent(sessao -> {
                    var auth = new UsernamePasswordAuthenticationToken(
                            sessao, null, List.of(new SimpleGrantedAuthority("ROLE_" + sessao.perfil())));
                    SecurityContextHolder.getContext().setAuthentication(auth);
                });
            }
            chain.doFilter(req, res);
        }
    }

    /** A sessão da requisição atual, para os controladores. */
    public static JwtService.Sessao sessaoAtual() {
        var auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !(auth.getPrincipal() instanceof JwtService.Sessao s)) {
            throw new IllegalStateException("Requisição sem sessão");
        }
        return s;
    }
}
