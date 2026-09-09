# Cronograma e entregas — Projeto Integrador ADS 2026/2

Consolidação dos marcos previstos nos dois documentos normativos, com o que é exigido
em cada um.

**Fontes:** *Documento Norteador — Projeto Integrador ADS 2026/2*, versão 2.0 (Seções
7, 8, 9 e Apêndices A a D) · *ADS1253 — Projeto Integrador do Módulo*, Prof. Welington
Júlio (Etapas 1 a 9).

Onde as datas divergem, está indicado. A interpretação adotada é a data mais cedo,
conforme o item 3.1 de [`duvidas-coordenacao.md`](duvidas-coordenacao.md).

---

## Visão geral

| # | Marco | Data | Pontuação |
| --- | --- | --- | --- |
| 1 | Divulgação do documento norteador | 03/08/2026 | — |
| 2 | Registro das equipes | 14/08/2026 | — |
| 3 | Submissão da proposta de tema | 21/08/2026 | — |
| 4 | **Checkpoint 1** | **11/09/2026** | sem pontuação própria |
| 5 | **Entrega e apresentação da N1** | **28/09 a 02/10/2026** <br>(ADS1253: 29/09) | **10,0** |
| 6 | Avaliação Interdisciplinar | 03/11/2026 | 1,0 na N2 — fora do projeto |
| 7 | **Checkpoint 2** | **06/11/2026** | sem pontuação própria |
| 8 | Testes com usuários | 09 a 13/11/2026 <br>(ADS1253: 10/11) | avaliado na N2 |
| 9 | Congelamento de escopo | 27/11/2026 | — |
| 10 | Entrega da documentação final | 04/12/2026 | avaliado na N2 |
| 11 | **Entrega e apresentação da N2** | **07 a 11/12/2026** <br>(ADS1253: 08/12) | **10,0** |
| 12 | Divulgação de resultados | 14 a 18/12/2026 | — |

Os checkpoints não somam pontos, mas a Seção 8.4 lista o desempenho neles entre os
critérios do Fator de Participação Individual, que multiplica a nota de cada
integrante por um fator de 0,00 a 1,00.

---

## 2 · Registro das equipes — 14/08/2026

**O que se pede**

- Composição da equipe, em formulário próprio junto ao docente responsável
- Indicação do coordenador, responsável pela interlocução com o docente
- Indicação do responsável técnico pelo repositório de código
- Atribuição técnica identificável para cada integrante, comprovável pelo histórico
  de contribuições

**Condições**

- 3 a 4 discentes. A Seção 3.2 apresenta contradição interna quanto ao piso — ver
  item 1.1 de [`duvidas-coordenacao.md`](duvidas-coordenacao.md)
- Número inferior ao piso exige autorização expressa da coordenação mediante
  justificativa formal
- Alteração de composição após a Semana 4 somente em situação excepcional,
  formalmente justificada

**Situação:** prazo vencido. Reprogramação tratada no item 1.3 do documento de dúvidas.

---

## 3 · Submissão da proposta de tema — 21/08/2026

**O que se pede**

- Delimitação do domínio do problema, submetida ao docente para validação formal

**Condições que o domínio precisa satisfazer** (Seção 3.3)

- Problema delimitado com clareza, com usuários identificáveis, regras de negócio
  explícitas e um fluxo principal de uso que justifique a existência da aplicação
- No mínimo duas entidades principais relacionadas entre si e sujeitas a regras de
  validação

**O que não é aceito**

- Soluções que se reduzam a listagens estáticas, calculadoras simples, agregadores de
  conteúdo sem tratamento de dados ou aplicações de exibição sem interação relevante
- Reprodução de tutoriais, cursos, repositórios públicos ou projetos de semestres
  anteriores, próprios ou de terceiros

**Atenção:** o desenvolvimento só pode começar após a validação formal do tema.

**Situação:** prazo vencido. Ver item 1.3 do documento de dúvidas.

---

## 4 · Checkpoint 1 — 11/09/2026

**O que se pede**

| Artefato | Origem | Conteúdo mínimo |
| --- | --- | --- |
| Escopo do projeto | ambos | Contexto, justificativa, público-alvo, personas, requisitos funcionais e não funcionais priorizados, regras de negócio |
| Protótipo navegável | ambos | Fluxo de telas navegável. Não exige código — Figma atende, conforme orientação de ADS1253 |
| Backlog priorizado | ambos | Em ferramenta de gestão de tarefas, itens em formato de história de usuário ou requisito funcional, priorizados e atribuídos a responsáveis |
| DER do banco de dados | ADS1253 | Modelagem relacional com normalização e integridade |

**Formato**

- O norteador o descreve como "verificação" na Seção 7.1 e como "apresentação do
  protótipo navegável" na Semana 6
- ADS1253 prevê 2 horas de acompanhamento dedicadas
- Há dúvida sobre a existência de submissão no ambiente virtual — ver item 2.2 do
  documento de dúvidas

**Não é exigido nesta data:** código em execução, autenticação implementada, aplicação
parcial, pacote instalável.

**Também previsto até aqui pelo cronograma semanal**

- Semana 5 (31/08 a 04/09): modelagem de dados, definição arquitetural, escolha e
  justificativa da pilha tecnológica, configuração do repositório e do ambiente
- Seção 6.2: repositório criado até a Semana 5

---

## 5 · Entrega e apresentação da N1 — 28/09 a 02/10/2026

**Total: 10,0 pontos, distribuídos em seis itens obrigatórios.**

| Item | Descrição | Pontos | Artefato exigido |
| --- | --- | --- | --- |
| 1 | Documento de projeto: contexto, justificativa, objetivos, público-alvo, personas, requisitos funcionais e não funcionais priorizados e regras de negócio | 2,5 | Documento em PDF |
| 2 | Modelagem de dados e definição arquitetural, com justificativa da pilha tecnológica | 1,5 | Diagramas e memorial técnico |
| 3 | Protótipo navegável das interfaces, com justificativa das decisões de usabilidade e acessibilidade | 2,0 | Protótipo e memorial descritivo |
| 4 | Aplicação parcial em execução: navegação estruturada, autenticação e ao menos um módulo funcional integrado à persistência | 2,0 | Repositório Git e demonstração |
| 5 | Gestão do projeto: backlog priorizado, distribuição de responsabilidades e regularidade do histórico de versionamento | 1,0 | Quadro de tarefas e repositório |
| 6 | Apresentação e defesa técnica, com participação de todos os integrantes e domínio demonstrado das decisões | 1,0 | Apresentação presencial |

### Estrutura do documento de projeto (Apêndice A.1)

1. Capa e identificação da equipe, com a atribuição técnica de cada integrante
2. Contexto e caracterização do domínio do problema
3. Descrição do problema e justificativa da solução proposta
4. Objetivo geral e objetivos específicos da aplicação
5. Público-alvo e personas
6. Requisitos funcionais e não funcionais, identificados e priorizados
7. Regras de negócio, com identificação e descrição do comportamento esperado
8. Modelagem de dados e diagramas pertinentes ao projeto
9. Definição arquitetural e justificativa da pilha tecnológica adotada
10. Cronograma interno da equipe, com distribuição de responsabilidades por ciclo
11. Referências utilizadas

### Diferença em relação ao Checkpoint 1

Três dos artefatos de 11/09 retornam aqui já pontuados: o escopo compõe o item 1, o
protótipo compõe o item 3 e o backlog compõe o item 5. O que a N1 acrescenta é a capa
com atribuição técnica, a modelagem e a arquitetura como item pontuado, o cronograma
interno, as referências, o memorial de usabilidade e acessibilidade, a **aplicação
parcial em execução** e a apresentação presencial.

---

## 6 · Avaliação Interdisciplinar — 03/11/2026

Avaliação institucional que vale 1,0 ponto na N2 da disciplina. Não integra o Projeto
Integrador e consta apenas do documento de ADS1253. Registrada aqui para não ser
confundida com um marco do projeto.

---

## 7 · Checkpoint 2 — 06/11/2026

**O que se pede**

- Demonstração de uma versão beta funcional
- Persistência local e remota operando, com sincronização de dados
- Integração com pelo menos um serviço ou interface de programação externa
- Verificação de aderência aos requisitos

Segundo ADS1253, o salto em relação à N1 é que a arquitetura já precisa estar em
execução, com dados sendo gravados e sincronizados, e não apenas definida.

**Também previsto na Semana 14:** integração de recurso nativo do dispositivo.

---

## 8 · Testes com usuários — 09 a 13/11/2026

**O que se pede** (Seção 6.3)

- Roteiro de testes funcionais cobrindo os fluxos principais, com resultado esperado e
  resultado obtido registrados para cada caso
- Sessões de teste de usabilidade com **no mínimo 5 usuários externos à equipe**,
  pertencentes ao perfil definido para a aplicação
- Defeitos registrados com classificação de severidade e acompanhados até a resolução
  ou a justificativa formal de não correção

O produto desta etapa é avaliado na N2, item 3, valendo 1,5 ponto.

**Atenção:** o mínimo de 5 usuários externos consta apenas do norteador. É um dos
itens mais frequentemente omitidos, e depende de agendamento com pessoas de fora da
equipe.

---

## 9 · Congelamento de escopo — 27/11/2026

- Encerramento do desenvolvimento de novas funcionalidades
- Semana 17 prevê também a geração do pacote instalável e os testes de instalação em
  dispositivo físico

Depois desta data, apenas correção de defeitos, refinamento de interface,
acessibilidade e tratamento de erros, conforme a Semana 16.

---

## 10 · Entrega da documentação final — 04/12/2026

**O que se pede**

- Relatório técnico final
- Pacote instalável
- Repositório consolidado

### Estrutura do relatório técnico final (Apêndice A.2)

1. Atualização consolidada dos itens do documento de projeto, com registro das
   alterações de escopo ocorridas
2. Descrição das funcionalidades implementadas, com mapeamento explícito para os
   requisitos R1 a R14
3. Registro das telas da aplicação, com descrição dos fluxos principais
4. Descrição da arquitetura implementada e das decisões técnicas relevantes
5. Relatório de testes: roteiro executado, resultados obtidos, defeitos registrados e
   correções realizadas
6. Síntese das sessões de usabilidade e dos ajustes decorrentes
7. Limitações identificadas e proposições de evolução da solução
8. **Declaração de uso de ferramentas de inteligência artificial**, quando aplicável,
   com indicação das finalidades
9. Instruções de instalação, execução e administração da aplicação, com credenciais de
   teste por perfil

---

## 11 · Entrega e apresentação da N2 — 07 a 11/12/2026

**Total: 10,0 pontos, distribuídos em cinco itens obrigatórios.**

| Item | Descrição | Pontos | Artefato exigido |
| --- | --- | --- | --- |
| 1 | Aplicação móvel concluída, atendendo aos requisitos R1 a R14, com execução comprovada em dispositivo físico | 3,5 | Pacote instalável e demonstração |
| 2 | Qualidade técnica: organização em camadas, tratamento de erros, validações, consistência de nomenclatura e ausência de credenciais em código | 2,0 | Repositório Git |
| 3 | Verificação e testes: roteiro funcional executado, sessões de usabilidade realizadas e registro das correções decorrentes | 1,5 | Relatório de testes |
| 4 | Relatório técnico final e documentação do repositório, com instruções de instalação, execução e administração | 1,5 | Relatório em PDF e README |
| 5 | Apresentação final na mostra de projetos, com demonstração e arguição individual pela banca | 1,5 | Apresentação presencial |

**Anexos obrigatórios**

- Pacote APK ou AAB, com instruções de instalação e **credenciais de acesso para teste
  de cada perfil de usuário**
- **Apêndice C** — lista de verificação de conformidade técnica, de preenchimento
  obrigatório, indicando para cada requisito R1 a R14 se foi atendido e onde é
  verificável na aplicação ou no repositório

**Condição de qualidade:** a versão entregue deve estar livre de falhas que impeçam a
execução de qualquer fluxo principal declarado na documentação.

---

## Obrigações contínuas, sem data própria

Correm ao longo de todo o semestre e são verificadas nos checkpoints e nas entregas.

**Gestão** (Seção 6.1)

- Backlog mantido em ferramenta de gestão de tarefas
- Quadro de tarefas e repositório acessíveis ao docente durante todo o semestre
- Ao término de cada ciclo, registro do que foi concluído, do que foi replanejado e
  dos impedimentos identificados

**Versionamento** (Seção 6.2)

- Repositório utilizado desde o início da implementação. É **vedada** a submissão
  concentrada de código em datas próximas às entregas
- Separação entre ramo principal e ramos de funcionalidade, com integração por
  requisições de incorporação revisadas por outro integrante
- Mensagens de commit descritivas. Mensagens genéricas sem conteúdo informativo são
  vedadas
- Nenhum arquivo com chaves, senhas ou credenciais versionado

**Acompanhamento** (Apêndice B)

- Ficha de distribuição de responsabilidades, atualizada ao término de cada ciclo e
  apresentada ao docente nos checkpoints e nas entregas

**Equipe** (Seção 8.4)

- Situação de integrante ausente ou omisso deve ser comunicada formalmente ao docente
  **até o Checkpoint correspondente**. Comunicação apresentada somente na entrega
  final não retroage

---

## Ciclos de desenvolvimento

O processo é iterativo e incremental, organizado em quatro ciclos.

| Semana | Período | Ciclo | Atividades previstas |
| --- | --- | --- | --- |
| 1 | 03 a 07/08 | Concepção | Apresentação do documento norteador, alinhamento de expectativas, discussão dos eixos temáticos, início da formação das equipes |
| 2 | 10 a 14/08 | Concepção | Registro definitivo das equipes. Delimitação do domínio e definição preliminar do escopo |
| 3 | 17 a 21/08 | Concepção | Levantamento de requisitos, definição de personas, mapeamento das regras de negócio. Submissão da proposta de tema |
| 4 | 24 a 28/08 | Concepção | Elaboração do documento de escopo: contexto, justificativa, público-alvo, requisitos priorizados |
| 5 | 31/08 a 04/09 | Concepção | Modelagem de dados e definição arquitetural. Escolha e justificativa da pilha. Configuração do repositório e do ambiente |
| 6 | 08 a 11/09 | Concepção | Prototipação de interfaces e definição do backlog. **Checkpoint 1 em 11/09** |
| 7 | 14 a 18/09 | Ciclo 1 | Estruturação do projeto em camadas, navegação entre telas, módulo de autenticação |
| 8 | 21 a 25/09 | Ciclo 1 | Conclusão do primeiro módulo funcional integrado à persistência local. Revisão do ciclo |
| 9 | 28/09 a 02/10 | Avaliação | **Entrega e apresentação da N1** |
| 10 | 05 a 09/10 | Ajuste | Devolutiva docente. Replanejamento do backlog e correção das inconsistências |
| 11 | 13 a 16/10 | Ciclo 2 | Operações de manutenção de dados sobre as entidades principais, com validações |
| 12 | 19 a 23/10 | Ciclo 2 | Regras de negócio, listagens com filtro e ordenação, visão consolidada de dados |
| 13 | 26 a 30/10 | Ciclo 3 | Integração com o serviço de retaguarda. Sincronização e tratamento de conectividade |
| 14 | 03 a 06/11 | Ciclo 3 | Integração de serviço externo e de recurso nativo. **Checkpoint 2 em 06/11** |
| 15 | 09 a 13/11 | Verificação | Testes funcionais e sessões de usabilidade. Registro e classificação dos defeitos |
| 16 | 16 a 19/11 | Ciclo 4 | Correção dos defeitos priorizados. Refinamento de interface, acessibilidade e tratamento de erros |
| 17 | 23 a 27/11 | Ciclo 4 | **Congelamento em 27/11.** Geração do pacote instalável e testes em dispositivo físico |
| 18 | 30/11 a 04/12 | Encerramento | Consolidação do relatório técnico e da documentação. **Documentação final em 04/12** |
| 19 | 07 a 11/12 | Avaliação | **Entrega e apresentação da N2.** Mostra final com banca avaliadora |
| 20 | 14 a 18/12 | Encerramento | Divulgação de resultados, devolutivas finais, encerramento formal |

---

## Normas de entrega

- Todas as entregas pelo ambiente virtual de aprendizagem, encerrando-se às **23h59**
  da data limite
- Documentos em PDF, nomeados no padrão **`PI2026-2_NomeDaEquipe_Etapa.pdf`**
- Repositório público ou compartilhado com o docente, com o endereço informado **no ato
  da primeira entrega** e mantido inalterado até o encerramento do semestre
- Atraso, quando aceito mediante justificativa formal deferida: **redução de 20% da
  pontuação da etapa por dia**, limitada a 3 dias, após o que a pontuação é zerada
- Ausência de integrante na apresentação, sem justificativa formal amparada por norma
  institucional: **nota zero no item de apresentação** para o discente ausente

### Formato das apresentações (Apêndice D)

20 minutos, seguidos de até 10 minutos de arguição. Todos os integrantes devem
apresentar parte do conteúdo.

| Bloco | Duração | Conteúdo |
| --- | --- | --- |
| Contextualização | 3 min | Domínio do problema, público-alvo, proposta de valor |
| Especificação | 4 min | Requisitos, regras de negócio, modelagem de dados |
| Decisões técnicas | 5 min | Arquitetura implementada, pilha tecnológica, justificativa das escolhas |
| Demonstração | 6 min | Execução da aplicação em dispositivo, percorrendo os fluxos principais |
| Encerramento | 2 min | Estado atual, limitações, próximos passos |

### Eixos da arguição individual

- Justificativa das decisões arquiteturais e das alternativas descartadas
- Explicação de trechos específicos do código submetido
- Descrição do fluxo de dados entre a aplicação e o serviço de retaguarda
- Tratamento adotado para falhas, validações e cenários de exceção
- Critérios usados na priorização do backlog e no replanejamento entre ciclos
- Atribuições assumidas individualmente e sua correspondência com o histórico de
  versionamento

A impossibilidade de explicar decisões de implementação caracteriza ausência de
autoria e reduz a pontuação dos itens correspondentes.

---

## Condição que se aplica a toda etapa

O projeto resulta em três entregas indissociáveis, avaliadas em conjunto: **produto de
software**, **artefatos de engenharia** e **comunicação técnica**. A ausência de
qualquer uma delas descaracteriza o Projeto Integrador e implica nota zero à etapa
correspondente.
