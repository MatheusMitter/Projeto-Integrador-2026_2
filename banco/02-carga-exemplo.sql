-- StockEasy — carga de exemplo
--
-- Depende de 01-esquema.sql já executado:
--
--     psql -U postgres -d stockeasy_db -f banco/02-carga-exemplo.sql
--
-- Os produtos entram com saldo zero e o estoque é construído por
-- movimentações, que é como a aplicação opera. Inserir o saldo final
-- direto produziria histórico que não fecha com o saldo.
--
-- As contas criadas aqui são de exemplo, para demonstrar a RN01. A senha
-- das duas é "admin123", gravada como resumo BCrypt.

-- =============================================
-- DADOS DE EXEMPLO (SEED)
--
-- Corrigido na versão 2.0. A carga anterior inseria o produto já com o
-- saldo final e depois registrava movimentações "simulando" chegar
-- naquele valor, produzindo histórico incoerente. Agora o produto entra
-- com saldo zero e o saldo é construído pelas movimentações, que é como
-- a aplicação realmente opera.
-- =============================================

-- Loja
INSERT INTO loja (nome, documento) VALUES
('Mercearia Modelo', '12.345.678/0001-90');

-- Usuários: um de cada perfil, para demonstrar RN01.
-- Senha de ambos: "admin123" (resumo BCrypt com fator de custo 10)
INSERT INTO usuario (loja_id, nome, email, senha_hash, tipo_perfil) VALUES
(1, 'Proprietário', 'proprietario@stockeasy.com',
 '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'PROPRIETARIO'),
(1, 'Júnior Operador', 'operador@stockeasy.com',
 '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'OPERADOR');

-- Categorias
INSERT INTO categoria (loja_id, nome) VALUES
(1, 'Alimentos'), (1, 'Bebidas'), (1, 'Limpeza'), (1, 'Higiene'), (1, 'Outros');

-- Fornecedores
INSERT INTO fornecedor (loja_id, nome, telefone, email) VALUES
(1, 'Distribuidora ABC Ltda', '(62) 3333-4444', 'contato@abc.com.br'),
(1, 'Comercial XYZ', '(62) 3555-6666', 'vendas@xyz.com.br'),
(1, 'Atacadão Central', '(62) 3777-8888', 'compras@atacadaocentral.com.br');

-- Produtos entram com estoque zero: o saldo é construído pelo histórico.
-- A validade é relativa ao dia da carga: o Sabonete sempre vence em 12
-- dias e entra no alerta de vencimento; o Refrigerante fica fora dele.
INSERT INTO produto
    (loja_id, nome, codigo_barras, categoria_id, fornecedor_id,
     preco_custo, preco_venda, estoque_atual, estoque_minimo, data_validade) VALUES
(1, 'Arroz Tipo 1 5kg',          '7891234567890', 1, 1, 15.00, 22.00, 0, 10, NULL),
(1, 'Feijão Preto 1kg',          '7891234567891', 1, 1,  6.50, 10.00, 0, 15, NULL),
(1, 'Refrigerante Cola 2L',      '7891234567892', 2, 2,  4.00,  7.50, 0, 20, CURRENT_DATE + 63),
(1, 'Detergente Líquido 500ml',  '7891234567893', 3, 2,  1.80,  3.50, 0, 10, NULL),
(1, 'Sabonete 90g',              '7891234567894', 4, 1,  1.20,  2.50, 0, 15, CURRENT_DATE + 12);

-- ---------------------------------------------
-- Procedimento de carga: registra a movimentação e atualiza o saldo na
-- mesma transação, exatamente como a camada de negócio fará (RN05, RN06).
-- Evita a incoerência de escrever saldo_apos "na mão".
-- ---------------------------------------------
CREATE OR REPLACE FUNCTION registrar_movimentacao(
    p_produto_id INTEGER,
    p_usuario_id INTEGER,
    p_tipo       VARCHAR(30),
    p_quantidade INTEGER,
    p_data_hora  TIMESTAMPTZ,
    p_observacoes TEXT DEFAULT NULL
) RETURNS INTEGER AS $$
DECLARE
    v_saldo_atual INTEGER;
    v_saldo_novo  INTEGER;
    v_eh_entrada  BOOLEAN;
BEGIN
    v_eh_entrada := p_tipo IN ('COMPRA', 'DEVOLUCAO_CLIENTE', 'AJUSTE_ENTRADA');

    -- Bloqueia a linha do produto: impede que duas movimentações
    -- simultâneas leiam o mesmo saldo e produzam resultado incorreto
    SELECT estoque_atual INTO v_saldo_atual
      FROM produto WHERE id = p_produto_id FOR UPDATE;

    IF v_saldo_atual IS NULL THEN
        RAISE EXCEPTION 'Produto % não encontrado', p_produto_id;
    END IF;

    v_saldo_novo := CASE WHEN v_eh_entrada
                         THEN v_saldo_atual + p_quantidade
                         ELSE v_saldo_atual - p_quantidade END;

    -- RN06: a saída não pode exceder o estoque disponível
    IF v_saldo_novo < 0 THEN
        RAISE EXCEPTION
            'RN06: saída de % excede o estoque disponível de % (produto %)',
            p_quantidade, v_saldo_atual, p_produto_id;
    END IF;

    UPDATE produto
       SET estoque_atual = v_saldo_novo,
           atualizado_em = NOW()
     WHERE id = p_produto_id;

    INSERT INTO movimentacao
        (uuid, produto_id, usuario_id, tipo, quantidade, saldo_apos, data_hora, observacoes)
    VALUES
        (gen_random_uuid(), p_produto_id, p_usuario_id, p_tipo,
         p_quantidade, v_saldo_novo, p_data_hora, p_observacoes);

    RETURN v_saldo_novo;
END;
$$ LANGUAGE plpgsql;

-- As datas são relativas ao dia da carga, com o mesmo espaçamento entre
-- os lançamentos: as consultas de período (último mês, baixo giro)
-- devolvem resultado em qualquer data em que o script rodar.

-- Entradas iniciais
SELECT registrar_movimentacao(1, 1, 'COMPRA', 50, CURRENT_DATE - 27 + TIME '08:00', 'Estoque inicial');
SELECT registrar_movimentacao(2, 1, 'COMPRA', 30, CURRENT_DATE - 27 + TIME '08:05', 'Estoque inicial');
SELECT registrar_movimentacao(3, 1, 'COMPRA', 25, CURRENT_DATE - 27 + TIME '08:10', 'Estoque inicial');
SELECT registrar_movimentacao(4, 1, 'COMPRA', 40, CURRENT_DATE - 27 + TIME '08:15', 'Estoque inicial');
SELECT registrar_movimentacao(5, 1, 'COMPRA', 20, CURRENT_DATE - 27 + TIME '08:20', 'Estoque inicial');

-- Vendas ao longo do mês, algumas registradas pelo operador
SELECT registrar_movimentacao(1, 2, 'VENDA',  8, CURRENT_DATE - 16 + TIME '16:20');
SELECT registrar_movimentacao(2, 2, 'VENDA',  5, CURRENT_DATE - 14 + TIME '10:10');
SELECT registrar_movimentacao(1, 1, 'COMPRA', 30, CURRENT_DATE - 13 + TIME '09:15', 'Reposição');
SELECT registrar_movimentacao(1, 2, 'VENDA',  5, CURRENT_DATE - 10 + TIME '14:32');

-- Refrigerante cai a 5 unidades, abaixo do mínimo de 20: o gatilho
-- gera alerta de estoque crítico (RN07)
SELECT registrar_movimentacao(3, 2, 'VENDA', 20, CURRENT_DATE - 8 + TIME '11:45');

-- Perda por dano deixa o sabonete em 8, abaixo do mínimo de 15
SELECT registrar_movimentacao(5, 1, 'PERDA', 12, CURRENT_DATE - 6 + TIME '09:30',
                              'Produtos danificados durante o transporte');

-- ---------------------------------------------
-- Conferência da carga: saldo do produto e último saldo do histórico
-- precisam coincidir. Se divergirem, a carga está incoerente.
-- ---------------------------------------------
SELECT p.id, p.nome, p.estoque_atual, p.estoque_minimo,
       (SELECT m.saldo_apos FROM movimentacao m
         WHERE m.produto_id = p.id
         ORDER BY m.data_hora DESC, m.id DESC LIMIT 1) AS saldo_historico,
       CASE WHEN p.estoque_atual <= p.estoque_minimo THEN 'CRITICO' ELSE 'OK' END AS situacao
  FROM produto p
 ORDER BY p.id;

-- Resultado esperado: Arroz 67, Feijão 25, Refrigerante 5 (crítico),
-- Detergente 40, Sabonete 8 (crítico). Dois alertas pendentes.
