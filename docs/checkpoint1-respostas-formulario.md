# Checkpoint 1 — Respostas do Formulário

**Data de entrega:** 11/09/2026  
**Equipe:** StockEasy Team

---

## 1. Integrantes do grupo (de 3 a 4 integrantes)

```
Matheus Oliveira Mitter - 2025.1.0120.0128-3
Vitor Leal dos Santos - 2025.1.0120.0071-6
Felipe Milhomem Rocha - 2025.1.0120.0024-4
```

---

## 2. Nome do projeto

**StockEasy — Controle de Estoque Inteligente**

---

## 3. Sobre o projeto

O **StockEasy** é um aplicativo móvel que resolve o problema de **falta de controle efetivo de estoque em pequenos comércios**, uma das principais causas de perdas financeiras, rupturas de produtos e desperdício por vencimento.

**Problema:** Pequenos comerciantes (mercearias, lojas de conveniência, minimercados, farmácias) geralmente controlam estoque de forma manual (cadernos, planilhas desatualizadas) ou não controlam, resultando em perda de vendas por falta de produtos, compras desnecessárias e dificuldade em identificar produtos de baixo giro.

**Público-alvo:**

- Proprietários de pequenos comércios (mercearias, padarias, minimercados)
- Gerentes de lojas de conveniência
- Empreendedores iniciantes no varejo
- Comerciantes que atuam sozinhos ou com equipes pequenas (até 5 funcionários)

O aplicativo será usado no dia a dia da operação para registrar entradas, saídas, conferir estoque, receber alertas de produtos em falta e tomar decisões de compra baseadas em dados reais de giro.

---

## 4. Qual é o escopo definido para esta primeira versão do projeto?

### Funcionalidades principais previstas:

**Gestão de Produtos**

- Cadastro completo de produtos (nome, código de barras, categoria, preço de custo e venda, estoque mínimo, fornecedor)
- Busca e filtros por categoria, fornecedor ou status de estoque
- Edição e exclusão de produtos com validação

**Controle de Estoque**

- Registro de entrada de mercadorias (compra de fornecedor)
- Registro de saída (venda, perda, vencimento, devolução)
- Visualização do estoque atual com indicadores visuais (crítico, baixo, normal, excesso)
- Histórico de movimentações por produto

**Alertas e Notificações**

- Alertas automáticos de produtos abaixo do estoque mínimo
- Notificações de produtos próximos ao vencimento
- Lembretes de reposição baseados no histórico de vendas

**Relatórios e Visões Consolidadas**

- Produtos mais vendidos (ranking)
- Produtos com baixo giro (candidatos a promoção)
- Valor total do estoque
- Gráfico de evolução do estoque por período
- Resumo financeiro (valor investido em estoque)

**Gestão de Fornecedores**

- Cadastro de fornecedores (nome, contato, produtos fornecidos)
- Consulta de produtos por fornecedor
- Histórico de compras por fornecedor

**Autenticação e Perfis de Usuário**

- Cadastro e login seguro
- Perfil Proprietário: acesso completo, relatórios financeiros, cadastro de usuários
- Perfil Operador: registro de entradas/saídas, consultas de estoque, sem acesso a relatórios financeiros
- Recuperação de senha

**Recursos Nativos e Integração**

- Leitura de código de barras via câmera (agiliza cadastro e registro de movimentações)
- Sincronização com servidor remoto (backup automático)
- Funcionalidade offline com sincronização posterior
- Integração com API de consulta de produtos por código de barras (ex: Open Food Facts, Cosmos API)

---

## 5. Insira o link para o protótipo navegável

**Link do protótipo navegável:**  
https://matheusmitter.github.io/Projeto-Integrador-2026_2/prototipo/

O protótipo foi desenvolvido em HTML/CSS e está hospedado no GitHub Pages. É totalmente navegável — os botões são clicáveis e a navegação entre telas funciona como no aplicativo real.

**Alternativa:** O protótipo também pode ser acessado localmente abrindo o arquivo `/prototipo/index.html` no navegador.

---

## 6. Quais telas e fluxos já podem ser visualizados ou testados no protótipo?

### Telas completas (6 telas principais + subfluxos):

1. **Tela de Login e Cadastro**
   - Login com e-mail e senha
   - Cadastro de novo usuário com seleção de perfil
   - Recuperação de senha

2. **Dashboard (Tela Inicial)**
   - Resumo visual do estoque: total de produtos, valor total, produtos críticos
   - Cards de alerta (produtos em falta, próximos ao vencimento)
   - Acesso rápido às funcionalidades principais
   - Gráfico de produtos mais vendidos

3. **Tela de Listagem de Produtos**
   - Lista completa de produtos com foto, nome, quantidade e status
   - Busca por nome ou código
   - Filtros: categoria, fornecedor, status de estoque (crítico, baixo, normal)
   - Ordenação: alfabética, por quantidade, por valor

4. **Tela de Cadastro/Edição de Produto**
   - Formulário completo: nome, código de barras (com botão para escanear), categoria, preço de custo e venda, estoque mínimo, fornecedor
   - Validação de campos obrigatórios
   - Opção de capturar foto do produto
   - Preenchimento automático ao escanear código de barras (integração com API externa)

5. **Tela de Movimentação de Estoque**
   - Seleção de produto (com busca e scanner)
   - Tipo de movimentação: entrada (compra) ou saída (venda, perda, vencimento)
   - Quantidade, data e observações
   - Confirmação com atualização imediata do estoque

6. **Tela de Relatórios**
   - Visão consolidada: produtos mais vendidos (gráfico), produtos de baixo giro, valor total do estoque
   - Filtros por período (última semana, mês, trimestre, customizado)
   - Histórico de movimentações detalhado
   - Opção de exportar relatório (PDF ou compartilhar)

### Fluxos navegáveis completos:

- **Fluxo de primeiro uso:** Cadastro → Login → Tour guiado pelo Dashboard → Cadastro do primeiro produto
- **Fluxo de venda:** Dashboard → Movimentação → Escanear código de barras → Registrar saída → Confirmação
- **Fluxo de reposição:** Dashboard → Alerta de produto em falta → Listagem de produtos críticos → Registrar entrada → Atualização do estoque
- **Fluxo de consulta:** Dashboard → Produtos → Busca/Filtro → Detalhes do produto → Histórico de movimentações
- **Fluxo de relatório:** Dashboard → Relatórios → Filtrar por período → Visualizar gráfico e ranking → Compartilhar

---

## 7. Registre alguma dificuldade, pendência ou observação importante sobre o desenvolvimento do projeto

### Observações técnicas:

**Arquitetura e tecnologia:**
Conforme o item 1.2 de `docs/duvidas-coordenacao.md`, há divergência entre os documentos normativos quanto à pilha tecnológica. O documento de ADS1253 indica persistência com JDBC e DAO, o que sugere retaguarda em Java (Spring Boot). Estamos adotando essa interpretação para garantir compatibilidade com o conteúdo da disciplina de Programação Orientada a Objetos com Banco de Dados.

**Pilha prevista:**

- **Mobile:** React Native (Expo) — atende ao requisito de plataforma móvel nativa/híbrida
- **Backend:** Spring Boot (Java) com API RESTful
- **Banco de dados:** PostgreSQL (remoto) + SQLite (persistência local para modo offline)
- **Integração externa:** API de consulta de produtos por código de barras (Open Food Facts ou Cosmos API)

**Justificativa técnica:**

- React Native permite desenvolvimento ágil com código compartilhado e empacotamento nativo (APK/AAB)
- Spring Boot + JDBC/DAO atende à exigência de ADS1253 e garante controle fino das transações
- Persistência local (SQLite) viabiliza operação offline, requisito crítico para comércios em áreas com conectividade instável
- Scanner de código de barras exercita recurso nativo (câmera) e agiliza a operação real

**Pendências normativas:**
Aguardamos esclarecimento formal da coordenação sobre:

- Confirmação da pilha tecnológica (item 1.2 de `docs/duvidas-coordenacao.md`)
- Reprogramação oficial das datas de registro de equipe e tema (item 1.5)
- Tamanho mínimo de equipe — norteador tem contradição interna entre "3 a 4" e "não inferior a 4" (item 1.1)

**Distribuição inicial de responsabilidades:**

- **Matheus Oliveira Mitter:** Backend (Spring Boot, API REST, modelagem do banco)
- **Vitor Leal dos Santos:** Frontend móvel (React Native, telas, navegação)
- **Felipe Milhomem Rocha:** Integração (API externa, sincronização, recursos nativos, testes)

**Gestão do projeto:**

- **Backlog:** GitHub Projects (integrado ao repositório)
- **Prototipação:** Figma
- **Versionamento:** Git com estratégia de branches e pull requests revisados

Essa distribuição será refinada ao longo dos ciclos de desenvolvimento e registrada na ficha de acompanhamento (Apêndice B) antes de cada checkpoint.
