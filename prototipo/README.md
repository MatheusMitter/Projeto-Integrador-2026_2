# StockEasy — Protótipo Navegável

Protótipo interativo do aplicativo StockEasy — Controle de Estoque Inteligente.

**Projeto Integrador ADS 2026/2 — artefato do Checkpoint 1 (11/09/2026), revisado para a entrega N1**

---

## Sobre o protótipo

Protótipo HTML/CSS navegável que demonstra os fluxos principais do aplicativo. Os botões são clicáveis e a navegação entre telas funciona como no aplicativo real.

A escolha de HTML/CSS em vez de uma ferramenta de prototipação visual está justificada em [`docs/N1-memorial-prototipo.md`](../docs/N1-memorial-prototipo.md).

**Importante:** é um protótipo de interface, não um aplicativo funcional. Os dados são estáticos. Câmera, scanner de código de barras e sincronização são simulados com mensagens explicativas.

---

## Como visualizar

**No celular — forma recomendada.** O protótipo é de um aplicativo móvel e deve ser avaliado em tela de celular.

1. Abra no navegador do aparelho: [matheusmitter.github.io/Projeto-Integrador-2026_2/prototipo/](https://matheusmitter.github.io/Projeto-Integrador-2026_2/prototipo/)
2. No menu do navegador, escolha "Adicionar à tela inicial" (Android) ou "Adicionar à Tela de Início" (iOS)
3. Abra pelo ícone que aparece entre os aplicativos

Aberto assim, o protótipo ocupa a tela inteira, sem barra de endereço, com ícone e nome próprios. A configuração está em `manifest.webmanifest`, com exibição autônoma, orientação retrato e cor de tema `#2E7D32`.

Sem instalar, abrir o endereço direto no navegador do celular também funciona: o layout tem largura de referência de 428px e se ajusta à tela.

**No computador.** Abra `index.html` em qualquer navegador, ou o endereço acima. O conteúdo fica centralizado numa moldura de 428px, simulando a proporção de um aparelho. Para inspecionar como em um celular, use o modo de dispositivo das ferramentas de desenvolvedor.

**Localmente.** Clone o repositório, entre em `prototipo/` e abra `index.html`. Não requer servidor nem instalação de dependências.

---

## Telas (11)

| #   | Arquivo                 | Tela                   | Conteúdo                                                                  |
| --- | ----------------------- | ---------------------- | ------------------------------------------------------------------------- |
| 1   | `index.html`            | Login                  | E-mail, senha, links para cadastro e recuperação                          |
| 2   | `cadastro.html`         | Cadastro de conta      | Dados do usuário, seleção de perfil, termos de uso                        |
| 3   | `recuperar-senha.html`  | Recuperação de senha   | Envio de link por e-mail, com confirmação neutra por segurança            |
| 4   | `dashboard.html`        | Dashboard              | Cards de resumo, gráfico de mais vendidos, navegação inferior, FAB        |
| 5   | `produtos.html`         | Lista de produtos      | Busca, filtros por status e categoria, status visual por produto          |
| 6   | `produto-cadastro.html` | Cadastro de produto    | Formulário completo, scanner simulado, foto, margem automática            |
| 7   | `produto-detalhes.html` | Detalhes do produto    | Dados completos, precificação, fornecedor, histórico, ações rápidas       |
| 8   | `movimentacao.html`     | Movimentação           | Entrada/saída, quantidade, motivo, previsão de saldo com RN06 e RN07      |
| 9   | `relatorios.html`       | Relatórios             | Valor em estoque, mais vendidos, baixo giro, evolução, histórico          |
| 10  | `configuracoes.html`    | Configurações e perfil | Perfil, notificações, sincronização, alerta de vencimento, sair da conta  |
| 11  | `fornecedores.html`     | Fornecedores           | Lista, busca, cadastro, edição e exclusão com validação de vínculo (RN13) |

---

## Fluxos navegáveis

**1. Primeiro uso** — `index.html` → "Criar nova conta" → `cadastro.html` → `dashboard.html` → FAB → `produto-cadastro.html` → salvar → `produtos.html`

**2. Registrar venda** — `dashboard.html` → "Movimentação" → aba "Saída" → tipo "Venda" → quantidade → previsão de saldo → confirmar → `dashboard.html`

**3. Responder a alerta de falta** — `dashboard.html` → card "8 produtos críticos" → `produtos.html` (filtro crítico) → produto → `produto-detalhes.html` → "Registrar Entrada" → `movimentacao.html` → confirmar

**4. Consultar desempenho** — `dashboard.html` → "Relatórios" → `relatorios.html` → selecionar período → mais vendidos, baixo giro, evolução → exportar

**5. Manter fornecedores** — `dashboard.html` → "Mais" → `configuracoes.html` → "Gerenciar fornecedores" → `fornecedores.html` → criar, editar ou excluir

---

## Regras de negócio demonstradas

O protótipo não apenas exibe telas: três regras estão implementadas em JavaScript e são verificáveis clicando.

| Regra | Onde verificar                                                                                     |
| ----- | -------------------------------------------------------------------------------------------------- |
| RN06  | `movimentacao.html` — informe uma saída maior que 50 unidades: o registro é bloqueado              |
| RN07  | `movimentacao.html` — informe uma saída que deixe o saldo em 10 ou menos: aviso de estoque crítico |
| RN13  | `fornecedores.html` — tente excluir a "Distribuidora ABC Ltda", que tem 12 produtos vinculados     |

---

## Design System

### Cores

A paleta foi ajustada para atender o contraste mínimo de 4,5:1 exigido pela WCAG 2.1 AA. As cores originais reprovavam quando aplicadas com texto branco.

| Token       | Antes                 | Agora     | Contraste com branco |
| ----------- | --------------------- | --------- | -------------------- |
| `primary`   | `#4CAF50` — 2,78:1 ❌ | `#2E7D32` | 5,13:1 ✅            |
| `secondary` | `#2196F3` — 3,13:1 ❌ | `#1565C0` | 5,40:1 ✅            |
| `danger`    | `#F44336` — 3,58:1 ❌ | `#C62828` | 5,90:1 ✅            |
| `warning`   | `#FF9800` — 2,16:1 ❌ | `#E65100` | 4,80:1 ✅            |
| `success`   | `#8BC34A` — 1,87:1 ❌ | `#2E7D32` | 5,13:1 ✅            |

Tokens `*-light` (`#E8F5E9`, `#E3F2FD`, `#FFEBEE`, `#FFF3E0`) são fundos suaves, sempre combinados com texto no tom escuro correspondente. Na escala de cinzas, `--gray-600` (`#757575`, 4,60:1) é o tom mais claro admitido para texto; `--gray-300/400/500` ficam restritos a bordas e divisores.

### Tipografia e espaçamento

Fonte do sistema (`-apple-system`, `Segoe UI`, `Roboto`). Título grande 24px, título médio 18px, corpo 14px, legenda 12px. Espaçamento em escala de 4px: `xs` 4, `sm` 8, `md` 16, `lg` 24, `xl` 32.

---

## Acessibilidade

| Implementação           | Detalhe                                                                          |
| ----------------------- | -------------------------------------------------------------------------------- |
| Rótulos associados      | Os 35 campos de formulário têm `id` e `<label for>` ou `aria-label`              |
| Contraste AA            | Paleta revisada para o mínimo de 4,5:1                                           |
| Áreas de toque          | Token `--touch-target: 44px` aplicado a botões, links de ação, navegação e FAB   |
| Foco de teclado visível | `:focus-visible` com contorno de 3px em todos os elementos interativos           |
| Alternativa textual     | Gráficos em `<figure>` com `<figcaption>` descrevendo os dados numericamente     |
| Não depender só de cor  | Status de estoque e tipo de movimentação trazem texto além da cor                |
| Marcos semânticos       | `<header>`, `<main>`, `<nav aria-label>`, `aria-current="page"` no item ativo    |
| Ícones                  | Emojis decorativos com `aria-hidden="true"`; ícones interativos com `aria-label` |
| Regiões dinâmicas       | Previsão de saldo e confirmações com `role="status"` e `aria-live="polite"`      |
| Movimento reduzido      | `@media (prefers-reduced-motion: reduce)` desativa transições e transformações   |

Validação automatizada executada: nenhum link morto, todos os destinos de navegação existem, nenhuma cor reprovada remanescente, todos os campos rotulados.

Conformidade plena com a WCAG exige teste manual com leitores de tela e revisão por especialista em acessibilidade — o que está previsto para as sessões de teste de usabilidade da Semana 15 (09 a 13/11).

---

## Estrutura de arquivos

```
prototipo/
├── index.html                 # 1. Login
├── cadastro.html              # 2. Cadastro de conta
├── recuperar-senha.html       # 3. Recuperação de senha
├── dashboard.html             # 4. Dashboard
├── produtos.html              # 5. Lista de produtos
├── produto-cadastro.html      # 6. Cadastro/edição de produto
├── produto-detalhes.html      # 7. Detalhes do produto
├── movimentacao.html          # 8. Movimentação de estoque
├── relatorios.html            # 9. Relatórios
├── configuracoes.html         # 10. Configurações e perfil
├── fornecedores.html          # 11. Fornecedores
├── styles.css                 # Design system
├── manifest.webmanifest       # Instalação na tela inicial do celular
├── icons/                     # Ícones do aplicativo
│   ├── icon-192.png
│   ├── icon-512.png
│   ├── icon-maskable-512.png
│   └── apple-touch-icon.png
└── README.md                  # Este arquivo
```

---

## Requisitos demonstráveis no protótipo

O protótipo antecipa a interface dos requisitos abaixo. A implementação funcional é verificada na aplicação, não aqui.

| Req | Descrição                         | Onde verificar no protótipo                                                                      |
| --- | --------------------------------- | ------------------------------------------------------------------------------------------------ |
| R1  | Mínimo de 6 telas com navegação   | 11 telas, navegação inferior em 6 delas e fluxos encadeados                                      |
| R2  | Autenticação e 2 perfis           | `index.html`, `cadastro.html`, `recuperar-senha.html`, `configuracoes.html`                      |
| R3  | Manutenção de 2+ entidades        | Produtos (`produto-cadastro.html`, `produto-detalhes.html`) e Fornecedores (`fornecedores.html`) |
| R4  | Regras de negócio                 | RN06 e RN07 em `movimentacao.html`; RN13 em `fornecedores.html`                                  |
| R9  | Filtro, busca e visão consolidada | Busca e chips em `produtos.html`; cards e gráficos em `dashboard.html` e `relatorios.html`       |
| R10 | Erros e estados                   | Validação de saída, previsão de saldo, confirmações de exclusão                                  |
| R11 | Usabilidade e acessibilidade      | Seção Acessibilidade acima                                                                       |

---

## Equipe

**StockEasy**

- Matheus Oliveira Mitter — 2025.1.0120.0128-3
- Vitor Leal dos Santos — 2025.1.0120.0071-6
- Felipe Milhomem Rocha — 2025.1.0120.0024-4

**Disciplina:** ADS1253 — Programação Orientada a Objeto com Banco de Dados / Projeto Integrador do Módulo
**Instituição:** PUC Goiás — Escola Politécnica e de Artes
**Semestre:** 2026/2

---

**Última atualização:** 28/09/2026
