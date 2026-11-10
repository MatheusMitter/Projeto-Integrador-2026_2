package br.pucgoias.stockeasy.controller;

import br.pucgoias.stockeasy.dto.AutenticacaoDTO;
import br.pucgoias.stockeasy.service.AutenticacaoService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/auth")
public class AutenticacaoController {

    private final AutenticacaoService autenticacao;

    public AutenticacaoController(AutenticacaoService autenticacao) {
        this.autenticacao = autenticacao;
    }

    /** 201 com o token; 409 se o e-mail já tem conta. */
    @PostMapping("/registrar")
    public ResponseEntity<?> registrar(@Valid @RequestBody AutenticacaoDTO.Registro dados) {
        return autenticacao.registrar(dados)
                .<ResponseEntity<?>>map(r -> ResponseEntity.status(HttpStatus.CREATED).body(r))
                .orElseGet(() -> ResponseEntity.status(HttpStatus.CONFLICT)
                        .body(new AutenticacaoDTO.Erro("Já existe uma conta com este e-mail.")));
    }

    /** 200 com o token; 401 neutro em qualquer falha. */
    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody AutenticacaoDTO.Login dados) {
        return autenticacao.entrar(dados)
                .<ResponseEntity<?>>map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(new AutenticacaoDTO.Erro("E-mail ou senha inválidos.")));
    }
}
