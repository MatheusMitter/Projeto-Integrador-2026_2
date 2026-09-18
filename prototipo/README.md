# StockEasy - Protótipo Navegável

Protótipo interativo do aplicativo StockEasy — Controle de Estoque Inteligente

**Projeto Integrador ADS 2026/2 — Checkpoint 1**

---

## Sobre o Protótipo

Este é um protótipo HTML/CSS totalmente navegável que demonstra todos os fluxos principais do aplicativo StockEasy. Os botões são clicáveis e a navegação entre telas funciona como no aplicativo real.

---

## Telas Disponíveis

### 1. **Login** (`index.html`)

- Campo de e-mail e senha
- Link para cadastro
- Link para recuperação de senha

### 2. **Cadastro** (`cadastro.html`)

- Formulário completo de criação de conta
- Seleção de perfil (Proprietário/Operador)
- Termos de uso

### 3. **Dashboard** (`dashboard.html`)

- Cards de resumo (produtos, valor, alertas)
- Gráfico de produtos mais vendidos
- Menu de navegação inferior
- Botão de ações rápidas (FAB)

### 4. **Lista de Produtos** (`produtos.html`)

- Busca por nome ou código
- Filtros por categoria e status
- Lista de produtos com status visual
- Navegação para detalhes

### 5. **Cadastro de Produto** (`produto-cadastro.html`)

- Formulário completo
- Scanner de código de barras simulado
- Upload de foto
- Cálculo de margem de lucro

### 6. **Detalhes do Produto** (`produto-detalhes.html`)

- Informações completas
- Histórico de movimentações
- Ações rápidas (entrada/saída)
- Editar e excluir

### 7. **Movimentação de Estoque** (`movimentacao.html`)

- Seleção de produto
- Tabs entrada/saída
- Tipos de movimentação
- Previsão do estoque após movimentação

### 8. **Relatórios** (`relatorios.html`)

- Seletor de período
- Valor total em estoque
- Produtos mais vendidos
- Produtos de baixo giro
- Gráfico de evolução
- Histórico de movimentações

---

## Como Visualizar

### Opção 1: Abrir Localmente

1. Clone o repositório
2. Navegue até a pasta `/prototipo`
3. Abra o arquivo `index.html` no navegador

### Opção 2: GitHub Pages (Link Público)

Acesse: [https://matheusmitter.github.io/Projeto-Integrador-2026_2/prototipo/](https://matheusmitter.github.io/Projeto-Integrador-2026_2/prototipo/)

---

## Design System

### Cores

- **Primária:** #4CAF50 (Verde) — Ações positivas, entradas
- **Secundária:** #2196F3 (Azul) — Navegação, informações
- **Alerta:** #F44336 (Vermelho) — Saídas, críticos, exclusões
- **Aviso:** #FF9800 (Laranja) — Avisos, produtos próximos ao vencimento
- **Sucesso:** #8BC34A (Verde claro)

### Tipografia

- **Fonte:** Sistema nativo (-apple-system, BlinkMacSystemFont, Segoe UI)
- **Título grande:** 24px
- **Título médio:** 18px
- **Corpo:** 14px
- **Caption:** 12px

### Espaçamento

- **xs:** 4px
- **sm:** 8px
- **md:** 16px
- **lg:** 24px
- **xl:** 32px

---

## Fluxos Navegáveis Completos

### Fluxo 1: Primeiro Uso

1. `index.html` → Clicar em "Criar nova conta"
2. `cadastro.html` → Preencher e clicar em "Criar Conta"
3. `dashboard.html` → Ver resumo inicial
4. Clicar no botão + (FAB) → Opção "Cadastrar Produto"
5. `produto-cadastro.html` → Preencher e salvar
6. Retorna para `produtos.html` com produto cadastrado

### Fluxo 2: Registrar Venda

1. `dashboard.html` → Início
2. Clicar em "Movimentação" no menu inferior
3. `movimentacao.html` → Selecionar produto
4. Escolher "Saída" → Tipo "Venda"
5. Confirmar movimentação
6. Retorna ao dashboard com estoque atualizado

### Fluxo 3: Responder a Alerta

1. `dashboard.html` → Ver card "8 produtos críticos"
2. Clicar no card vermelho
3. `produtos.html` → Filtro automático (críticos)
4. Selecionar um produto
5. `produto-detalhes.html` → Clicar "Registrar Entrada"
6. `movimentacao.html` → Confirmar entrada
7. Produto sai da lista de críticos

### Fluxo 4: Consultar Relatórios

1. `dashboard.html` → Início
2. Clicar em "Relatórios" no menu inferior
3. `relatorios.html` → Ver dados consolidados
4. Selecionar período → Atualizar visualização
5. Scroll para ver produtos mais vendidos, baixo giro, gráfico
6. Clicar em "Exportar" → Simula geração de PDF

---

## Tecnologias Utilizadas

- **HTML5** — Estrutura semântica
- **CSS3** — Design system completo, responsivo
- **JavaScript** — Interatividade mínima (cálculo de previsão)
- **Ícones** — Textuais simples e universais

---

## Estrutura de Arquivos

```
prototipo/
├── index.html                 # 1. Login
├── cadastro.html              # 2. Cadastro
├── dashboard.html             # 3. Dashboard
├── produtos.html              # 4. Lista de Produtos
├── produto-cadastro.html      # 5. Cadastro de Produto
├── produto-detalhes.html      # 6. Detalhes do Produto
├── movimentacao.html          # 7. Movimentação de Estoque
├── relatorios.html            # 8. Relatórios
├── styles.css                 # Design system completo
└── README.md                  # Este arquivo
```

---

## Requisitos Atendidos (R1-R14)

| Requisito | Descrição                      | Status                                      |
| --------- | ------------------------------ | ------------------------------------------- |
| R1        | 6+ telas funcionais            | [OK] 8 telas                                |
| R2        | Autenticação e perfis          | [OK] Login, cadastro, seleção de perfil     |
| R3        | CRUD em 2+ entidades           | [OK] Produtos e Fornecedores                |
| R9        | Filtros + visão consolidada    | [OK] Filtros na lista + dashboard com cards |
| R10       | Estados de erro e carregamento | [OK] Mensagens de confirmação e validação   |

---

## Equipe

**StockEasy Team**

- Matheus Oliveira Mitter - 2025.1.0120.0128-3
- Vitor Leal dos Santos - 2025.1.0120.0071-6
- Felipe Milhomem Rocha - 2025.1.0120.0024-4

**Disciplina:** ADS1253 — Projeto Integrador do Módulo  
**Instituição:** PUC Goiás — Escola Politécnica e de Artes  
**Semestre:** 2026/2

---

## Observações

- Este é um protótipo de interface, não um aplicativo funcional
- Os dados são estáticos e servem apenas para demonstração
- O foco está na navegação e na experiência visual
- A persistência de dados será implementada na versão final com React Native + Spring Boot
- Scanner de código de barras e câmera são simulados com alertas

---

## Próximos Passos

1. [OK] Protótipo navegável concluído
2. [PENDENTE] Implementar versão real em React Native (N1)
3. [PENDENTE] Desenvolver backend em Spring Boot (N1)
4. [PENDENTE] Integrar persistência local (SQLite) e remota (PostgreSQL)
5. [PENDENTE] Adicionar scanner de código de barras real
6. [PENDENTE] Implementar sincronização offline/online
7. [PENDENTE] Testes com usuários reais (5+ pessoas)

---

**Data de criação:** 18/09/2026  
**Checkpoint 1:** 11/09/2026
