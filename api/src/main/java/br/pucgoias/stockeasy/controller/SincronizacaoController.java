package br.pucgoias.stockeasy.controller;

import br.pucgoias.stockeasy.config.SegurancaConfig;
import br.pucgoias.stockeasy.dto.AlteracoesDTO;
import br.pucgoias.stockeasy.dto.AutenticacaoDTO;
import br.pucgoias.stockeasy.dto.LoteDTO;
import br.pucgoias.stockeasy.dto.RetornoLoteDTO;
import br.pucgoias.stockeasy.service.SincronizacaoService;
import jakarta.validation.Valid;
import java.time.Instant;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/sync")
public class SincronizacaoController {

    private final SincronizacaoService sincronizacao;

    public SincronizacaoController(SincronizacaoService sincronizacao) {
        this.sincronizacao = sincronizacao;
    }

    @PostMapping("/enviar")
    public RetornoLoteDTO enviar(@Valid @RequestBody LoteDTO lote) {
        return sincronizacao.aplicar(SegurancaConfig.sessaoAtual(), lote);
    }

    @GetMapping("/baixar")
    public AlteracoesDTO baixar(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Instant desde) {
        return sincronizacao.baixar(SegurancaConfig.sessaoAtual(), desde);
    }

    /** Lote com referência inválida: nada foi gravado (rollback); o aparelho corrige e reenvia. */
    @ExceptionHandler(SincronizacaoService.LoteInvalido.class)
    public ResponseEntity<AutenticacaoDTO.Erro> loteInvalido(SincronizacaoService.LoteInvalido e) {
        return ResponseEntity.status(HttpStatus.UNPROCESSABLE_ENTITY).body(new AutenticacaoDTO.Erro(e.getMessage()));
    }
}
