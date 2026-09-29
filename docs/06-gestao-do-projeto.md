# Gestão do Projeto — StockEasy

**Projeto Integrador · ADS 2026/2 · PUC Goiás**
**Equipe:** StockEasy · **Entrega:** N1 — 29/09 a 02/10/2026
**Versão:** 1.0 — 28/09/2026

Atende ao item 5 da composição da N1: backlog priorizado, distribuição de responsabilidades e regularidade do histórico de versionamento.

---

## 1. Identificação

| Campo                   | Preenchimento                                                                     |
| ----------------------- | --------------------------------------------------------------------------------- |
| Nome da equipe          | StockEasy                                                                         |
| Domínio do problema     | Gestão e produtividade — controle de estoque e inventário para pequenos comércios |
| Pilha adotada           | React Native com Expo · SQLite · Spring Boot · PostgreSQL · Open Food Facts       |
| Endereço do repositório | https://github.com/MatheusMitter/Projeto-Integrador-2026_2                        |
| Ciclo de referência     | Ciclo 1 — semanas 7 e 8, de 14 a 25/09/2026                                       |

---

## 2. Integrantes e atribuições

| Integrante              | Matrícula          | Frente técnica                                                                               |
| ----------------------- | ------------------ | -------------------------------------------------------------------------------------------- |
| Matheus Oliveira Mitter | 2025.1.0120.0128-3 | Retaguarda e dados: modelagem, migrações, DAO com JDBC, API REST, autenticação e autorização |
| Vitor Leal dos Santos   | 2025.1.0120.0071-6 | Aplicação móvel: telas, navegação, componentes, formulários e validações                     |
| Felipe Milhomem Rocha   | 2025.1.0120.0024-4 | Integração: persistência local, sincronização, serviço externo, recursos nativos e testes    |

As frentes são interdependentes por desenho. A modelagem e a API sustentam as telas; a camada de persistência local sustenta a operação offline de todas elas. Nenhuma frente entrega valor isolada.

---

## 3. Ciclos de desenvolvimento

O planejamento segue os quatro ciclos da Seção 6 e o detalhamento semanal da Seção 7.2 do documento norteador.

| Ciclo   | Semanas | Período            | Objetivo                                                                                                   | Marco        |
| ------- | ------- | ------------------ | ---------------------------------------------------------------------------------------------------------- | ------------ |
| Ciclo 1 | 7 e 8   | 14 a 25/09/2026    | Estrutura em camadas, navegação, autenticação e primeiro módulo funcional integrado à persistência local   | Entrega N1   |
| Ciclo 2 | 11 e 12 | 13 a 23/10/2026    | Manutenção completa das entidades, validações, regras de negócio, listagens com filtro e visão consolidada | —            |
| Ciclo 3 | 13 e 14 | 26/10 a 06/11/2026 | Retaguarda, sincronização, serviço externo e recursos nativos                                              | Checkpoint 2 |
| —       | 15      | 09 a 13/11/2026    | Testes funcionais e sessões de usabilidade                                                                 | —            |
| Ciclo 4 | 16 e 17 | 16 a 27/11/2026    | Correção de defeitos, acessibilidade, pacote instalável                                                    | Congelamento |

---

## 4. Planejamento do Ciclo 1

Escopo definido pelo item 4 da N1: navegação estruturada, autenticação e ao menos um módulo funcional integrado à persistência.

| História | Descrição                       | Responsável | Estimativa |
| -------- | ------------------------------- | ----------- | ---------- |
| US01     | Cadastro de usuário             | Vitor       | M          |
| US02     | Login no sistema                | Vitor       | P          |
| US05     | Cadastrar produto               | Vitor       | G          |
| US06     | Listar produtos com busca       | Vitor       | M          |
| US07     | Visualizar detalhes do produto  | Vitor       | M          |
| US10     | Registrar entrada de mercadoria | Felipe      | G          |
| US11     | Registrar saída de mercadoria   | Felipe      | G          |
| US24     | Persistência local              | Felipe      | G          |

A estrutura de navegação que conecta essas telas e a organização do projeto em camadas são trabalho transversal, não atribuído a uma história isolada.

A modelagem de dados que sustenta o ciclo foi concluída e validada em PostgreSQL, com registro em [`02-modelagem-de-dados.md`](02-modelagem-de-dados.md).

### Por que a persistência local está no Ciclo 1

O planejamento anterior colocava a persistência local no terceiro ciclo. A Semana 8 do cronograma oficial exige "conclusão do primeiro módulo funcional integrado à persistência local", e o item 4 da N1 repete a exigência. Sem persistência local no Ciclo 1, o item 4 não fecha. A história foi remanejada.

---

## 5. Política de versionamento

Conforme a Seção 6.2 do documento norteador.

| Prática                 | Definição                                                                                 |
| ----------------------- | ----------------------------------------------------------------------------------------- |
| Ramo principal          | `main`, protegido, sem envio direto                                                       |
| Ramos de funcionalidade | `feat/<escopo>`, `fix/<escopo>`, `docs/<escopo>`                                          |
| Integração              | Por requisição de incorporação, revisada por outro integrante                             |
| Mensagem de commit      | Descreve a alteração realizada; mensagens genéricas como "ajustes" não são aceitas        |
| Frequência              | Commits ao longo do desenvolvimento, não concentrados perto das entregas                  |
| Autoria                 | Cada integrante versiona o próprio trabalho, com commits em seu nome                      |
| Credenciais             | Não versionadas; variáveis de ambiente lidas de `.env`, com `.env.example` no repositório |

### Convenção de mensagem

```
<tipo>(<escopo>): <o que mudou>

feat(produto): adiciona validacao de estoque minimo no cadastro
fix(movimentacao): corrige calculo de saldo em saida parcial
docs(arquitetura): registra decisao sobre persistencia local
```

Tipos em uso: `feat`, `fix`, `docs`, `refactor`, `test`, `chore`.

---

## 6. Quadro de tarefas

O backlog é mantido em GitHub Projects, acessível ao docente, no formato de quadro com as colunas Backlog, A fazer, Em andamento, Em revisão e Concluído.

Cada história do backlog corresponde a uma issue, com responsável, ciclo e critérios de aceite transcritos. O backlog completo está em [`05-backlog.md`](05-backlog.md).

| Indicador                        | Valor                                      |
| -------------------------------- | ------------------------------------------ |
| Histórias                        | 30, em 10 épicos                           |
| Prioridade ALTA                  | 17                                         |
| Prioridade MÉDIA                 | 10                                         |
| Prioridade BAIXA                 | 3                                          |
| Histórias no Ciclo 1             | 8                                          |
| Requisitos obrigatórios cobertos | 14 de 14, com ciclo de fechamento definido |

---

## 7. Registro do Ciclo 1

Registro conforme a Seção 6.1: o que foi concluído, o que foi replanejado e quais impedimentos foram identificados.

### Concluído no ciclo

| Entrega                | Situação                                                                                           |
| ---------------------- | -------------------------------------------------------------------------------------------------- |
| Documento de projeto   | Concluído — contexto, personas, 43 requisitos funcionais, 15 não funcionais e 13 regras de negócio |
| Modelagem de dados     | Concluída e validada em PostgreSQL 16, com as regras verificadas na prática                        |
| Definição arquitetural | Concluída — camadas, fluxo de dados, pilha justificada e 7 decisões registradas                    |
| Protótipo navegável    | Concluído — 11 telas, conformidade estrutural de acessibilidade verificada                         |
| Backlog priorizado     | Concluído — 30 histórias com ciclo, responsável e critérios de aceite                              |
| Aplicação parcial      | Em implementação                                                                                   |

### Replanejado no ciclo

| Item                                          | De                       | Para               | Motivo                                                                                                   |
| --------------------------------------------- | ------------------------ | ------------------ | -------------------------------------------------------------------------------------------------------- |
| Persistência local (US24)                     | Terceiro ciclo           | Ciclo 1            | Exigida pela Semana 8 e pelo item 4 da N1                                                                |
| Listar e editar fornecedores (US16)           | Prioridade BAIXA         | Prioridade ALTA    | O requisito R3 exige manutenção completa sobre duas entidades; sem ela, Fornecedor teria apenas cadastro |
| Leitura de código de barras nas movimentações | Pré-requisito do Ciclo 1 | Ciclo 3            | Dependia de recurso nativo previsto para o Ciclo 3; no Ciclo 1 o produto é selecionado por busca textual |
| Manutenção de categorias (US30)               | Inexistente              | Ciclo 2            | A categoria passou a ser entidade no modelo e não havia história cobrindo sua manutenção                 |
| Política de exclusão de registros             | Indefinida               | Desativação (RN12) | O backlog descrevia três comportamentos incompatíveis para a mesma operação                              |

### Impedimentos identificados

| Impedimento                                                                 | Encaminhamento                                                                                                      |
| --------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| Inconsistências entre backlog, modelagem e protótipo, detectadas na revisão | Corrigidas e registradas em [`99-historico-de-revisao.md`](99-historico-de-revisao.md)                                    |
| Paleta do protótipo reprovava no contraste exigido pelo R11                 | Paleta substituída e verificada; registro em [`04-prototipo.md`](04-prototipo.md)                 |
| Erros no script de banco que impediriam a execução em outros ambientes      | Corrigidos e validados por execução real em PostgreSQL                                                              |
| Implementação da aplicação parcial concentrada no fim do ciclo              | Escopo reduzido ao mínimo verificável do item 4, com retaguarda adiada para o Ciclo 3 conforme o cronograma oficial |

---

## 8. Planejamento dos ciclos seguintes

### Ciclo 2 — 13 a 23/10

| Frente       | Histórias        | Responsável     |
| ------------ | ---------------- | --------------- |
| Produtos     | US08, US09       | Vitor           |
| Fornecedores | US15, US16       | Vitor           |
| Categorias   | US30             | Vitor           |
| Acesso       | US03, US04       | Vitor e Matheus |
| Alertas      | US13             | Matheus         |
| Consultas    | US17, US18, US19 | Matheus         |
| Histórico    | US12             | Felipe          |

Fecha os requisitos R2, R3, R4 e R9.

### Ciclo 3 — 26/10 a 06/11

| Frente               | Histórias      | Responsável |
| -------------------- | -------------- | ----------- |
| Retaguarda e API     | Base para US25 | Matheus     |
| Alerta de vencimento | US14           | Matheus     |
| Sincronização        | US25           | Felipe      |
| Serviço externo      | US23           | Felipe      |
| Recursos nativos     | US21, US22     | Felipe      |

Fecha os requisitos R6, R7 e R8. É o escopo do Checkpoint 2, em 06/11.

### Semana 15 — 09 a 13/11

Execução do roteiro de testes funcionais (US28) e das sessões de usabilidade com usuários do perfil-alvo (US29), sob responsabilidade de Felipe, com registro e classificação de defeitos.

### Ciclo 4 — 16 a 27/11

Correção dos defeitos priorizados, refinamento de acessibilidade e tratamento de erros, geração do pacote instalável e teste de instalação em dispositivo físico. Fecha R10, R11 e R14. Congelamento de escopo em 27/11.

---

## 9. Reuniões e comunicação

| Item                 | Definição                                                               |
| -------------------- | ----------------------------------------------------------------------- |
| Reunião de ciclo     | Semanal, para revisar o andamento e redistribuir o que estiver parado   |
| Canal de comunicação | Grupo de mensagens da equipe, para o dia a dia                          |
| Registro de decisão  | Decisões técnicas relevantes são registradas no memorial de arquitetura |
| Registro de ciclo    | Esta seção é atualizada ao término de cada ciclo                        |

---

## 10. Rastreabilidade da gestão

| Exigência da Seção 6.1                                             | Onde é atendida                                                      |
| ------------------------------------------------------------------ | -------------------------------------------------------------------- |
| Backlog em ferramenta de gestão, em formato de história de usuário | GitHub Projects e [`05-backlog.md`](05-backlog.md) |
| Itens priorizados e atribuídos a responsáveis                      | 30 histórias, todas com prioridade e responsável                     |
| Registro do concluído, replanejado e impedimentos por ciclo        | Seção 7 deste documento                                              |
| Quadro e repositório acessíveis ao docente                         | Repositório público                                                  |
| Estimativas de esforço                                             | Legenda e estimativa por história no backlog                         |

---

## Controle de versões

| Versão | Data       | Alterações                                | Responsável      |
| ------ | ---------- | ----------------------------------------- | ---------------- |
| 1.0    | 28/09/2026 | Versão inicial, com o registro do Ciclo 1 | Equipe StockEasy |
