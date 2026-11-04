package br.pucgoias.stockeasy.service;

import br.pucgoias.stockeasy.config.JwtService;
import br.pucgoias.stockeasy.dao.UsuarioDao;
import br.pucgoias.stockeasy.dto.AutenticacaoDTO;
import java.util.Optional;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Registro de loja com proprietário e login. A resposta de erro nunca diz
 * qual campo errou, para não revelar quais e-mails têm conta.
 */
@Service
public class AutenticacaoService {

    private final UsuarioDao usuarios;
    private final PasswordEncoder senhas;
    private final JwtService jwt;

    public AutenticacaoService(UsuarioDao usuarios, PasswordEncoder senhas, JwtService jwt) {
        this.usuarios = usuarios;
        this.senhas = senhas;
        this.jwt = jwt;
    }

    /** Cria a loja e o proprietário numa transação; vazio se o e-mail já existe. */
    @Transactional
    public Optional<AutenticacaoDTO.Resposta> registrar(AutenticacaoDTO.Registro dados) {
        String email = dados.email().trim().toLowerCase();
        if (usuarios.porEmail(email).isPresent()) return Optional.empty();

        long lojaId = usuarios.criarLoja(dados.nomeLoja().trim());
        long usuarioId = usuarios.criarUsuario(lojaId, dados.nome().trim(), email,
                senhas.encode(dados.senha()), "PROPRIETARIO");
        return Optional.of(resposta(usuarios.porId(usuarioId).orElseThrow()));
    }

    /** Vazio em qualquer falha: e-mail desconhecido, senha errada ou usuário inativo. */
    public Optional<AutenticacaoDTO.Resposta> entrar(AutenticacaoDTO.Login dados) {
        return usuarios.porEmail(dados.email().trim().toLowerCase())
                .filter(UsuarioDao.Usuario::ativo)
                .filter(u -> senhas.matches(dados.senha(), u.senhaHash()))
                .map(this::resposta);
    }

    private AutenticacaoDTO.Resposta resposta(UsuarioDao.Usuario u) {
        var loja = usuarios.lojaPorId(u.lojaId());
        String token = jwt.gerar(new JwtService.Sessao(u.id(), u.lojaId(), u.perfil()));
        return new AutenticacaoDTO.Resposta(token,
                new AutenticacaoDTO.UsuarioResposta(u.uuid(), u.nome(), u.email(), u.perfil()),
                new AutenticacaoDTO.LojaResposta(loja.uuid(), loja.nome()));
    }
}
