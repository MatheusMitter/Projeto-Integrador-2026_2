# Especificação do Protótipo Navegável — StockEasy

**Projeto:** StockEasy — Controle de Estoque Inteligente
**Artefato do Checkpoint 1 (11/09/2026), revisado para a entrega N1**
**Implementação:** HTML5 e CSS3, publicado em GitHub Pages
**Versão:** 2.0 — 28/09/2026

---

## Nota sobre a ferramenta

A versão 1.0 desta especificação previa implementação em Figma. O protótipo foi construído em HTML e CSS, e esta especificação foi atualizada para refletir o que existe.

A decisão e suas razões estão registradas em [`N1-memorial-prototipo.md`](N1-memorial-prototipo.md). Em resumo: HTML e CSS entregam navegação real no navegador, sem conta nem permissão de compartilhamento, permitem demonstrar regras de negócio com poucas linhas de JavaScript e reaproveitam o sistema de design na implementação em React Native.

O protótipo entregue tem **11 telas**, e não as 6 previstas originalmente. As telas acrescentadas foram recuperação de senha, configurações e fornecedores — esta última necessária porque o requisito R3 exige manutenção completa de dados sobre pelo menos duas entidades, e o protótipo inicial só demonstrava Produtos.

---

## Objetivo do Protótipo

Demonstrar a navegação entre as telas principais, validar os fluxos de uso mais importantes e tornar verificáveis as regras de negócio centrais do domínio. O protótipo é interativo, com botões e links funcionais, e representa a estrutura de navegação prevista para a aplicação.

---

## Estrutura de Navegação

```
Login ──┬── Cadastro de conta
        └── Recuperação de senha
           ↓
Painel (Dashboard)
    ├→ Produtos (lista, busca, filtros)
    │   ├→ Detalhes do produto
    │   └→ Cadastro e edição de produto
    ├→ Movimentação (entrada e saída)
    ├→ Relatórios
    └→ Configurações e perfil
        └→ Fornecedores (lista, cadastro, edição, exclusão)
```

A navegação inferior dá acesso direto a Painel, Produtos, Movimentação, Relatórios e Configurações em qualquer ponto do aplicativo.

---

## Tela 1: Login e Cadastro

### Variantes:

- **1.1 — Tela de Login**
- **1.2 — Tela de Cadastro**
- **1.3 — Tela de Recuperação de Senha**

### 1.1 — Login

**Elementos visuais:**

- Logotipo do StockEasy no topo
- Campo de entrada: E-mail (ícone de envelope)
- Campo de entrada: Senha (ícone de cadeado, toggle para mostrar/ocultar)
- Botão primário: "Entrar"
- Link: "Esqueci minha senha"
- Link: "Criar nova conta"

**Comportamento:**

- Botão "Entrar" → Validação → Dashboard
- Link "Criar nova conta" → Tela de Cadastro (1.2)
- Link "Esqueci minha senha" → Tela de Recuperação (1.3)

**Estados:**

- Estado padrão
- Estado de erro (e-mail ou senha inválidos)
- Estado de carregamento (spinner no botão)

### 1.2 — Cadastro

**Elementos visuais:**

- Título: "Criar Conta"
- Campo: Nome completo
- Campo: E-mail
- Campo: Senha (com indicador de força)
- Campo: Confirmar senha
- Seleção: Perfil (Proprietário / Operador) — com descrição de cada perfil
- Checkbox: "Aceito os termos de uso"
- Botão: "Criar conta"
- Link: "Já tenho conta — Fazer login"

**Comportamento:**

- Validação em tempo real (e-mail válido, senhas coincidem, força da senha)
- Botão "Criar conta" → Validação → Login automático → Dashboard
- Link "Fazer login" → Tela de Login (1.1)

### 1.3 — Recuperação de Senha

**Elementos visuais:**

- Título: "Recuperar Senha"
- Descrição: "Enviaremos um link de recuperação para o seu e-mail"
- Campo: E-mail cadastrado
- Botão: "Enviar link"
- Link: "Voltar para login"

**Comportamento:**

- Botão "Enviar link" → Confirmação visual → Voltar para Login

---

## Tela 2: Dashboard (Home)

### Layout:

**Cabeçalho:**

- Saudação: "Olá, [Nome do usuário]"
- Ícone de notificações (badge com número de alertas)
- Ícone de perfil/configurações

**Cards de Resumo (Grid 2x2):**

1. **Total de Produtos**
   - Número grande: ex. "247"
   - Subtítulo: "produtos cadastrados"
   - Ícone: caixa

2. **Valor em Estoque**
   - Número grande: ex. "R$ 12.450,00"
   - Subtítulo: "valor total investido"
   - Ícone: cifrão

3. **Produtos Críticos**
   - Número grande em vermelho: ex. "8"
   - Subtítulo: "abaixo do estoque mínimo"
   - Ícone: alerta
   - Botão: "Ver produtos"

4. **Próximos ao Vencimento**
   - Número grande em laranja: ex. "3"
   - Subtítulo: "nos próximos 15 dias"
   - Ícone: calendário
   - Botão: "Ver produtos"

**Seção: Produtos Mais Vendidos**

- Gráfico de barras horizontal (top 5 produtos)
- Cada barra mostra: nome do produto e quantidade vendida no período

**Ações Rápidas (Botões flutuantes):**

- Botão principal (FAB): "+" → Menu com opções:
  - "Registrar Venda"
  - "Registrar Entrada"
  - "Cadastrar Produto"

**Menu de Navegação Inferior (Tab Bar):**

- Home (ativo)
- Produtos
- Movimentação
- Relatórios
- Mais

**Comportamento:**

- Toque em "Produtos Críticos" → Tela de Produtos (filtro automático: críticos)
- Toque no gráfico → Tela de Relatórios
- Botão FAB → Expandir opções → Redirecionar para tela correspondente
- Tab Bar → Navegar entre seções

---

## Tela 3: Produtos (Listagem)

### Layout:

**Cabeçalho:**

- Título: "Produtos"
- Barra de busca: "Buscar por nome ou código..."
- Ícone: Scanner de código de barras
- Ícone: Filtros

**Filtros (modal ou barra expansível):**

- Categoria: Dropdown (Todos, Alimentos, Bebidas, Limpeza, Higiene, Outros)
- Fornecedor: Dropdown (lista de fornecedores cadastrados)
- Status de Estoque: Chips selecionáveis (Crítico, Baixo, Normal, Excesso)
- Ordenação: Nome A-Z, Nome Z-A, Quantidade (menor→maior), Quantidade (maior→menor)

**Lista de Produtos (cards verticais):**
Cada card contém:

- Foto do produto (miniatura)
- Nome do produto
- Código de barras (pequeno, abaixo do nome)
- Quantidade em estoque (número destacado)
- Status visual: bolinha colorida (vermelho: crítico, amarelo: baixo, verde: normal, azul: excesso)
- Preço de venda
- Ícone: Editar (lápis)
- Ícone: Detalhes (seta para a direita)

**Estados da lista:**

- Estado vazio: "Nenhum produto cadastrado. Cadastre o primeiro produto!"
- Estado de carregamento: Skeleton screens
- Estado de busca sem resultados: "Nenhum produto encontrado"

**Botão flutuante (FAB):**

- "+" → Cadastrar novo produto

**Comportamento:**

- Toque no card → Tela de Detalhes do Produto
- Ícone "Editar" → Tela de Edição de Produto
- Ícone "Scanner" → Ativar câmera → Buscar produto pelo código
- Botão "+" → Tela de Cadastro de Produto

---

## Tela 4: Cadastro/Edição de Produto

### Variantes:

- **4.1 — Cadastrar Novo Produto**
- **4.2 — Editar Produto Existente**

### Layout (ambos compartilham estrutura):

**Cabeçalho:**

- Título: "Novo Produto" ou "Editar Produto"
- Botão: "Voltar" (← seta)
- Botão: "Salvar" (check ou texto)

**Formulário (scroll vertical):**

1. **Foto do Produto**
   - Placeholder: quadrado com ícone de câmera
   - Botão: "Adicionar foto" → Opções: Tirar foto / Escolher da galeria

2. **Código de Barras**
   - Campo de texto
   - Botão ao lado: Ícone de scanner → Ativar câmera para leitura
   - Após leitura bem-sucedida: preenchimento automático de outros campos via API (se disponível)

3. **Nome do Produto\***
   - Campo de texto obrigatório

4. **Categoria\***
   - Dropdown: Alimentos, Bebidas, Limpeza, Higiene, Outros

5. **Fornecedor**
   - Dropdown com lista de fornecedores cadastrados
   - Link: "+ Cadastrar novo fornecedor" (abre modal)

6. **Preço de Custo\***
   - Campo numérico (R$)
   - Máscara de moeda

7. **Preço de Venda\***
   - Campo numérico (R$)
   - Indicador visual: margem de lucro (calculado automaticamente)

8. **Quantidade Inicial\***
   - Campo numérico (unidades)

9. **Estoque Mínimo\***
   - Campo numérico (unidades)
   - Descrição: "Você será alertado quando o estoque ficar abaixo deste valor"

10. **Data de Validade** (opcional)
    - Seletor de data

**Botões inferiores:**

- Botão secundário: "Cancelar"
- Botão primário: "Salvar Produto"

**Validações:**

- Campos obrigatórios indicados com asterisco (\*)
- Erro em tempo real: campos vazios, preço de venda menor que custo
- Confirmação ao salvar: "Produto cadastrado com sucesso!" (toast)

**Comportamento:**

- Botão "Salvar" → Validação → Salvar no banco → Voltar para Lista de Produtos
- Botão "Cancelar" → Confirmar descarte de alterações → Voltar
- Scanner bem-sucedido → Buscar dados na API → Preencher nome, categoria e foto automaticamente

---

## Tela 5: Movimentação de Estoque

### Layout:

**Cabeçalho:**

- Título: "Movimentação de Estoque"
- Botão: "Voltar"

**Seleção de Produto:**

- Campo de busca: "Buscar produto..."
- Botão: Ícone de scanner → Ativar câmera para leitura de código de barras
- Após seleção: Card do produto aparece (foto, nome, estoque atual)

**Tipo de Movimentação (tabs ou botões toggle):**

- **Entrada** (cor verde)
- **Saída** (cor vermelha)

**Formulário:**

1. **Quantidade\***
   - Campo numérico
   - Incrementadores: botões +/− para ajuste rápido

2. **Motivo/Tipo** (depende da aba ativa)
   - **Se Entrada:** Compra de fornecedor, Devolução de cliente, Ajuste de inventário, Outros
   - **Se Saída:** Venda, Perda, Vencimento, Devolução a fornecedor, Ajuste de inventário, Outros

3. **Data e Hora\***
   - Campo de data/hora (padrão: data e hora atuais)

4. **Observações** (opcional)
   - Campo de texto livre

**Previsão após movimentação:**

- Card de alerta visual:
  - "Estoque atual: 50 unidades"
  - "Após esta movimentação: 35 unidades"
  - Se ficar abaixo do mínimo: alerta em vermelho "Atenção: estoque ficará crítico!"

**Botões inferiores:**

- Botão secundário: "Cancelar"
- Botão primário: "Confirmar Movimentação"

**Comportamento:**

- Scanner bem-sucedido → Selecionar produto automaticamente
- Botão "Confirmar" → Validação → Atualizar estoque → Registrar histórico → Voltar para Dashboard
- Toast de confirmação: "Movimentação registrada com sucesso!"

---

## Tela 6: Relatórios

### Layout:

**Cabeçalho:**

- Título: "Relatórios"
- Seletor de período: Dropdown (Última semana, Último mês, Último trimestre, Personalizado)
- Ícone: Compartilhar/Exportar

**Cards de visão consolidada:**

1. **Produtos Mais Vendidos**
   - Gráfico de barras horizontal (top 10)
   - Cada item: nome do produto, quantidade vendida, valor total gerado

2. **Produtos de Baixo Giro**
   - Lista de produtos com menor saída no período
   - Indicação: "Considere promoção ou reposição reduzida"

3. **Valor Total em Estoque**
   - Número grande: ex. "R$ 12.450,00"
   - Comparação com período anterior: "↑ 5% em relação ao mês passado"

4. **Histórico de Movimentações**
   - Lista cronológica (mais recentes primeiro)
   - Cada item: data/hora, produto, tipo (entrada/saída), quantidade, usuário responsável
   - Filtros: Tipo de movimentação, Produto específico, Usuário

**Gráfico de Evolução do Estoque:**

- Gráfico de linha mostrando valor total do estoque ao longo do período selecionado
- Eixo X: datas
- Eixo Y: valor em R$

**Botão de ação:**

- "Exportar Relatório" → Opções: PDF, Compartilhar via WhatsApp/E-mail

**Comportamento:**

- Toque em produto do ranking → Tela de Detalhes do Produto
- Toque em item do histórico → Modal com detalhes completos da movimentação
- Seletor de período → Atualizar todos os dados da tela
- Botão "Exportar" → Gerar PDF → Abrir sheet de compartilhamento do sistema

---

## Tela Extra: Detalhes do Produto

### Layout:

**Cabeçalho:**

- Botão: "Voltar"
- Botão: "Editar" (ícone de lápis)
- Botão: "Excluir" (ícone de lixeira)

**Seção Superior:**

- Foto do produto (grande)
- Nome do produto (título)
- Código de barras
- Status visual: chip colorido (Crítico / Baixo / Normal / Excesso)

**Cards de Informações:**

1. **Estoque**
   - Quantidade atual (número grande)
   - Estoque mínimo
   - Indicador visual: barra de progresso

2. **Preços**
   - Preço de custo
   - Preço de venda
   - Margem de lucro (% e valor)

3. **Fornecedor**
   - Nome do fornecedor
   - Contato
   - Botão: "Ver outros produtos deste fornecedor"

4. **Categoria**
   - Nome da categoria
   - Botão: "Ver outros produtos desta categoria"

**Histórico de Movimentações deste Produto:**

- Lista cronológica das últimas 10 movimentações
- Cada item: data, tipo, quantidade, saldo após movimentação
- Link: "Ver histórico completo"

**Botões de ação rápida (fixos no rodapé):**

- Botão: "Registrar Entrada"
- Botão: "Registrar Saída"

**Comportamento:**

- Botão "Editar" → Tela de Edição (4.2)
- Botão "Excluir" → Modal de confirmação → Excluir → Voltar para Lista
- Botões de ação rápida → Tela de Movimentação (5) com produto pré-selecionado

---

## Tela Extra: Configurações/Perfil

### Layout:

**Cabeçalho:**

- Título: "Configurações"

**Seção: Perfil do Usuário**

- Foto de perfil (editável)
- Nome do usuário
- E-mail
- Tipo de perfil: Proprietário ou Operador
- Botão: "Editar perfil"

**Seção: Configurações do App**

- Toggle: Notificações ativadas
- Toggle: Sincronização automática
- Seletor: Intervalo de alerta de vencimento (7, 15, 30 dias)
- Botão: "Gerenciar categorias"
- Botão: "Gerenciar fornecedores"

**Seção: Dados e Segurança**

- Botão: "Alterar senha"
- Botão: "Backup manual" (forçar sincronização)
- Botão: "Exportar todos os dados"

**Seção: Sobre**

- Versão do app
- Botão: "Termos de uso"
- Botão: "Política de privacidade"

**Seção: Conta**

- Botão: "Sair da conta" (vermelho)

---

## Fluxos de Navegação Demonstráveis no Protótipo

### Fluxo 1: Primeiro Uso Completo

1. Tela de Cadastro (1.2)
2. Preencher dados → Criar conta
3. Dashboard (2) — tour visual com tooltips explicativos
4. Botão FAB → "Cadastrar Produto"
5. Tela de Cadastro de Produto (4.1)
6. Preencher dados → Salvar
7. Voltar ao Dashboard → Ver card "1 produto cadastrado"

### Fluxo 2: Registrar Venda (Operação do Dia a Dia)

1. Dashboard (2)
2. Botão FAB → "Registrar Venda"
3. Tela de Movimentação (5) — Aba "Saída" ativa
4. Tocar ícone de scanner → [simular leitura de código de barras]
5. Produto aparece pré-selecionado
6. Preencher quantidade → Confirmar
7. Voltar ao Dashboard → Card "Valor em Estoque" atualizado

### Fluxo 3: Responder a Alerta de Produto em Falta

1. Dashboard (2) → Notificação "8 produtos críticos"
2. Tocar em "Produtos Críticos"
3. Tela de Produtos (3) — Filtro automático: apenas produtos críticos
4. Selecionar um produto
5. Tela de Detalhes → Botão "Registrar Entrada"
6. Tela de Movimentação (5) — Produto pré-selecionado, aba "Entrada"
7. Preencher quantidade → Confirmar
8. Voltar → Produto sai da lista de críticos

### Fluxo 4: Consulta e Análise de Desempenho

1. Dashboard (2)
2. Tab Bar → "Relatórios"
3. Tela de Relatórios (6)
4. Seletor de período → "Último mês"
5. Ver gráfico de produtos mais vendidos
6. Tocar em um produto do ranking
7. Tela de Detalhes do Produto → Ver histórico completo
8. Botão "Voltar" → Botão "Exportar Relatório"
9. [Simular geração de PDF]

---

## Sistema de Design

### Cores

A paleta abaixo é a implementada em `prototipo/styles.css`. As cores originalmente previstas reprovavam no contraste mínimo de 4,5:1 quando aplicadas com texto branco, e foram substituídas por tons mais escuros da mesma família. A medição de cada uma está no memorial do protótipo.

| Uso                                    | Cor       | Contraste com branco |
| -------------------------------------- | --------- | -------------------- |
| Primária — ações positivas e entradas  | `#2E7D32` | 5,13:1               |
| Primária escura — estados pressionados | `#1B5E20` | 7,57:1               |
| Secundária — navegação e informação    | `#1565C0` | 5,40:1               |
| Alerta — saídas, críticos, exclusões   | `#C62828` | 5,90:1               |
| Aviso — vencimento próximo             | `#E65100` | 4,80:1               |

Fundos suaves usam as variações claras `#E8F5E9`, `#E3F2FD`, `#FFEBEE` e `#FFF3E0`, sempre combinadas com texto no tom escuro correspondente. Na escala de cinzas, `#757575` é o tom mais claro admitido para texto; tons acima disso ficam restritos a bordas e divisores.

**Tipografia:**

- Título grande: 24px, bold
- Título de seção: 18px, semibold
- Corpo: 14px, regular
- Caption/Label: 12px, regular

**Espaçamento:**

- Padding de cards: 16px
- Espaçamento entre elementos: 8px, 16px, 24px
- Margem lateral: 16px

**Componentes Reutilizáveis:**

- Botões primários, secundários e de alerta
- Cards de informação
- Campos de formulário (input, dropdown, date picker)
- Chips de status
- Tab bar de navegação
- FAB (Floating Action Button)
- Modais e sheets

### Interatividade:

- Todos os botões devem ter estado hover/pressed
- Links de navegação devem apontar para as telas corretas
- Inputs devem ter estados: vazio, preenchido, com erro
- Animações de transição entre telas (opcional, mas recomendado)

### Acessibilidade

- Contraste mínimo de 4,5:1 entre texto e fundo
- Área de toque mínima de 44 por 44 pixels, aplicada por token único no CSS
- Campos de formulário com `id` e `<label for>` associado
- Ícones interativos com rótulo acessível; ícones decorativos ocultos ao leitor de tela
- Foco de teclado visível em todos os elementos interativos
- Informação nunca transmitida apenas por cor
- Gráficos com alternativa textual descrevendo os dados

O detalhamento e a justificativa de cada decisão estão em [`N1-memorial-prototipo.md`](N1-memorial-prototipo.md).

---

## Validação do Protótipo

A verificação abaixo foi executada em 28/09/2026 por inspeção automatizada dos arquivos.

| Verificação                                                        | Resultado                |
| ------------------------------------------------------------------ | ------------------------ |
| Telas completas e navegáveis                                       | 11, acima do mínimo de 6 |
| Fluxos demonstráveis do início ao fim                              | 5                        |
| Links apontando para destino inexistente                           | Nenhum                   |
| Destinos de navegação que não correspondem a arquivo               | Nenhum                   |
| Campos de formulário sem rótulo associado                          | Nenhum, de 35 campos     |
| Cores fora do contraste mínimo remanescentes no código             | Nenhuma                  |
| Estados visuais representados (erro, sucesso, vazio, carregamento) | Presentes                |
| Largura de referência para smartphones                             | 375px a 428px            |
| Regras de negócio verificáveis por interação                       | 3 — RN06, RN07 e RN13    |

---

## Observação Final

Este protótipo serve como:

1. Validação da interface antes da implementação
2. Base direta para as telas em React Native, com o sistema de design reaproveitado
3. Documentação visual dos requisitos de interface (R1)
4. Material de demonstração na apresentação da N1

Conformidade plena com a WCAG exige teste manual com leitores de tela e revisão por especialista, previstos para as sessões de usabilidade da Semana 15.
