# Modelagem de Dados — StockEasy

**Projeto:** StockEasy — Controle de Estoque Inteligente  
**Checkpoint 1:** 11/09/2026  
**SGBD:** PostgreSQL (remoto) + SQLite (local)

---

## Diagrama Entidade-Relacionamento (DER)

### Representação Textual

```
┌─────────────────┐
│     USUARIO     │
├─────────────────┤
│ PK id           │
│    nome         │
│    email        │◁───────────────┐
│    senha_hash   │                │
│    tipo_perfil  │                │ 1
│    ativo        │                │
│    criado_em    │                │
└─────────────────┘                │
                                   │
                                   │
┌─────────────────┐                │
│   FORNECEDOR    │                │
├─────────────────┤                │
│ PK id           │◁───────┐       │
│    nome         │        │ 1     │
│    telefone     │        │       │
│    email        │        │       │
│    endereco     │        │       │
│    observacoes  │        │       │
│    criado_em    │        │       │
└─────────────────┘        │       │
                           │       │
                           │       │
┌─────────────────┐        │       │
│    PRODUTO      │        │       │
├─────────────────┤        │       │
│ PK id           │        │       │
│    nome         │        │       │
│    codigo_barras│        │       │
│    categoria    │        │       │
│ FK fornecedor_id├────────┘ N     │
│    preco_custo  │                │
│    preco_venda  │                │
│    estoque_atual│                │
│    estoque_min  │                │
│    data_validade│                │
│    foto_url     │                │
│    ativo        │                │
│    criado_em    │                │
│    atualizado_em│                │
└─────────────────┘                │
         △                         │
         │ N                       │
         │                         │
         │                         │
┌─────────────────┐                │
│  MOVIMENTACAO   │                │
├─────────────────┤                │
│ PK id           │                │
│ FK produto_id   ├────────────────┘
│ FK usuario_id   ├────────────────┐
│    tipo         │                │ N
│    quantidade   │                │
│    saldo_apos   │                │
│    data_hora    │                │
│    observacoes  │                │
└─────────────────┘                │
                                   │
                                   │
┌─────────────────┐                │
│     ALERTA      │                │
├─────────────────┤                │
│ PK id           │                │
│ FK produto_id   ├────────────────┘
│    tipo_alerta  │
│    mensagem     │
│    lido         │
│    criado_em    │
└─────────────────┘
```

---

## Entidades e Atributos Detalhados

### 1. USUARIO

**Descrição:** Armazena informações dos usuários do sistema (proprietários e operadores).

| Atributo | Tipo | Restrições | Descrição |
|----------|------|------------|-----------|
| **id** | SERIAL | PRIMARY KEY | Identificador único |
| nome | VARCHAR(100) | NOT NULL | Nome completo do usuário |
| email | VARCHAR(100) | NOT NULL, UNIQUE | E-mail de login (único) |
| senha_hash | VARCHAR(255) | NOT NULL | Hash da senha (bcrypt) |
| tipo_perfil | VARCHAR(20) | NOT NULL, CHECK | 'PROPRIETARIO' ou 'OPERADOR' |
| ativo | BOOLEAN | NOT NULL, DEFAULT TRUE | Se o usuário está ativo |
| criado_em | TIMESTAMP | NOT NULL, DEFAULT NOW() | Data/hora de criação |

**Regras:**
- E-mail deve ser único no sistema (índice único)
- Senha armazenada como hash bcrypt (nunca texto plano)
- `tipo_perfil` usa ENUM ou CHECK constraint: ('PROPRIETARIO', 'OPERADOR')

---

### 2. FORNECEDOR

**Descrição:** Cadastro de fornecedores de produtos.

| Atributo | Tipo | Restrições | Descrição |
|----------|------|------------|-----------|
| **id** | SERIAL | PRIMARY KEY | Identificador único |
| nome | VARCHAR(100) | NOT NULL | Nome do fornecedor |
| telefone | VARCHAR(20) | | Telefone de contato |
| email | VARCHAR(100) | | E-mail de contato |
| endereco | TEXT | | Endereço completo |
| observacoes | TEXT | | Observações adicionais |
| criado_em | TIMESTAMP | NOT NULL, DEFAULT NOW() | Data/hora de criação |

**Regras:**
- Nome obrigatório
- Telefone e e-mail opcionais
- Não pode ser excluído se houver produtos vinculados (restrição de FK)

---

### 3. PRODUTO

**Descrição:** Cadastro de produtos comercializados.

| Atributo | Tipo | Restrições | Descrição |
|----------|------|------------|-----------|
| **id** | SERIAL | PRIMARY KEY | Identificador único |
| nome | VARCHAR(150) | NOT NULL | Nome do produto |
| codigo_barras | VARCHAR(50) | UNIQUE | Código de barras (EAN-13, UPC, etc.) |
| categoria | VARCHAR(50) | NOT NULL | Categoria do produto |
| **fornecedor_id** | INTEGER | FOREIGN KEY → FORNECEDOR(id) | Fornecedor do produto |
| preco_custo | DECIMAL(10,2) | NOT NULL, CHECK >= 0 | Preço de custo unitário |
| preco_venda | DECIMAL(10,2) | NOT NULL, CHECK >= 0 | Preço de venda unitário |
| estoque_atual | INTEGER | NOT NULL, DEFAULT 0, CHECK >= 0 | Quantidade em estoque |
| estoque_min | INTEGER | NOT NULL, DEFAULT 0, CHECK >= 0 | Estoque mínimo (alerta) |
| data_validade | DATE | | Data de validade (opcional) |
| foto_url | VARCHAR(255) | | URL da foto do produto |
| ativo | BOOLEAN | NOT NULL, DEFAULT TRUE | Se o produto está ativo |
| criado_em | TIMESTAMP | NOT NULL, DEFAULT NOW() | Data/hora de criação |
| atualizado_em | TIMESTAMP | NOT NULL, DEFAULT NOW() | Data/hora da última atualização |

**Regras:**
- Nome obrigatório
- `codigo_barras` único (se informado) — índice único
- `categoria` usa valores pré-definidos: 'ALIMENTOS', 'BEBIDAS', 'LIMPEZA', 'HIGIENE', 'OUTROS'
- Preços devem ser >= 0
- `estoque_atual` não pode ser negativo
- `fornecedor_id` pode ser NULL (produto sem fornecedor definido)
- FK `fornecedor_id` com ON DELETE SET NULL (se fornecedor for excluído, produto mantém mas perde referência)

**Índices:**
- `codigo_barras` (único)
- `categoria` (para filtros)
- `fornecedor_id` (para joins)
- `estoque_atual` (para consultas de produtos críticos)

---

### 4. MOVIMENTACAO

**Descrição:** Histórico de todas as entradas e saídas de produtos.

| Atributo | Tipo | Restrições | Descrição |
|----------|------|------------|-----------|
| **id** | SERIAL | PRIMARY KEY | Identificador único |
| **produto_id** | INTEGER | NOT NULL, FOREIGN KEY → PRODUTO(id) | Produto movimentado |
| **usuario_id** | INTEGER | NOT NULL, FOREIGN KEY → USUARIO(id) | Usuário que registrou |
| tipo | VARCHAR(30) | NOT NULL, CHECK | Tipo de movimentação |
| quantidade | INTEGER | NOT NULL, CHECK > 0 | Quantidade movimentada |
| saldo_apos | INTEGER | NOT NULL, CHECK >= 0 | Saldo do estoque após a movimentação |
| data_hora | TIMESTAMP | NOT NULL, DEFAULT NOW() | Data/hora da movimentação |
| observacoes | TEXT | | Observações opcionais |

**Regras:**
- `tipo` usa ENUM ou CHECK constraint: ('COMPRA', 'DEVOLUCAO_CLIENTE', 'AJUSTE_ENTRADA', 'VENDA', 'PERDA', 'VENCIMENTO', 'DEVOLUCAO_FORNECEDOR', 'AJUSTE_SAIDA', 'OUTROS')
- `quantidade` sempre positivo (> 0)
- `saldo_apos` não pode ser negativo (>= 0)
- FK `produto_id` com ON DELETE CASCADE (se produto excluído, histórico também é excluído — ou ON DELETE RESTRICT para impedir exclusão)
- FK `usuario_id` com ON DELETE SET NULL (mantém histórico mesmo se usuário for desativado, mas perde referência)

**Índices:**
- `produto_id` (para histórico por produto)
- `usuario_id` (para auditoria por usuário)
- `tipo` (para filtros)
- `data_hora` (para ordenação cronológica)

**Observação importante:** A coluna `saldo_apos` é **desnormalizada intencionalmente** para facilitar consultas de auditoria. Sempre que uma movimentação é registrada, o `estoque_atual` do produto é atualizado e o novo saldo é gravado aqui.

---

### 5. ALERTA

**Descrição:** Alertas gerados automaticamente (estoque crítico, vencimento próximo).

| Atributo | Tipo | Restrições | Descrição |
|----------|------|------------|-----------|
| **id** | SERIAL | PRIMARY KEY | Identificador único |
| **produto_id** | INTEGER | NOT NULL, FOREIGN KEY → PRODUTO(id) | Produto relacionado ao alerta |
| tipo_alerta | VARCHAR(30) | NOT NULL, CHECK | Tipo do alerta |
| mensagem | TEXT | NOT NULL | Mensagem do alerta |
| lido | BOOLEAN | NOT NULL, DEFAULT FALSE | Se o alerta foi lido/visualizado |
| criado_em | TIMESTAMP | NOT NULL, DEFAULT NOW() | Data/hora de criação |

**Regras:**
- `tipo_alerta` usa ENUM: ('ESTOQUE_CRITICO', 'VENCIMENTO_PROXIMO')
- FK `produto_id` com ON DELETE CASCADE (se produto excluído, alerta também é excluído)
- Alertas são gerados automaticamente por triggers ou lógica de aplicação
- Alertas não lidos são exibidos no dashboard

**Índices:**
- `produto_id` (para buscar alertas por produto)
- `lido` (para filtrar alertas não lidos)
- `tipo_alerta` (para agrupar por tipo)

---

## Relacionamentos

### USUARIO ↔ MOVIMENTACAO
- **Cardinalidade:** 1:N (Um usuário registra muitas movimentações)
- **Chave estrangeira:** MOVIMENTACAO.usuario_id → USUARIO.id
- **Comportamento:** ON DELETE SET NULL (mantém histórico mesmo se usuário for desativado)

### FORNECEDOR ↔ PRODUTO
- **Cardinalidade:** 1:N (Um fornecedor fornece muitos produtos)
- **Chave estrangeira:** PRODUTO.fornecedor_id → FORNECEDOR.id
- **Comportamento:** ON DELETE SET NULL (produto mantém-se mas perde referência ao fornecedor)

### PRODUTO ↔ MOVIMENTACAO
- **Cardinalidade:** 1:N (Um produto tem muitas movimentações)
- **Chave estrangeira:** MOVIMENTACAO.produto_id → PRODUTO.id
- **Comportamento:** ON DELETE CASCADE (histórico é excluído junto) **ou** ON DELETE RESTRICT (impede exclusão de produto com histórico) — definir com a equipe

### PRODUTO ↔ ALERTA
- **Cardinalidade:** 1:N (Um produto pode ter muitos alertas)
- **Chave estrangeira:** ALERTA.produto_id → PRODUTO.id
- **Comportamento:** ON DELETE CASCADE (alertas são excluídos junto)

---

## Normalização

O modelo está na **Terceira Forma Normal (3FN)**:

### 1FN — Primeira Forma Normal
- ✅ Todos os atributos são atômicos (valores simples, não multivalorados)
- ✅ Cada coluna contém valores do mesmo tipo
- ✅ Cada linha é única (chaves primárias definidas)

### 2FN — Segunda Forma Normal
- ✅ Está na 1FN
- ✅ Todos os atributos não-chave dependem da chave primária completa (não há dependências parciais)
- Exemplo: Em MOVIMENTACAO, `quantidade`, `tipo`, `data_hora` dependem de `id` (chave primária)

### 3FN — Terceira Forma Normal
- ✅ Está na 2FN
- ✅ Não há dependências transitivas (atributos não-chave não dependem de outros atributos não-chave)
- Exemplo: Fornecedor está em tabela separada, não duplicado em cada produto

### Exceção: Desnormalização Intencional
- **Coluna `saldo_apos` em MOVIMENTACAO:** Guarda o saldo do estoque após cada movimentação para facilitar auditoria e evitar recalcular o histórico completo. Esse trade-off é aceitável em sistemas transacionais com requisitos de auditoria.

---

## Scripts SQL de Criação (PostgreSQL)

```sql
-- =============================================
-- CRIAÇÃO DO BANCO DE DADOS
-- =============================================

CREATE DATABASE stockeasy_db
    ENCODING 'UTF8'
    LC_COLLATE 'pt_BR.UTF-8'
    LC_CTYPE 'pt_BR.UTF-8'
    TEMPLATE template0;

\c stockeasy_db;

-- =============================================
-- TABELA: USUARIO
-- =============================================

CREATE TABLE usuario (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    senha_hash VARCHAR(255) NOT NULL,
    tipo_perfil VARCHAR(20) NOT NULL CHECK (tipo_perfil IN ('PROPRIETARIO', 'OPERADOR')),
    ativo BOOLEAN NOT NULL DEFAULT TRUE,
    criado_em TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Índice para login rápido
CREATE INDEX idx_usuario_email ON usuario(email);

-- =============================================
-- TABELA: FORNECEDOR
-- =============================================

CREATE TABLE fornecedor (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    telefone VARCHAR(20),
    email VARCHAR(100),
    endereco TEXT,
    observacoes TEXT,
    criado_em TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Índice para busca por nome
CREATE INDEX idx_fornecedor_nome ON fornecedor(nome);

-- =============================================
-- TABELA: PRODUTO
-- =============================================

CREATE TABLE produto (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(150) NOT NULL,
    codigo_barras VARCHAR(50) UNIQUE,
    categoria VARCHAR(50) NOT NULL CHECK (categoria IN ('ALIMENTOS', 'BEBIDAS', 'LIMPEZA', 'HIGIENE', 'OUTROS')),
    fornecedor_id INTEGER REFERENCES fornecedor(id) ON DELETE SET NULL,
    preco_custo DECIMAL(10,2) NOT NULL CHECK (preco_custo >= 0),
    preco_venda DECIMAL(10,2) NOT NULL CHECK (preco_venda >= 0),
    estoque_atual INTEGER NOT NULL DEFAULT 0 CHECK (estoque_atual >= 0),
    estoque_min INTEGER NOT NULL DEFAULT 0 CHECK (estoque_min >= 0),
    data_validade DATE,
    foto_url VARCHAR(255),
    ativo BOOLEAN NOT NULL DEFAULT TRUE,
    criado_em TIMESTAMP NOT NULL DEFAULT NOW(),
    atualizado_em TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Índices para otimização de consultas
CREATE INDEX idx_produto_codigo_barras ON produto(codigo_barras);
CREATE INDEX idx_produto_categoria ON produto(categoria);
CREATE INDEX idx_produto_fornecedor ON produto(fornecedor_id);
CREATE INDEX idx_produto_estoque_atual ON produto(estoque_atual);

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
    produto_id INTEGER NOT NULL REFERENCES produto(id) ON DELETE CASCADE,
    usuario_id INTEGER REFERENCES usuario(id) ON DELETE SET NULL,
    tipo VARCHAR(30) NOT NULL CHECK (tipo IN (
        'COMPRA', 'DEVOLUCAO_CLIENTE', 'AJUSTE_ENTRADA',
        'VENDA', 'PERDA', 'VENCIMENTO', 'DEVOLUCAO_FORNECEDOR', 'AJUSTE_SAIDA', 'OUTROS'
    )),
    quantidade INTEGER NOT NULL CHECK (quantidade > 0),
    saldo_apos INTEGER NOT NULL CHECK (saldo_apos >= 0),
    data_hora TIMESTAMP NOT NULL DEFAULT NOW(),
    observacoes TEXT
);

-- Índices para consultas de histórico
CREATE INDEX idx_movimentacao_produto ON movimentacao(produto_id);
CREATE INDEX idx_movimentacao_usuario ON movimentacao(usuario_id);
CREATE INDEX idx_movimentacao_tipo ON movimentacao(tipo);
CREATE INDEX idx_movimentacao_data_hora ON movimentacao(data_hora DESC);

-- =============================================
-- TABELA: ALERTA
-- =============================================

CREATE TABLE alerta (
    id SERIAL PRIMARY KEY,
    produto_id INTEGER NOT NULL REFERENCES produto(id) ON DELETE CASCADE,
    tipo_alerta VARCHAR(30) NOT NULL CHECK (tipo_alerta IN ('ESTOQUE_CRITICO', 'VENCIMENTO_PROXIMO')),
    mensagem TEXT NOT NULL,
    lido BOOLEAN NOT NULL DEFAULT FALSE,
    criado_em TIMESTAMP NOT NULL DEFAULT NOW()
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
    -- Se estoque ficar <= estoque_min, gerar alerta
    IF NEW.estoque_atual <= NEW.estoque_min THEN
        -- Verificar se já existe alerta ativo para este produto
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

CREATE TRIGGER trigger_estoque_critico
AFTER UPDATE OF estoque_atual ON produto
FOR EACH ROW
EXECUTE FUNCTION verificar_estoque_critico();

-- =============================================
-- DADOS DE EXEMPLO (SEED)
-- =============================================

-- Usuário proprietário padrão (senha: "admin123" em bcrypt)
INSERT INTO usuario (nome, email, senha_hash, tipo_perfil) VALUES
('Administrador', 'admin@stockeasy.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'PROPRIETARIO');

-- Fornecedores de exemplo
INSERT INTO fornecedor (nome, telefone, email) VALUES
('Distribuidora ABC Ltda', '(62) 3333-4444', 'contato@abc.com.br'),
('Comercial XYZ', '(62) 3555-6666', 'vendas@xyz.com.br');

-- Produtos de exemplo
INSERT INTO produto (nome, codigo_barras, categoria, fornecedor_id, preco_custo, preco_venda, estoque_atual, estoque_min) VALUES
('Arroz Tipo 1 5kg', '7891234567890', 'ALIMENTOS', 1, 15.00, 22.00, 50, 10),
('Feijão Preto 1kg', '7891234567891', 'ALIMENTOS', 1, 6.50, 10.00, 30, 15),
('Refrigerante Cola 2L', '7891234567892', 'BEBIDAS', 2, 4.00, 7.50, 5, 20),
('Detergente Líquido 500ml', '7891234567893', 'LIMPEZA', 2, 1.80, 3.50, 40, 10),
('Sabonete 90g', '7891234567894', 'HIGIENE', 1, 1.20, 2.50, 8, 15);

-- Movimentação inicial (entrada de estoque)
INSERT INTO movimentacao (produto_id, usuario_id, tipo, quantidade, saldo_apos, observacoes) VALUES
(1, 1, 'COMPRA', 50, 50, 'Estoque inicial'),
(2, 1, 'COMPRA', 30, 30, 'Estoque inicial'),
(3, 1, 'COMPRA', 25, 25, 'Estoque inicial'),
(4, 1, 'COMPRA', 40, 40, 'Estoque inicial'),
(5, 1, 'COMPRA', 20, 20, 'Estoque inicial');

-- Simulação de vendas
INSERT INTO movimentacao (produto_id, usuario_id, tipo, quantidade, saldo_apos) VALUES
(3, 1, 'VENDA', 20, 5);

-- Atualizar estoque do produto após venda (em produção, seria feito por trigger ou lógica de aplicação)
UPDATE produto SET estoque_atual = 5 WHERE id = 3;

-- Simulação de perda
INSERT INTO movimentacao (produto_id, usuario_id, tipo, quantidade, saldo_apos, observacoes) VALUES
(5, 1, 'PERDA', 12, 8, 'Produtos danificados durante transporte');

UPDATE produto SET estoque_atual = 8 WHERE id = 5;

-- Os triggers irão gerar alertas automaticamente para produtos 3 e 5 (críticos)
```

---

## Estratégia de Persistência Local (SQLite)

Para o requisito de funcionamento offline (R5), o aplicativo móvel terá uma **réplica do banco em SQLite** com a mesma estrutura, com as seguintes adaptações:

### Diferenças entre PostgreSQL (remoto) e SQLite (local):

| Característica | PostgreSQL | SQLite |
|----------------|-----------|--------|
| Tipo de dados | SERIAL, DECIMAL(10,2), TIMESTAMP | INTEGER, REAL, TEXT (ISO 8601) |
| Chaves estrangeiras | Ativas por padrão | Precisam ser habilitadas com `PRAGMA foreign_keys = ON;` |
| Triggers | Suportado | Suportado |
| CHECK constraints | Suportado | Suportado (com limitações) |

### Sincronização (US25):

**Estratégia de sincronização:**
1. **Ao abrir o app (online):** Baixar dados novos do servidor (última sincronização)
2. **Ao registrar operação (online):** Enviar imediatamente ao servidor + salvar localmente
3. **Ao registrar operação (offline):** Salvar localmente com flag `pendente_sincronizacao = TRUE`
4. **Ao voltar online:** Enviar todas as operações pendentes em ordem cronológica
5. **Conflitos:** Last-write-wins (timestamp mais recente prevalece)

**Campos adicionais para sincronização:**
```sql
-- Adicionar em cada tabela (SQLite):
sincronizado BOOLEAN DEFAULT FALSE,
sincronizado_em TIMESTAMP,
versao_servidor INTEGER -- para detectar conflitos
```

---

## Consultas SQL Importantes

### 1. Produtos Críticos (Abaixo do Estoque Mínimo)
```sql
SELECT p.id, p.nome, p.estoque_atual, p.estoque_min, 
       f.nome AS fornecedor, f.telefone
FROM produto p
LEFT JOIN fornecedor f ON p.fornecedor_id = f.id
WHERE p.estoque_atual <= p.estoque_min
  AND p.ativo = TRUE
ORDER BY (p.estoque_atual - p.estoque_min) ASC; -- Mais crítico primeiro
```

### 2. Produtos Próximos ao Vencimento
```sql
SELECT p.id, p.nome, p.data_validade, 
       (p.data_validade - CURRENT_DATE) AS dias_restantes
FROM produto p
WHERE p.data_validade IS NOT NULL
  AND p.data_validade <= CURRENT_DATE + INTERVAL '15 days'
  AND p.ativo = TRUE
ORDER BY p.data_validade ASC;
```

### 3. Produtos Mais Vendidos (Último Mês)
```sql
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
```

### 4. Valor Total do Estoque
```sql
SELECT SUM(estoque_atual * preco_custo) AS valor_total_estoque
FROM produto
WHERE ativo = TRUE;
```

### 5. Histórico Completo de um Produto
```sql
SELECT m.id, m.tipo, m.quantidade, m.saldo_apos, m.data_hora,
       u.nome AS usuario, m.observacoes
FROM movimentacao m
LEFT JOIN usuario u ON m.usuario_id = u.id
WHERE m.produto_id = ? -- Parâmetro
ORDER BY m.data_hora DESC;
```

### 6. Produtos de Baixo Giro (Sem Venda nos Últimos 30 Dias)
```sql
SELECT p.id, p.nome, p.estoque_atual,
       MAX(m.data_hora) AS ultima_venda,
       (CURRENT_DATE - MAX(m.data_hora)::DATE) AS dias_parado
FROM produto p
LEFT JOIN movimentacao m ON p.produto_id = m.id AND m.tipo = 'VENDA'
WHERE p.ativo = TRUE
GROUP BY p.id, p.nome, p.estoque_atual
HAVING MAX(m.data_hora) < CURRENT_DATE - INTERVAL '30 days'
   OR MAX(m.data_hora) IS NULL
ORDER BY dias_parado DESC NULLS FIRST;
```

---

## Regras de Negócio Implementadas no Banco

### RN01: Controle de Perfis de Acesso
- Implementado via constraint CHECK em `usuario.tipo_perfil`
- Validação adicional na camada de aplicação (middleware de autorização)

### RN02: E-mail Único
- Constraint UNIQUE em `usuario.email`

### RN03: Preço de Venda ≥ Preço de Custo
- Validação na aplicação (permite salvar com alerta, mas não bloqueia)
- Não há constraint CHECK no banco para permitir flexibilidade (ex: promoções)

### RN04: Código de Barras Único
- Constraint UNIQUE em `produto.codigo_barras`

### RN05: Registro Completo de Movimentações
- Estrutura da tabela `movimentacao` garante rastreabilidade
- Campos obrigatórios: produto, usuário, tipo, quantidade, saldo, data/hora

### RN06: Saída ≤ Estoque Disponível
- Validação na aplicação antes de registrar movimentação
- Constraint CHECK em `produto.estoque_atual >= 0` impede estoque negativo

### RN07: Alerta de Estoque Crítico
- Trigger `verificar_estoque_critico` gera alerta automaticamente

### RN08: Cálculo de Valor Total do Estoque
- Consulta SQL soma `estoque_atual * preco_custo`

### RN09: Sincronização Automática
- Implementada na camada de aplicação

---

## Observações Finais

### Justificativa da Modelagem:

1. **Separação clara de responsabilidades:** Cada entidade tem função bem definida
2. **Normalização adequada:** Evita redundância, facilita manutenção
3. **Índices estratégicos:** Otimizam consultas mais frequentes (filtros, histórico)
4. **Triggers úteis:** Automatizam alertas sem sobrecarregar a aplicação
5. **Flexibilidade:** ON DELETE comporta cenários reais (fornecedor excluído, usuário desativado)
6. **Auditoria:** Histórico completo de movimentações com timestamp e usuário responsável

### Próximos Passos:

1. Implementar DAOs em Java com JDBC (responsabilidade: Matheus)
2. Criar migrations com Flyway ou Liquibase
3. Implementar camada de persistência local (SQLite) no app React Native (responsabilidade: Felipe)
4. Desenvolver lógica de sincronização bidirecional
5. Testes de carga e otimização de consultas

---

## Checklist de Validação do DER

- [x] Todas as entidades têm chave primária
- [x] Relacionamentos têm chaves estrangeiras corretas
- [x] Cardinalidades estão corretas (1:N)
- [x] Normalização até 3FN (com exceção intencional)
- [x] Constraints de integridade definidas (CHECK, UNIQUE, NOT NULL)
- [x] Índices criados para otimizar consultas frequentes
- [x] Triggers implementam regras de negócio críticas
- [x] Scripts SQL testáveis (podem ser executados direto no PostgreSQL)
- [x] Estratégia de sincronização definida para persistência local
- [x] Consultas SQL importantes documentadas
- [x] Regras de negócio mapeadas para implementação no banco

Este DER será refinado durante o desenvolvimento conforme necessidades específicas surgirem, mas está completo para o Checkpoint 1 e atende aos requisitos R3, R4, R5 e R6.
