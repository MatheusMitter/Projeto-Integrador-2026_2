# ✅ CHECKPOINT 1 — RESUMO EXECUTIVO

**Data:** 11/09/2026  
**Equipe:** StockEasy Team  
**Projeto:** StockEasy — Controle de Estoque Inteligente

---

## 🎯 STATUS GERAL

| Artefato      | Status                                           | Arquivo                                  |
| ------------- | ------------------------------------------------ | ---------------------------------------- |
| **Escopo**    | ✅ Concluído                                     | `checkpoint1-respostas-formulario.md`    |
| **Protótipo** | ⚠️ Especificação completa → Implementar no Figma | `checkpoint1-prototipo-especificacao.md` |
| **Backlog**   | ✅ Concluído → Criar GitHub Projects             | `checkpoint1-backlog.md`                 |
| **DER**       | ✅ Concluído                                     | `checkpoint1-der-modelagem.md`           |

---

## 📋 FORMULÁRIO — RESPOSTAS PRONTAS

### 1. Integrantes do grupo

```
Matheus Oliveira Mitter - 2025.1.0120.0128-3
Vitor Leal dos Santos - 2025.1.0120.0071-6
Felipe Milhomem Rocha - 2025.1.0120.0024-4
```

### 2. Nome do projeto

```
StockEasy — Controle de Estoque Inteligente
```

### 3. Sobre o projeto

```
O StockEasy é um aplicativo móvel que resolve o problema de falta de controle efetivo
de estoque em pequenos comércios, uma das principais causas de perdas financeiras,
rupturas de produtos e desperdício por vencimento.

Problema: Pequenos comerciantes (mercearias, lojas de conveniência, minimercados,
farmácias) geralmente controlam estoque de forma manual (cadernos, planilhas
desatualizadas) ou não controlam, resultando em perda de vendas por falta de produtos,
compras desnecessárias e dificuldade em identificar produtos de baixo giro.

Público-alvo: Proprietários de pequenos comércios (mercearias, padarias, minimercados),
gerentes de lojas de conveniência, empreendedores iniciantes no varejo, comerciantes
que atuam sozinhos ou com equipes pequenas (até 5 funcionários).
```

### 4. Escopo da primeira versão

```
Funcionalidades principais previstas:

GESTÃO DE PRODUTOS
- Cadastro completo de produtos (nome, código de barras, categoria, preço de custo e
  venda, estoque mínimo, fornecedor)
- Busca e filtros por categoria, fornecedor ou status de estoque
- Edição e exclusão de produtos com validação

CONTROLE DE ESTOQUE
- Registro de entrada de mercadorias (compra de fornecedor)
- Registro de saída (venda, perda, vencimento, devolução)
- Visualização do estoque atual com indicadores visuais
- Histórico de movimentações por produto

ALERTAS E NOTIFICAÇÕES
- Alertas automáticos de produtos abaixo do estoque mínimo
- Notificações de produtos próximos ao vencimento
- Lembretes de reposição baseados no histórico de vendas

RELATÓRIOS E VISÕES CONSOLIDADAS
- Produtos mais vendidos (ranking)
- Produtos com baixo giro
- Valor total do estoque
- Gráfico de evolução do estoque por período
- Resumo financeiro

GESTÃO DE FORNECEDORES
- Cadastro de fornecedores (nome, contato, produtos fornecidos)
- Consulta de produtos por fornecedor
- Histórico de compras por fornecedor

AUTENTICAÇÃO E PERFIS DE USUÁRIO
- Cadastro e login seguro
- Perfil Proprietário: acesso completo
- Perfil Operador: acesso limitado (sem relatórios financeiros)
- Recuperação de senha

RECURSOS NATIVOS E INTEGRAÇÃO
- Leitura de código de barras via câmera
- Sincronização com servidor remoto
- Funcionalidade offline com sincronização posterior
- Integração com API de consulta de produtos por código de barras
```

### 5. Link do protótipo navegável

```
https://matheusmitter.github.io/Projeto-Integrador-2026_2/prototipo/

Protótipo HTML/CSS totalmente navegável hospedado no GitHub Pages.
Botões clicáveis, navegação real entre telas, 8 telas completas + 4 fluxos demonstráveis.
```

### 6. Telas e fluxos visualizáveis no protótipo

```
TELAS COMPLETAS (8 telas):
1. Login e Cadastro — Login, cadastro de novo usuário, recuperação de senha
2. Dashboard — Resumo visual do estoque, cards de alerta, gráfico de produtos mais vendidos
3. Listagem de Produtos — Lista com busca, filtros, ordenação
4. Cadastro/Edição de Produto — Formulário completo com scanner de código de barras
5. Movimentação de Estoque — Registro de entrada e saída
6. Relatórios — Produtos mais vendidos, baixo giro, valor total, histórico
7. Detalhes do Produto — Informações completas e histórico de movimentações
8. Configurações — Perfil do usuário e configurações do app


FLUXOS NAVEGÁVEIS COMPLETOS:
- Fluxo de primeiro uso: Cadastro → Login → Dashboard → Cadastro do primeiro produto
- Fluxo de venda: Dashboard → Movimentação → Escanear código → Registrar saída
- Fluxo de reposição: Dashboard → Alerta → Produtos críticos → Registrar entrada
- Fluxo de consulta: Dashboard → Produtos → Busca/Filtro → Detalhes → Histórico
- Fluxo de relatório: Dashboard → Relatórios → Filtrar → Visualizar → Compartilhar
```

### 7. Dificuldades, pendências ou observações

```
OBSERVAÇÕES TÉCNICAS:

Arquitetura e tecnologia:
Conforme o item 1.2 de docs/duvidas-coordenacao.md, há divergência entre os documentos
normativos quanto à pilha tecnológica. O documento de ADS1253 indica persistência com
JDBC e DAO, o que sugere retaguarda em Java (Spring Boot). Estamos adotando essa
interpretação para garantir compatibilidade com o conteúdo da disciplina.

Pilha prevista:
- Mobile: React Native (Expo) — atende ao requisito de plataforma móvel nativa/híbrida
- Backend: Spring Boot (Java) com API RESTful
- Banco de dados: PostgreSQL (remoto) + SQLite (local para modo offline)
- Integração externa: API de consulta de produtos por código de barras

Justificativa técnica:
- React Native permite desenvolvimento ágil com código compartilhado
- Spring Boot + JDBC/DAO atende à exigência de ADS1253
- Persistência local viabiliza operação offline
- Scanner de código de barras exercita recurso nativo (câmera)

Pendências normativas:
Aguardamos esclarecimento formal da coordenação sobre:
- Confirmação da pilha tecnológica (item 1.2 de docs/duvidas-coordenacao.md)
- Reprogramação oficial das datas de registro de equipe e tema (item 1.5)
- Tamanho mínimo de equipe (item 1.1)

Distribuição inicial de responsabilidades:
- Matheus Oliveira Mitter: Backend (Spring Boot, API REST, modelagem do banco)
- Vitor Leal dos Santos: Frontend móvel (React Native, telas, navegação)
- Felipe Milhomem Rocha: Integração (API externa, sincronização, recursos nativos, testes)

Gestão do projeto:
- Backlog: GitHub Projects (integrado ao repositório)
- Prototipação: Figma
- Versionamento: Git com estratégia de branches e pull requests revisados
```

---

## 📦 ARTEFATOS PRODUZIDOS

### 1. Respostas do Formulário

**Arquivo:** `checkpoint1-respostas-formulario.md`  
**Conteúdo:** As 7 respostas do formulário prontas para copiar e colar

### 2. Especificação do Protótipo

**Arquivo:** `checkpoint1-prototipo-especificacao.md`  
**Conteúdo:**

- 9 telas detalhadas (layout, elementos, comportamentos, estados)
- 4 fluxos navegáveis completos
- Design system básico (cores, tipografia, componentes)
- Checklist de validação

**Próximo passo:** Implementar no Figma seguindo a especificação

### 3. Backlog Priorizado

**Arquivo:** `checkpoint1-backlog.md`  
**Conteúdo:**

- 29 histórias de usuário (US01-US29)
- 10 épicos organizados
- Prioridades, estimativas, critérios de aceite, dependências
- Mapeamento para R1-R14
- Distribuição de responsabilidades

**Próximo passo:** Criar GitHub Projects e popular com as histórias como issues

### 4. Modelagem de Dados

**Arquivo:** `checkpoint1-der-modelagem.md`  
**Conteúdo:**

- DER completo com 5 entidades
- Scripts SQL prontos para executar (PostgreSQL)
- Estratégia de sincronização (SQLite ↔ PostgreSQL)
- Consultas importantes documentadas
- 9 regras de negócio implementadas

---

## ✅ CHECKLIST FINAL

### Antes de submeter o formulário:

- [ ] Implementar protótipo no Figma seguindo `checkpoint1-prototipo-especificacao.md`
- [ ] Configurar permissão do Figma: "Anyone with the link can view"
- [ ] Testar o link do Figma em navegador anônimo
- [ ] Colar o link do Figma na resposta 5
- [ ] Criar projeto no GitHub Projects
- [ ] Popular o GitHub Projects com as 29 histórias como issues
- [ ] Configurar permissão do GitHub Projects como público
- [ ] Copiar as respostas de `checkpoint1-respostas-formulario.md`
- [ ] Preencher o formulário
- [ ] Revisar todas as 7 respostas
- [ ] Submeter antes de 23h59 de 11/09/2026

### Opcional (mas recomendado):

- [ ] Gerar PDF do DER usando ferramenta de modelagem (ex: draw.io, dbdiagram.io)
- [ ] Criar README.md no repositório com instruções básicas
- [ ] Fazer commit dos arquivos de documentação
- [ ] Compartilhar o link do repositório com o docente

---

## 📊 COBERTURA DOS REQUISITOS

### Requisitos obrigatórios (R1-R14) já cobertos:

| Req | Descrição                    | Cobertura no Checkpoint 1                              |
| --- | ---------------------------- | ------------------------------------------------------ |
| R1  | 6+ telas                     | ✅ 9 telas especificadas no protótipo                  |
| R2  | Autenticação e perfis        | ✅ US01-US04 + telas de login no protótipo             |
| R3  | CRUD em 2+ entidades         | ✅ Produtos e Fornecedores no backlog + DER            |
| R4  | 3+ regras de negócio         | ✅ 9 regras (RN01-RN09) documentadas                   |
| R5  | Persistência local           | ✅ SQLite no DER + US24 no backlog                     |
| R6  | Persistência remota          | ✅ PostgreSQL no DER + US25 no backlog                 |
| R7  | API externa                  | ✅ US23 (API de produtos) no backlog                   |
| R8  | Recurso nativo               | ✅ US21 (câmera/scanner) + US22 (notificações)         |
| R9  | Filtro + visão consolidada   | ✅ US06 (filtros) + US17-US18 (dashboard e ranking)    |
| R10 | Erros e estados              | ✅ Especificado em todas as telas do protótipo         |
| R11 | Usabilidade e acessibilidade | ✅ Design system no protótipo + US29 (testes)          |
| R12 | Organização do código        | ⏳ Será implementado (arquitetura em camadas definida) |
| R13 | Versionamento                | ✅ Repositório Git criado e público                    |
| R14 | Distribuição (APK)           | ⏳ Sprint final antes da N2                            |

**10 de 14 requisitos já cobertos na especificação do Checkpoint 1.**

---

## 🎯 PRÓXIMOS PASSOS (pós-Checkpoint 1)

### Semana 1 (pós-11/09):

1. Criar GitHub Projects
2. Popular com as 29 histórias como issues
3. Definir sprint 1 (histórias de prioridade ALTA para a N1)
4. Iniciar desenvolvimento: US01, US02 (Autenticação)

### Semana 2-3:

5. US05, US06, US07 (Produtos: cadastro, listagem, detalhes)
6. US10 ou US11 (Movimentação básica)
7. US24 (Persistência local)

### Até 28-29/09 (N1):

8. Aplicação parcial em execução (item 4 da N1 = 2,0 pontos)
9. Revisar documento de projeto (item 1 da N1 = 2,5 pontos)
10. Preparar apresentação (item 6 da N1 = 1,0 ponto)

---

## 💡 DICAS IMPORTANTES

1. **Protótipo no Figma:** Usar a especificação completa em `checkpoint1-prototipo-especificacao.md`. Não precisa ser pixel-perfect, mas precisa ser navegável e cobrir os 4 fluxos.

2. **GitHub Projects:** Criar um projeto "board" (não "table") para facilitar a visualização de colunas Backlog → To Do → In Progress → Done.

3. **Commits regulares:** A partir de agora, todo código precisa ser versionado com mensagens descritivas. O histórico de commits alimenta o FPI.

4. **DER:** Os scripts SQL estão prontos para executar. Testar localmente antes da N1.

5. **Distribuição de trabalho:** A sugestão no backlog é um ponto de partida. Ajustar conforme habilidades e preferências da equipe.

---

**Equipe StockEasy**  
Matheus Oliveira Mitter · Vitor Leal dos Santos · Felipe Milhomem Rocha  
PUC Goiás — ADS 2026/2 — Projeto Integrador
