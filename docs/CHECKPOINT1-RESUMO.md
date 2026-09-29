# Checkpoint 1 — Resumo dos artefatos

**Projeto:** StockEasy — Controle de Estoque Inteligente
**Equipe:** StockEasy
**Checkpoint 1:** 11/09/2026 — entregue
**Revisão para a N1:** 28/09/2026

---

## O que o Checkpoint 1 exigia

Escopo do projeto, protótipo navegável, backlog priorizado e o diagrama entidade-relacionamento do banco de dados.

| Artefato  | Situação | Onde está                                                                 |
| --------- | -------- | ------------------------------------------------------------------------- |
| Escopo    | Entregue | Consolidado em [`N1-documento-de-projeto.md`](N1-documento-de-projeto.md) |
| Protótipo | Entregue | [`../prototipo/`](../prototipo/) — 11 telas navegáveis                    |
| Backlog   | Entregue | [`checkpoint1-backlog.md`](checkpoint1-backlog.md) — 30 histórias         |
| DER       | Entregue | [`checkpoint1-der-modelagem.md`](checkpoint1-der-modelagem.md)            |

Todos os quatro artefatos foram revisados após o Checkpoint 1. O que mudou está registrado no histórico de revisão de cada documento.

---

## Escopo do projeto

### Problema

Pequenos comerciantes — mercearias, minimercados, padarias, lojas de conveniência — controlam estoque em caderno ou planilha desatualizada, quando controlam. Isso produz perda de venda por ruptura, capital imobilizado em itens de baixo giro e descarte por vencimento.

### Público-alvo

Proprietários e funcionários de estabelecimentos de varejo de pequeno porte, com até cinco colaboradores. Perfil com smartphone Android e familiaridade com aplicativos do dia a dia, mas sem experiência em sistemas de gestão.

As personas detalhadas estão no documento de projeto.

### Funcionalidades da primeira versão

**Produtos.** Cadastro com nome, categoria, preços, estoque mínimo, código de barras, fornecedor e validade. Listagem com busca, filtro e ordenação. Alteração e desativação.

**Movimentação.** Registro de entrada e saída com tipo, quantidade, data e observações, sempre com previsão do saldo resultante antes da confirmação. Histórico completo por produto e por período.

**Alertas.** Classificação automática da situação de estoque em relação ao mínimo definido pelo usuário, com alerta de estoque crítico e de vencimento próximo, e notificação no dispositivo.

**Consultas consolidadas.** Painel com total de produtos, valor do estoque, produtos críticos e próximos ao vencimento. Ranking de mais vendidos, relação de baixo giro e evolução do estoque.

**Fornecedores e categorias.** Cadastro, consulta, alteração e exclusão, com validação de vínculo.

**Acesso.** Cadastro, autenticação e recuperação de senha, com dois perfis de permissão: Proprietário, com acesso completo, e Operador, sem acesso a custo, margem e relatórios financeiros.

**Persistência e integração.** Base local no dispositivo para operação sem conectividade, sincronização com o servidor quando houver conexão, consulta a serviço externo por código de barras e uso da câmera para leitura.

---

## Pilha tecnológica

| Camada             | Tecnologia                         |
| ------------------ | ---------------------------------- |
| Aplicação móvel    | React Native com Expo (TypeScript) |
| Persistência local | SQLite                             |
| Retaguarda         | Spring Boot com API REST           |
| Banco remoto       | PostgreSQL                         |
| Serviço externo    | Open Food Facts                    |
| Recursos nativos   | Câmera e notificações locais       |

A justificativa de cada escolha, com as alternativas avaliadas e descartadas, está em [`N1-arquitetura.md`](N1-arquitetura.md). É o conteúdo do item 2 da N1.

---

## Protótipo navegável

Protótipo HTML/CSS hospedado em GitHub Pages:
https://matheusmitter.github.io/Projeto-Integrador-2026_2/prototipo/

**11 telas:** login, cadastro de conta, recuperação de senha, painel, lista de produtos, cadastro de produto, detalhes do produto, movimentação, relatórios, configurações e fornecedores.

**5 fluxos navegáveis:** primeiro uso, registro de venda, resposta a alerta de falta, consulta de desempenho e manutenção de fornecedores.

Três regras de negócio são verificáveis clicando no protótipo, e não apenas descritas:

| Regra | Como verificar                                                                           |
| ----- | ---------------------------------------------------------------------------------------- |
| RN06  | Em movimentação, informar saída maior que o estoque disponível — o registro é bloqueado  |
| RN07  | Em movimentação, informar saída que deixe o saldo no mínimo — aparece o aviso de crítico |
| RN13  | Em fornecedores, tentar excluir um fornecedor que tem produtos vinculados                |

As decisões de usabilidade e acessibilidade estão justificadas em [`N1-memorial-prototipo.md`](N1-memorial-prototipo.md), que compõe o item 3 da N1.

---

## Modelagem de dados

Sete entidades: `loja`, `usuario`, `categoria`, `fornecedor`, `produto`, `movimentacao` e `alerta`. Normalizada até a terceira forma normal, com uma desnormalização deliberada no saldo resultante da movimentação, justificada no documento.

O script de criação foi executado em PostgreSQL 16 e as regras de negócio foram verificadas na prática. O resultado dos testes está na seção de validação de [`checkpoint1-der-modelagem.md`](checkpoint1-der-modelagem.md).

---

## Backlog

30 histórias de usuário em 10 épicos, cada uma com prioridade, estimativa, ciclo de desenvolvimento, responsável, critérios de aceite e regras de negócio aplicáveis.

| Distribuição por ciclo                 | Histórias |
| -------------------------------------- | --------- |
| Ciclo 1 (14 a 25/09) — escopo da N1    | 8         |
| Ciclo 2 (13 a 23/10)                   | 12        |
| Ciclo 3 (26/10 a 06/11) — Checkpoint 2 | 5         |
| Ciclo 4 (16 a 27/11)                   | 3         |
| Semana 15 (09 a 13/11) — verificação   | 2         |

Os ciclos seguem o cronograma oficial da disciplina, não sprints arbitrárias.

---

## Cobertura dos requisitos obrigatórios

| Req | Requisito                             | Situação              | Onde é verificável                        |
| --- | ------------------------------------- | --------------------- | ----------------------------------------- |
| R1  | Mínimo de 6 telas com navegação       | Especificado          | 11 telas no protótipo                     |
| R2  | Autenticação com 2 perfis             | Especificado          | RF01 a RF06                               |
| R3  | Manutenção completa de 2+ entidades   | Especificado          | Produto, Fornecedor e Categoria           |
| R4  | Mínimo de 3 regras não triviais       | Especificado          | 5 regras, 3 já demonstráveis no protótipo |
| R5  | Persistência local                    | Ciclo 1               | SQLite                                    |
| R6  | Persistência remota com sincronização | Ciclo 3               | Spring Boot e PostgreSQL                  |
| R7  | Serviço externo                       | Ciclo 3               | Open Food Facts                           |
| R8  | Recurso nativo                        | Ciclo 3               | Câmera e notificações                     |
| R9  | Filtro, busca e visão consolidada     | Especificado          | Lista de produtos, painel e relatórios    |
| R10 | Erros e estados de interface          | Especificado          | Critérios de aceite do backlog            |
| R11 | Usabilidade e acessibilidade          | Atendido no protótipo | Memorial do protótipo                     |
| R12 | Organização do código em camadas      | Definido              | Memorial de arquitetura                   |
| R13 | Versionamento                         | Em andamento          | Repositório e README                      |
| R14 | Pacote instalável                     | Ciclo 4               | Até 27/11                                 |

---

## Artefatos da entrega N1

| Item | Descrição                                  | Pontos | Artefato                                                                                                  |
| ---- | ------------------------------------------ | ------ | --------------------------------------------------------------------------------------------------------- |
| 1    | Documento de projeto                       | 2,5    | [`N1-documento-de-projeto.md`](N1-documento-de-projeto.md)                                                |
| 2    | Modelagem e definição arquitetural         | 1,5    | [`checkpoint1-der-modelagem.md`](checkpoint1-der-modelagem.md) e [`N1-arquitetura.md`](N1-arquitetura.md) |
| 3    | Protótipo com justificativa de usabilidade | 2,0    | [`../prototipo/`](../prototipo/) e [`N1-memorial-prototipo.md`](N1-memorial-prototipo.md)                 |
| 4    | Aplicação parcial em execução              | 2,0    | Repositório e demonstração                                                                                |
| 5    | Gestão do projeto                          | 1,0    | [`checkpoint1-backlog.md`](checkpoint1-backlog.md) e [`N1-gestao-projeto.md`](N1-gestao-projeto.md)       |
| 6    | Apresentação e defesa técnica              | 1,0    | [`N1-roteiro-apresentacao.md`](N1-roteiro-apresentacao.md)                                                |

---

## Próximos marcos

| Marco                     | Data               |
| ------------------------- | ------------------ |
| Entrega e apresentação N1 | 29/09 a 02/10/2026 |
| Checkpoint 2              | 06/11/2026         |
| Testes com usuários       | 09 a 13/11/2026    |
| Congelamento de escopo    | 27/11/2026         |
| Documentação final        | 04/12/2026         |
| Entrega e apresentação N2 | 07 a 11/12/2026    |
