-- StockEasy — consultas de referência
--
-- As consultas que sustentam os indicadores do painel e os relatórios.
-- Cada bloco é independente: servem para rodar isolado durante o
-- desenvolvimento da retaguarda, e como especificação do que a API deve
-- devolver.
--
--     psql -U postgres -d stockeasy_db -f banco/03-consultas.sql
--
-- Extraídas de docs/02-modelagem-de-dados.md, seção "Consultas SQL
-- Importantes". Ao alterar uma, alterar a outra.

-- ---------------------------------------------------------------
-- 1. Produtos Críticos (Abaixo do Estoque Mínimo)
-- ---------------------------------------------------------------

SELECT p.id, p.nome, p.estoque_atual, p.estoque_min,
       f.nome AS fornecedor, f.telefone
FROM produto p
LEFT JOIN fornecedor f ON p.fornecedor_id = f.id
WHERE p.estoque_atual <= p.estoque_min
  AND p.ativo = TRUE
ORDER BY (p.estoque_atual - p.estoque_min) ASC; -- Mais crítico primeiro

-- ---------------------------------------------------------------
-- 2. Produtos Próximos ao Vencimento
-- ---------------------------------------------------------------

SELECT p.id, p.nome, p.data_validade,
       (p.data_validade - CURRENT_DATE) AS dias_restantes
FROM produto p
WHERE p.data_validade IS NOT NULL
  AND p.data_validade <= CURRENT_DATE + INTERVAL '15 days'
  AND p.ativo = TRUE
ORDER BY p.data_validade ASC;

-- ---------------------------------------------------------------
-- 3. Produtos Mais Vendidos (Último Mês)
-- ---------------------------------------------------------------

SELECT p.id, p.nome,
       SUM(m.quantidade) AS total_vendido,
       SUM(m.quantidade * p.preco_venda) AS valor_total_gerado
FROM movimentacao m
JOIN produto p ON m.produto_id = p.id
WHERE m.tipo = 'VENDA'
  AND m.data_hora >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY p.id, p.nome
ORDER BY total_vendido DESC
LIMIT 10;

-- ---------------------------------------------------------------
-- 4. Valor Total do Estoque
-- ---------------------------------------------------------------

SELECT SUM(estoque_atual * preco_custo) AS valor_total_estoque
FROM produto
WHERE ativo = TRUE;

-- ---------------------------------------------------------------
-- 5. Histórico Completo de um Produto
-- ---------------------------------------------------------------
--
-- No docs/02 esta consulta aparece com "?" no lugar do parâmetro, que é o
-- marcador do JDBC e é o que o DAO vai usar. O psql não aceita "?", então
-- aqui o parâmetro entra como variável, para o arquivo rodar sem edição.

\set produto_id 1

SELECT m.id, m.tipo, m.quantidade, m.saldo_apos, m.data_hora,
       u.nome AS usuario, m.observacoes
FROM movimentacao m
LEFT JOIN usuario u ON m.usuario_id = u.id
WHERE m.produto_id = :produto_id
ORDER BY m.data_hora DESC;

-- ---------------------------------------------------------------
-- 6. Produtos de Baixo Giro (Sem Venda nos Últimos 30 Dias)
-- ---------------------------------------------------------------

\set loja_id 1

SELECT p.id, p.nome, p.estoque_atual,
       MAX(m.data_hora) AS ultima_venda,
       -- Produto nunca vendido retorna NULL em dias_parado, não zero
       (CURRENT_DATE - MAX(m.data_hora)::DATE) AS dias_parado
FROM produto p
LEFT JOIN movimentacao m
       ON m.produto_id = p.id
      AND m.tipo = 'VENDA'
WHERE p.ativo = TRUE
  AND p.loja_id = :loja_id   -- escopo da loja; "?" no DAO
GROUP BY p.id, p.nome, p.estoque_atual
HAVING (
        MAX(m.data_hora) < CURRENT_DATE - INTERVAL '30 days'
        OR MAX(m.data_hora) IS NULL
       )
ORDER BY dias_parado DESC NULLS FIRST;
