package br.pucgoias.stockeasy.config;

import br.pucgoias.stockeasy.dto.AutenticacaoDTO;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

/** Corpo de erro uniforme: { mensagem }. Qualquer falha inesperada vira 500 e rollback. */
@RestControllerAdvice
public class TratamentoErros {

    private static final Logger log = LoggerFactory.getLogger(TratamentoErros.class);

    @ExceptionHandler({MethodArgumentNotValidException.class, HttpMessageNotReadableException.class})
    public ResponseEntity<AutenticacaoDTO.Erro> dadosInvalidos(Exception e) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(new AutenticacaoDTO.Erro("Dados inválidos na requisição."));
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<AutenticacaoDTO.Erro> inesperado(Exception e) {
        log.error("Falha inesperada", e);
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new AutenticacaoDTO.Erro("Falha no servidor. Tente de novo mais tarde."));
    }
}
