package br.pucgoias.stockeasy.service;

import br.pucgoias.stockeasy.config.JwtService;
import br.pucgoias.stockeasy.dao.SincronizacaoDao;
import br.pucgoias.stockeasy.dto.AlteracoesDTO;
import br.pucgoias.stockeasy.dto.LoteDTO;
import br.pucgoias.stockeasy.dto.RetornoLoteDTO;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Consolida o lote de um aparelho numa única transação (docs/03, seção 7).
 * DA09: saída além do estoque não é recusada; vira alerta DIVERGENCIA.
 * DA10: a ordem é a de chegada ao servidor, não o relógio do aparelho.
 * RN09: cadastro com uuid repetido é sobrescrito; movimentação repetida é ignorada.
 */
@Service
public class SincronizacaoService {

    static final Set<String> ENTRADAS = Set.of("COMPRA", "DEVOLUCAO_CLIENTE", "AJUSTE_ENTRADA");
    static final Set<String> SAIDAS = Set.of("VENDA", "PERDA", "VENCIMENTO", "DEVOLUCAO_FORNECEDOR",
            "AJUSTE_SAIDA", "OUTROS");

    /** Item do lote que não pode ser aplicado (referência a outra loja ou inexistente). */
    public static class LoteInvalido extends RuntimeException {
        public LoteInvalido(String mensagem) {
            super(mensagem);
        }
    }

    private final SincronizacaoDao dao;

    public SincronizacaoService(SincronizacaoDao dao) {
        this.dao = dao;
    }

    @Transactional
    public RetornoLoteDTO aplicar(JwtService.Sessao sessao, LoteDTO lote) {
        long lojaId = sessao.lojaId();
        List<UUID> categorias = new ArrayList<>();
        List<UUID> fornecedores = new ArrayList<>();
        List<UUID> produtos = new ArrayList<>();
        List<UUID> movimentacoes = new ArrayList<>();
        List<RetornoLoteDTO.Divergencia> divergencias = new ArrayList<>();

        for (var c : lote.categorias()) {
            dao.salvarCategoria(lojaId, c);
            categorias.add(c.uuid());
        }
        for (var f : lote.fornecedores()) {
            dao.salvarFornecedor(lojaId, f);
            fornecedores.add(f.uuid());
        }
        for (var p : lote.produtos()) {
            long categoriaId = dao.idCategoria(lojaId, p.categoriaUuid())
                    .orElseThrow(() -> new LoteInvalido("Categoria desconhecida no produto " + p.uuid()));
            Long fornecedorId = p.fornecedorUuid() == null ? null
                    : dao.idFornecedor(lojaId, p.fornecedorUuid())
                            .orElseThrow(() -> new LoteInvalido("Fornecedor desconhecido no produto " + p.uuid()));
            dao.salvarProduto(lojaId, p, categoriaId, fornecedorId);
            produtos.add(p.uuid());
        }
        for (var m : lote.movimentacoes()) {
            if (dao.movimentacaoExiste(m.uuid())) {
                movimentacoes.add(m.uuid()); // já aplicada num envio anterior
                continue;
            }
            var produto = dao.trancarProduto(lojaId, m.produtoUuid())
                    .orElseThrow(() -> new LoteInvalido("Produto desconhecido na movimentação " + m.uuid()));
            int saldo = produto.estoqueAtual() + sinal(m.tipo()) * m.quantidade();
            dao.inserirMovimentacao(m, produto.id(), sessao.usuarioId(), saldo);
            dao.atualizarEstoque(produto.id(), saldo);
            if (saldo < 0) {
                dao.inserirAlerta(produto.id(), "DIVERGENCIA",
                        "Saldo ajustado pelo servidor: saídas somadas passaram do estoque (" + saldo + ").");
                divergencias.add(new RetornoLoteDTO.Divergencia(m.produtoUuid(), saldo));
            }
            movimentacoes.add(m.uuid());
        }
        return new RetornoLoteDTO(
                new RetornoLoteDTO.Aceitos(categorias, fornecedores, produtos, movimentacoes),
                divergencias, dao.agora());
    }

    @Transactional(readOnly = true)
    public AlteracoesDTO baixar(JwtService.Sessao sessao, Instant desde) {
        long lojaId = sessao.lojaId();
        return new AlteracoesDTO(dao.categorias(lojaId, desde), dao.fornecedores(lojaId, desde),
                dao.produtos(lojaId, desde), dao.movimentacoes(lojaId, desde), dao.alertas(lojaId, desde),
                dao.agora());
    }

    private static int sinal(String tipo) {
        if (ENTRADAS.contains(tipo)) return 1;
        if (SAIDAS.contains(tipo)) return -1;
        throw new LoteInvalido("Tipo de movimentação desconhecido: " + tipo);
    }
}
