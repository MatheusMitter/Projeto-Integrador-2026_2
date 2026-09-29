// Esquema do SQLite. Mesmo modelo do PostgreSQL, adaptado aos tipos daqui:
// SERIAL vira INTEGER AUTOINCREMENT, DECIMAL vira REAL, TIMESTAMP vira TEXT,
// BOOLEAN vira 0 ou 1, e a chave estrangeira precisa ser habilitada por conexão.

export const ESQUEMA = `
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS loja (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  uuid          TEXT    NOT NULL UNIQUE,
  nome          TEXT    NOT NULL,
  documento     TEXT,
  ativo         INTEGER NOT NULL DEFAULT 1,
  criado_em     TEXT    NOT NULL DEFAULT (datetime('now')),
  sincronizado  INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS usuario (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  uuid          TEXT    NOT NULL UNIQUE,
  loja_id       INTEGER NOT NULL REFERENCES loja(id),
  nome          TEXT    NOT NULL,
  email         TEXT    NOT NULL UNIQUE,
  senha_hash    TEXT    NOT NULL,
  tipo_perfil   TEXT    NOT NULL CHECK (tipo_perfil IN ('PROPRIETARIO','OPERADOR')),
  ativo         INTEGER NOT NULL DEFAULT 1,
  criado_em     TEXT    NOT NULL DEFAULT (datetime('now')),
  sincronizado  INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS categoria (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  uuid          TEXT    NOT NULL UNIQUE,
  loja_id       INTEGER NOT NULL REFERENCES loja(id),
  nome          TEXT    NOT NULL,
  ativo         INTEGER NOT NULL DEFAULT 1,
  sincronizado  INTEGER NOT NULL DEFAULT 0,
  UNIQUE (loja_id, nome)
);

CREATE TABLE IF NOT EXISTS fornecedor (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  uuid          TEXT    NOT NULL UNIQUE,
  loja_id       INTEGER NOT NULL REFERENCES loja(id),
  nome          TEXT    NOT NULL,
  telefone      TEXT,
  email         TEXT,
  endereco      TEXT,
  observacoes   TEXT,
  ativo         INTEGER NOT NULL DEFAULT 1,
  criado_em     TEXT    NOT NULL DEFAULT (datetime('now')),
  sincronizado  INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS produto (
  id             INTEGER PRIMARY KEY AUTOINCREMENT,
  uuid           TEXT    NOT NULL UNIQUE,
  loja_id        INTEGER NOT NULL REFERENCES loja(id),
  nome           TEXT    NOT NULL,
  codigo_barras  TEXT,
  categoria_id   INTEGER NOT NULL REFERENCES categoria(id),
  fornecedor_id  INTEGER REFERENCES fornecedor(id),
  preco_custo    REAL    NOT NULL CHECK (preco_custo >= 0),
  preco_venda    REAL    NOT NULL CHECK (preco_venda >= 0),
  -- CHECK garante RN06 mesmo se passar erro no código
  estoque_atual  INTEGER NOT NULL DEFAULT 0 CHECK (estoque_atual >= 0),
  estoque_minimo INTEGER NOT NULL DEFAULT 0 CHECK (estoque_minimo >= 0),
  data_validade  TEXT,
  ativo          INTEGER NOT NULL DEFAULT 1,
  criado_em      TEXT    NOT NULL DEFAULT (datetime('now')),
  atualizado_em  TEXT    NOT NULL DEFAULT (datetime('now')),
  sincronizado   INTEGER NOT NULL DEFAULT 0,
  UNIQUE (loja_id, codigo_barras)
);

CREATE TABLE IF NOT EXISTS movimentacao (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  -- gerado no aparelho, evita duplicar no reenvio
  uuid          TEXT    NOT NULL UNIQUE,
  -- apagar produto com histórico falha, e é isso que queremos
  produto_id    INTEGER NOT NULL REFERENCES produto(id),
  usuario_id    INTEGER NOT NULL REFERENCES usuario(id),
  tipo          TEXT    NOT NULL CHECK (tipo IN (
                  'COMPRA','DEVOLUCAO_CLIENTE','AJUSTE_ENTRADA',
                  'VENDA','PERDA','VENCIMENTO','DEVOLUCAO_FORNECEDOR','AJUSTE_SAIDA')),
  quantidade    INTEGER NOT NULL CHECK (quantidade > 0),
  saldo_apos    INTEGER NOT NULL CHECK (saldo_apos >= 0),
  data_hora     TEXT    NOT NULL DEFAULT (datetime('now')),
  observacoes   TEXT,
  sincronizado  INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_produto_loja      ON produto(loja_id);
CREATE INDEX IF NOT EXISTS idx_produto_categoria ON produto(categoria_id);
CREATE INDEX IF NOT EXISTS idx_mov_produto_data  ON movimentacao(produto_id, data_hora DESC);
CREATE INDEX IF NOT EXISTS idx_mov_pendente      ON movimentacao(sincronizado);
`;

// Carga inicial. Produtos entram com saldo zero: o saldo é construído
// pelas movimentações, senão o histórico não fecha.
export const CARGA_INICIAL = `
INSERT INTO loja (uuid, nome, documento) VALUES
  ('loja-0001', 'Mercearia Modelo', '12.345.678/0001-90');

INSERT INTO usuario (uuid, loja_id, nome, email, senha_hash, tipo_perfil) VALUES
  ('user-0001', 1, 'Marlene Proprietária', 'proprietario@stockeasy.com', 'admin123', 'PROPRIETARIO'),
  ('user-0002', 1, 'Júnior Operador',      'operador@stockeasy.com',     'admin123', 'OPERADOR');

INSERT INTO categoria (uuid, loja_id, nome) VALUES
  ('cat-0001', 1, 'Alimentos'),
  ('cat-0002', 1, 'Bebidas'),
  ('cat-0003', 1, 'Limpeza'),
  ('cat-0004', 1, 'Higiene'),
  ('cat-0005', 1, 'Outros');

INSERT INTO fornecedor (uuid, loja_id, nome, telefone, email) VALUES
  ('forn-0001', 1, 'Distribuidora ABC Ltda', '(62) 3333-4444', 'contato@abc.com.br'),
  ('forn-0002', 1, 'Comercial XYZ',          '(62) 3555-6666', 'vendas@xyz.com.br'),
  ('forn-0003', 1, 'Atacadão Central',       '(62) 3777-8888', 'compras@central.com.br');

INSERT INTO produto
  (uuid, loja_id, nome, codigo_barras, categoria_id, fornecedor_id,
   preco_custo, preco_venda, estoque_atual, estoque_minimo, data_validade) VALUES
  ('prod-0001', 1, 'Arroz Tipo 1 5kg',         '7891234567890', 1, 1, 15.00, 22.00, 0, 10, NULL),
  ('prod-0002', 1, 'Feijão Preto 1kg',         '7891234567891', 1, 1,  6.50, 10.00, 0, 15, NULL),
  ('prod-0003', 1, 'Refrigerante Cola 2L',     '7891234567892', 2, 2,  4.00,  7.50, 0, 20, '2026-11-30'),
  ('prod-0004', 1, 'Detergente Líquido 500ml', '7891234567893', 3, 2,  1.80,  3.50, 0, 10, NULL),
  ('prod-0005', 1, 'Sabonete 90g',             '7891234567894', 4, 1,  1.20,  2.50, 0, 15, '2026-10-10');
`;

// entradas iniciais
export const ENTRADAS_INICIAIS: {
  produtoId: number;
  quantidade: number;
  observacao: string;
}[] = [
  { produtoId: 1, quantidade: 50, observacao: "Estoque inicial" },
  { produtoId: 2, quantidade: 30, observacao: "Estoque inicial" },
  { produtoId: 3, quantidade: 25, observacao: "Estoque inicial" },
  { produtoId: 4, quantidade: 40, observacao: "Estoque inicial" },
  { produtoId: 5, quantidade: 20, observacao: "Estoque inicial" },
];
