-- Ajustes para a consolidação de lotes vindos dos aparelhos
-- (docs/03-arquitetura.md, seção 7, decisões DA09 e DA10).

-- DA09: uma venda feita sem rede já aconteceu. Quando saídas de aparelhos
-- diferentes somadas passam do estoque, o servidor registra a divergência
-- em vez de recusar o lote. O saldo pode ficar negativo até o ajuste.
ALTER TABLE produto DROP CONSTRAINT IF EXISTS produto_estoque_atual_check;
ALTER TABLE movimentacao DROP CONSTRAINT IF EXISTS movimentacao_saldo_apos_check;

-- A divergência é um tipo próprio de alerta, para o aparelho mostrar
-- "saldo ajustado pelo servidor" e o proprietário conferir.
ALTER TABLE alerta DROP CONSTRAINT IF EXISTS alerta_tipo_alerta_check;
ALTER TABLE alerta ADD CONSTRAINT alerta_tipo_alerta_check
    CHECK (tipo_alerta IN ('ESTOQUE_CRITICO', 'VENCIMENTO_PROXIMO', 'DIVERGENCIA'));

-- O download incremental (GET /sync/baixar?desde=) filtra por data de
-- alteração dentro da loja.
CREATE INDEX IF NOT EXISTS idx_categoria_loja_atualizado ON categoria(loja_id, atualizado_em);
CREATE INDEX IF NOT EXISTS idx_fornecedor_loja_atualizado ON fornecedor(loja_id, atualizado_em);
CREATE INDEX IF NOT EXISTS idx_produto_loja_atualizado ON produto(loja_id, atualizado_em);
CREATE INDEX IF NOT EXISTS idx_alerta_criado ON alerta(criado_em);

-- data_hora é o relógio do aparelho e pode ser bem anterior ao envio (venda
-- feita sem rede e sincronizada horas depois). O corte do download usa o
-- instante em que o servidor recebeu a movimentação, senão outro aparelho
-- que já sincronizou nesse intervalo nunca a veria.
ALTER TABLE movimentacao ADD COLUMN recebido_em TIMESTAMPTZ NOT NULL DEFAULT NOW();
CREATE INDEX IF NOT EXISTS idx_movimentacao_recebido ON movimentacao(recebido_em);
