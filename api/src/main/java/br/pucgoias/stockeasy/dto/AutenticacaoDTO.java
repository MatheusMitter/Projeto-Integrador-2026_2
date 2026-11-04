package br.pucgoias.stockeasy.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.util.UUID;

/** Contratos de /auth/registrar e /auth/login (spec checkpoint-2, design §3). */
public final class AutenticacaoDTO {

    private AutenticacaoDTO() {}

    public record Registro(
            @NotBlank @Size(max = 120) String nomeLoja,
            @NotBlank @Size(max = 100) String nome,
            @NotBlank @Email @Size(max = 100) String email,
            @NotBlank @Size(min = 6, max = 72) String senha) {}

    public record Login(@NotBlank @Email String email, @NotBlank String senha) {}

    public record UsuarioResposta(UUID uuid, String nome, String email, String perfil) {}

    public record LojaResposta(UUID uuid, String nome) {}

    public record Resposta(String token, UsuarioResposta usuario, LojaResposta loja) {}

    public record Erro(String mensagem) {}
}
