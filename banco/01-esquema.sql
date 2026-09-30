-- StockEasy — esquema do banco remoto (PostgreSQL 14 ou superior)
--
-- Cria o banco, as sete tabelas, os índices, as funções e os gatilhos.
-- Executar antes de 02-carga-exemplo.sql:
--
--     psql -U postgres -f banco/01-esquema.sql
--
-- Este arquivo é a fonte executável do modelo descrito em
-- docs/02-modelagem-de-dados.md. Ao alterar um, alterar o outro.
--
-- Atenção: o banco local do aplicativo é outro, definido em
-- app/src/database/esquema.ts, com as diferenças documentadas na seção de
-- persistência local do docs/02.

-- =============================================
-- CRIAÇÃO DO BANCO DE DADOS
--
-- Sem LC_COLLATE explícito: fixar 'pt_BR.UTF-8' faz o script falhar em
-- ambientes que não têm esse idioma instalado (contêineres Alpine, macOS).
-- A ordenação sensível a acento é resolvida por collation na consulta.
-- =============================================

CREATE DATABASE stockeasy_db ENCODING 'UTF8';

\c stockeasy_db;

-- =============================================
-- TABELA: LOJA
-- Escopo de todos os dados. Um usuário, um produto e um fornecedor
-- sempre pertencem a uma loja (exigência da história US04).
-- =============================================

CREATE TABLE loja (
    id SERIAL PRIMARY KEY,
    uuid UUID NOT NULL UNIQUE DEFAULT gen_random_uuid(),
    nome VARCHAR(120) NOT NULL,
    documento VARCHAR(20),
    ativo BOOLEAN NOT NULL DEFAULT TRUE,
    criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    atualizado_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================
-- TABELA: USUARIO
-- =============================================

CREATE TABLE usuario (
    id SERIAL PRIMARY KEY,
    uuid UUID NOT NULL UNIQUE DEFAULT gen_random_uuid(),
    loja_id INTEGER NOT NULL REFERENCES loja(id) ON DELETE RESTRICT,
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    senha_hash VARCHAR(255) NOT NULL,
    tipo_perfil VARCHAR(20) NOT NULL CHECK (tipo_perfil IN ('PROPRIETARIO', 'OPERADOR')),
    ativo BOOLEAN NOT NULL DEFAULT TRUE,
    criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    atualizado_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Não se cria índice sobre email: a restrição UNIQUE já gera um índice
-- implícito, e um segundo seria redundante e custoso na escrita.
CREATE INDEX idx_usuario_loja ON usuario(loja_id);

-- =============================================
-- TABELA: CATEGORIA
-- Substitui a lista fixa que havia em produto.categoria. O usuário pode
-- criar categorias próprias, o que a restrição CHECK anterior impedia.
-- =============================================

CREATE TABLE categoria (
    id SERIAL PRIMARY KEY,
    uuid UUID NOT NULL UNIQUE DEFAULT gen_random_uuid(),
    loja_id INTEGER NOT NULL REFERENCES loja(id) ON DELETE RESTRICT,
    nome VARCHAR(60) NOT NULL,
    ativo BOOLEAN NOT NULL DEFAULT TRUE,
    criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    -- O nome é único dentro da loja, não globalmente
    CONSTRAINT uq_categoria_loja_nome UNIQUE (loja_id, nome)
);

-- =============================================
-- TABELA: FORNECEDOR
-- =============================================

CREATE TABLE fornecedor (
    id SERIAL PRIMARY KEY,
    uuid UUID NOT NULL UNIQUE DEFAULT gen_random_uuid(),
    loja_id INTEGER NOT NULL REFERENCES loja(id) ON DELETE RESTRICT,
    nome VARCHAR(100) NOT NULL,
    telefone VARCHAR(20),
    email VARCHAR(100),
    endereco TEXT,
    observacoes TEXT,
    ativo BOOLEAN NOT NULL DEFAULT TRUE,
    criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    atualizado_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_fornecedor_loja_nome ON fornecedor(loja_id, nome);

-- =============================================
-- TABELA: PRODUTO
-- =============================================

CREATE TABLE produto (
    id SERIAL PRIMARY KEY,
    uuid UUID NOT NULL UNIQUE DEFAULT gen_random_uuid(),
    loja_id INTEGER NOT NULL REFERENCES loja(id) ON DELETE RESTRICT,
    nome VARCHAR(150) NOT NULL,
    codigo_barras VARCHAR(50),
    categoria_id INTEGER NOT NULL REFERENCES categoria(id) ON DELETE RESTRICT,
    fornecedor_id INTEGER REFERENCES fornecedor(id) ON DELETE RESTRICT,
    preco_custo DECIMAL(10,2) NOT NULL CHECK (preco_custo >= 0),
    preco_venda DECIMAL(10,2) NOT NULL CHECK (preco_venda >= 0),
    estoque_atual INTEGER NOT NULL DEFAULT 0 CHECK (estoque_atual >= 0),
    estoque_min INTEGER NOT NULL DEFAULT 0 CHECK (estoque_min >= 0),
    data_validade DATE,
    foto_url VARCHAR(255),
    ativo BOOLEAN NOT NULL DEFAULT TRUE,
    criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    atualizado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    -- RN04: o código de barras é único dentro da loja, não globalmente.
    -- Lojas distintas vendem o mesmo produto e usam o mesmo código EAN.
    CONSTRAINT uq_produto_loja_codigo UNIQUE (loja_id, codigo_barras)
);

-- Índices de apoio às consultas frequentes. Não se indexa codigo_barras
-- isoladamente: a restrição UNIQUE composta acima já atende à busca.
CREATE INDEX idx_produto_loja ON produto(loja_id);
CREATE INDEX idx_produto_categoria ON produto(categoria_id);
CREATE INDEX idx_produto_fornecedor ON produto(fornecedor_id);

-- Índice parcial para a consulta de produtos críticos: cobre apenas as
-- linhas ativas, que são as únicas consultadas nesse cenário.
CREATE INDEX idx_produto_critico ON produto(loja_id, estoque_atual)
    WHERE ativo = TRUE;

-- Trigger para atualizar atualizado_em automaticamente
CREATE OR REPLACE FUNCTION atualizar_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.atualizado_em = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_produto_atualizado
BEFORE UPDATE ON produto
FOR EACH ROW
EXECUTE FUNCTION atualizar_timestamp();

-- =============================================
-- TABELA: MOVIMENTACAO
-- =============================================

CREATE TABLE movimentacao (
    id SERIAL PRIMARY KEY,
    -- Identificador gerado no dispositivo, base da idempotência (DA07):
    -- permite reconhecer reenvio após falha de rede sem duplicar o registro.
    uuid UUID NOT NULL UNIQUE,
    -- RESTRICT, não CASCADE: apagar um produto levaria embora todo o
    -- histórico e invalidaria a auditoria exigida por RN05. Produtos são
    -- desativados (ativo = FALSE), nunca removidos — regra RN12.
    produto_id INTEGER NOT NULL REFERENCES produto(id) ON DELETE RESTRICT,
    -- NOT NULL com RESTRICT: RN05 exige saber quem registrou cada
    -- movimentação. Usuários são desativados, não excluídos.
    usuario_id INTEGER NOT NULL REFERENCES usuario(id) ON DELETE RESTRICT,
    tipo VARCHAR(30) NOT NULL CHECK (tipo IN (
        'COMPRA', 'DEVOLUCAO_CLIENTE', 'AJUSTE_ENTRADA',
        'VENDA', 'PERDA', 'VENCIMENTO', 'DEVOLUCAO_FORNECEDOR', 'AJUSTE_SAIDA', 'OUTROS'
    )),
    quantidade INTEGER NOT NULL CHECK (quantidade > 0),
    saldo_apos INTEGER NOT NULL CHECK (saldo_apos >= 0),
    data_hora TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    observacoes TEXT
);

-- Índice composto: cobre o histórico por produto em ordem cronológica,
-- que é a consulta da tela de detalhes do produto.
CREATE INDEX idx_movimentacao_produto_data ON movimentacao(produto_id, data_hora DESC);
CREATE INDEX idx_movimentacao_usuario ON movimentacao(usuario_id);
CREATE INDEX idx_movimentacao_tipo_data ON movimentacao(tipo, data_hora DESC);

-- =============================================
-- TABELA: ALERTA
-- =============================================

CREATE TABLE alerta (
    id SERIAL PRIMARY KEY,
    -- CASCADE é intencional aqui, e é a única exceção no modelo: o alerta
    -- não é registro de auditoria, e sim estado derivado do saldo. Pode ser
    -- recalculado a partir de estoque_atual e estoque_min, então perdê-lo
    -- não perde informação. Todas as demais chaves são RESTRICT (RN12).
    produto_id INTEGER NOT NULL REFERENCES produto(id) ON DELETE CASCADE,
    tipo_alerta VARCHAR(30) NOT NULL CHECK (tipo_alerta IN ('ESTOQUE_CRITICO', 'VENCIMENTO_PROXIMO')),
    mensagem TEXT NOT NULL,
    lido BOOLEAN NOT NULL DEFAULT FALSE,
    criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Índices para filtros de alertas
CREATE INDEX idx_alerta_produto ON alerta(produto_id);
CREATE INDEX idx_alerta_lido ON alerta(lido);
CREATE INDEX idx_alerta_tipo ON alerta(tipo_alerta);

-- =============================================
-- TRIGGER: Gerar Alerta de Estoque Crítico
-- =============================================

CREATE OR REPLACE FUNCTION verificar_estoque_critico()
RETURNS TRIGGER AS $$
BEGIN
    -- Produto inativo não mantém alerta pendente (RN12)
    IF NEW.ativo = FALSE THEN
        UPDATE alerta
        SET lido = TRUE
        WHERE produto_id = NEW.id
          AND tipo_alerta = 'ESTOQUE_CRITICO'
          AND lido = FALSE;
        RETURN NEW;
    END IF;

    -- Produto recém-cadastrado e ainda sem nenhuma entrada não gera
    -- alerta: saldo zero no cadastro significa "não abastecido", não
    -- "crítico". Sem esta condição, todo cadastro de produto criaria um
    -- alerta espúrio, já que 0 é sempre menor ou igual ao mínimo.
    IF TG_OP = 'INSERT' AND NEW.estoque_atual = 0 THEN
        RETURN NEW;
    END IF;

    -- Se estoque ficar <= estoque_min, gerar alerta
    IF NEW.estoque_atual <= NEW.estoque_min THEN
        -- Só cria se ainda não houver alerta pendente do mesmo tipo,
        -- para não acumular avisos repetidos do mesmo produto (RN07)
        IF NOT EXISTS (
            SELECT 1 FROM alerta
            WHERE produto_id = NEW.id
              AND tipo_alerta = 'ESTOQUE_CRITICO'
              AND lido = FALSE
        ) THEN
            INSERT INTO alerta (produto_id, tipo_alerta, mensagem, lido)
            VALUES (
                NEW.id,
                'ESTOQUE_CRITICO',
                'Produto "' || NEW.nome || '" está com estoque crítico (' || NEW.estoque_atual || ' unidades)',
                FALSE
            );
        END IF;
    ELSE
        -- Se estoque voltar ao normal, marcar alertas como lidos
        UPDATE alerta
        SET lido = TRUE
        WHERE produto_id = NEW.id
          AND tipo_alerta = 'ESTOQUE_CRITICO'
          AND lido = FALSE;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Dispara na INCLUSÃO e na ALTERAÇÃO. A versão 1.0 cobria apenas
-- AFTER UPDATE OF estoque_atual, então produto cadastrado já em situação
-- crítica não gerava alerta nenhum.
CREATE TRIGGER trigger_estoque_critico
AFTER INSERT OR UPDATE OF estoque_atual, estoque_min, ativo ON produto
FOR EACH ROW
EXECUTE FUNCTION verificar_estoque_critico();
