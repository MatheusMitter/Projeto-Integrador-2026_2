# Normas e processo — Projeto Integrador ADS 2026/2

Regras que valem para todas as entregas. O que entregar em cada data está em
[`entregas.md`](entregas.md).

**Fontes:** *Documento Norteador — Projeto Integrador ADS 2026/2*, versão 2.0 ·
*ADS1253 — Projeto Integrador do Módulo*, Prof. Welington Júlio.

---

## Sumário

- [Requisitos obrigatórios R1 a R14](#requisitos-obrigatórios-r1-a-r14)
- [Como a nota é composta](#como-a-nota-é-composta)
- [Fator de Participação Individual](#fator-de-participação-individual)
- [Normas de submissão](#normas-de-submissão)
- [Penalidades](#penalidades)
- [Obrigações contínuas](#obrigações-contínuas)
- [Apresentações](#apresentações)
- [Tecnologias admitidas](#tecnologias-admitidas)
- [Ciclos semanais](#ciclos-semanais)

---

## Requisitos obrigatórios R1 a R14

Todos obrigatórios, conforme a Seção 5. O não atendimento de qualquer item reduz a
pontuação técnica. Verificados na N2, item 1.

| Nº | Requisito | Mínimo exigido |
| --- | --- | --- |
| R1 | Telas e navegação | 6+ telas funcionais distintas, com navegação estruturada e coerente |
| R2 | Autenticação e perfis | Cadastro e autenticação, com 2+ perfis de permissões distintas |
| R3 | Manutenção de dados | Inclusão, consulta, alteração e exclusão em 2+ entidades, com validação de entrada |
| R4 | Regras de negócio | 3+ regras não triviais, documentadas e verificáveis na aplicação |
| R5 | Persistência local | Armazenamento local estruturado, com comportamento definido sem conectividade |
| R6 | Persistência remota | Serviço de retaguarda com armazenamento e sincronização |
| R7 | Integração externa | 1+ serviço ou API externa pertinente ao domínio |
| R8 | Recurso nativo | 1+ recurso do aparelho: câmera, geolocalização, notificações, arquivos, biometria ou sensores |
| R9 | Consulta e apresentação | Listagens com filtro, ordenação ou busca **e** 1+ visão consolidada (resumo, indicador ou gráfico) |
| R10 | Erros e estados | Tratamento de falhas, mensagens ao usuário, estados de carregamento e de lista vazia |
| R11 | Usabilidade e acessibilidade | Heurísticas de usabilidade, contraste adequado, áreas de toque conforme a plataforma, rótulos para leitores de tela |
| R12 | Organização do código | Camadas, nomenclatura consistente, sem credenciais no código-fonte, sem trechos comentados sem uso |
| R13 | Versionamento | Git com histórico distribuído, commits descritivos, README de instalação e execução |
| R14 | Distribuição | Pacote APK ou AAB gerado e execução comprovada em dispositivo físico |

**R9 é o mais esquecido.** Filtro ou busca **e** a visão consolidada precisam existir
explicitamente. Ele não aparece na lista resumida do documento de ADS1253 — ver item
3.2 de [`duvidas-coordenacao.md`](duvidas-coordenacao.md).

### Requisitos desejáveis

Não obrigatórios e **sem acréscimo de pontuação**, considerados apenas como
indicadores de qualidade dentro das rubricas existentes: testes automatizados,
integração contínua, internacionalização, tema claro e escuro, painel administrativo
web complementar, publicação em loja de aplicativos.

---

## Como a nota é composta

Cada etapa vale 10,0 pontos, integralmente distribuídos entre itens obrigatórios. Não
há itens bonificados, pontuação opcional ou atividades substitutivas.

**N1 — 10,0** · documento de projeto 2,5 · modelagem e arquitetura 1,5 · protótipo
navegável 2,0 · aplicação parcial em execução 2,0 · gestão do projeto 1,0 ·
apresentação e defesa técnica 1,0

**N2 — 10,0** · aplicação concluída 3,5 · qualidade técnica 2,0 · verificação e testes
1,5 · relatório técnico e README 1,5 · apresentação final 1,5

Segundo o documento de ADS1253, esses 10,0 por etapa são convertidos
proporcionalmente para compor até 4,0 pontos como PP1 na N1 e PP2 na N2 da disciplina
— ver item 3.1 do documento de dúvidas.

### Rubrica de desempenho

Aplicada sobre a pontuação máxima de cada item.

| Nível | Percentual | Caracterização |
| --- | --- | --- |
| Excelente | 90% a 100% | Atende integralmente, com consistência técnica, clareza na documentação e decisões justificadas |
| Adequado | 70% a 89% | Atende com pequenas lacunas que não comprometem o resultado |
| Parcial | 40% a 69% | Atende parcialmente, com omissões relevantes, inconsistências técnicas ou artefatos incompletos |
| Insuficiente | 1% a 39% | Entrega fragmentada, superficial ou desalinhada |
| Não entregue | 0% | Ausência do artefato, entrega fora do prazo sem justificativa aceita, ou plágio |

---

## Fator de Participação Individual

**A nota individual é a nota da equipe multiplicada pelo FPI.** É o maior risco
individual do projeto.

Atribuído pelo docente com base em quatro critérios: histórico de contribuições no
repositório, distribuição de responsabilidades registrada, **desempenho durante os
checkpoints** e arguição individual nas apresentações.

| Faixa | Valor | Caracterização |
| --- | --- | --- |
| Participação plena | 1,00 | Contribuição contínua, comprovada e compatível com a atribuição assumida |
| Participação parcial | 0,70 a 0,99 | Contribuição comprovada, porém irregular ou inferior à atribuição |
| Participação reduzida | 0,40 a 0,69 | Contribuição pontual, com ausências recorrentes |
| Participação mínima | 0,10 a 0,39 | Contribuição residual, sem evidências consistentes |
| Ausência de participação | 0,00 | Nenhuma evidência de contribuição na etapa |

A impossibilidade de explicar decisões de implementação na arguição caracteriza
**ausência de autoria** e reduz a pontuação dos itens correspondentes.

Situação de integrante ausente ou omisso deve ser comunicada formalmente ao docente
**até o checkpoint correspondente**. Comunicação apresentada somente na entrega final
não retroage.

---

## Normas de submissão

- Pelo ambiente virtual de aprendizagem, encerrando-se às **23h59** da data limite
- Documentos em PDF, nomeados no padrão **`PI2026-2_NomeDaEquipe_Etapa.pdf`**
- Repositório público ou compartilhado com o docente, com o endereço informado **no ato
  da primeira entrega** e mantido inalterado até o encerramento do semestre
- Na N2, o pacote instalável acompanha instruções de instalação e **credenciais de
  acesso para teste de cada perfil**

---

## Penalidades

| Situação | Consequência |
| --- | --- |
| Atraso, quando aceito mediante justificativa formal deferida | **20% da pontuação da etapa por dia**, limitado a 3 dias; depois, pontuação zerada |
| Ausência de integrante na apresentação, sem justificativa amparada por norma institucional | Nota **zero** no item de apresentação para o discente ausente |
| Ausência de qualquer uma das três entregas indissociáveis | Nota **zero** na etapa |
| Plágio: apropriação de código, texto ou documentação sem referência | Nota **zero** na etapa, mais medidas disciplinares |

### As três entregas indissociáveis

Avaliadas em conjunto. A falta de qualquer uma descaracteriza o Projeto Integrador:

1. **Produto de software** — aplicação funcional, instalável e operante em dispositivo real
2. **Artefatos de engenharia** — documento de projeto, modelagem, protótipo, backlog, registros de testes, repositório versionado
3. **Comunicação técnica** — relatório técnico final e apresentação com demonstração e arguição individual

### Vedações

- Aplicação desenvolvida exclusivamente como página web responsiva sem empacotamento móvel
- Aplicação construída integralmente em plataforma no-code ou low-code sem produção de código pela equipe
- Reprodução de materiais de terceiros sem contribuição autoral identificável
- Reaproveitamento de projetos de semestres anteriores, próprios ou de terceiros

### Uso de inteligência artificial

Permitido como apoio à codificação, redação e pesquisa, **desde que declarado no
relatório final** com indicação das finalidades. A equipe responde integralmente pelo
conteúdo entregue e deve demonstrar domínio técnico sobre todo o código submetido.

---

## Obrigações contínuas

Correm ao longo do semestre e são verificadas nos checkpoints e nas entregas.

### Gestão (Seção 6.1)

- Backlog do produto mantido em ferramenta de gestão de tarefas
- Quadro de tarefas e repositório **acessíveis ao docente durante todo o semestre**
- Ao término de cada ciclo, registro do que foi concluído, do que foi replanejado e dos
  impedimentos identificados

### Versionamento (Seção 6.2)

- Repositório utilizado desde o início da implementação. É **vedada a submissão
  concentrada de código em datas próximas às entregas**
- Separação entre ramo principal e ramos de funcionalidade, com integração por
  **requisições de incorporação revisadas por outro integrante**
- Mensagens de commit descritivas. Mensagens genéricas sem conteúdo informativo são
  vedadas
- Nenhum arquivo com chaves, senhas ou credenciais versionado. Adotar variáveis de
  ambiente ou arquivo de exemplo

### Acompanhamento (Apêndice B)

Ficha de distribuição de responsabilidades, atualizada ao término de cada ciclo e
apresentada ao docente nos checkpoints e nas entregas. Campos: nome da equipe, domínio
do problema, pilha adotada, endereço do repositório, ciclo de referência, integrantes
com matrícula e atribuições, e o registro do ciclo com concluído, replanejado e
impedimentos.

---

## Apresentações

20 minutos, seguidos de até 10 minutos de arguição. **Todos os integrantes devem
apresentar parte do conteúdo.**

| Bloco | Duração | Conteúdo esperado |
| --- | --- | --- |
| Contextualização | 3 min | Domínio do problema, público-alvo, proposta de valor |
| Especificação | 4 min | Requisitos, regras de negócio, modelagem de dados |
| Decisões técnicas | 5 min | Arquitetura implementada, pilha tecnológica, justificativa das escolhas |
| Demonstração | 6 min | Execução em dispositivo, percorrendo os fluxos principais |
| Encerramento | 2 min | Estado atual, limitações, próximos passos |

### Eixos da arguição individual

Verifica autoria e domínio técnico. Pode abordar:

- Justificativa das decisões arquiteturais e das **alternativas descartadas**
- Explicação de trechos específicos do código submetido
- Fluxo de dados entre a aplicação e o serviço de retaguarda
- Tratamento adotado para falhas, validações e cenários de exceção
- Critérios usados na priorização do backlog e no replanejamento entre ciclos
- Atribuições assumidas individualmente e sua correspondência com o histórico de
  versionamento

---

## Tecnologias admitidas

A escolha é autônoma, **desde que justificada tecnicamente** no documento de projeto e
que a aplicação seja executável em dispositivo móvel real.

| Abordagem | Tecnologia | Recomendações do norteador |
| --- | --- | --- |
| Nativa Android | Kotlin ou Java | Jetpack Compose ou XML Layouts, Room, Retrofit |
| Multiplataforma | Flutter (Dart) | Gerenciamento de estado estruturado (Provider, Riverpod ou Bloc), persistência com SQLite, Hive ou Isar |
| Multiplataforma | React Native (JS ou TS) | Expo admitido, React Navigation, persistência com AsyncStorage, SQLite ou WatermelonDB |

**Retaguarda:** interface de programação própria (Spring Boot, Node.js, FastAPI ou
equivalente) ou plataforma de backend como serviço (Firebase, Supabase ou
equivalentes).

A opção adotada deve ser justificada quanto a **custo, curva de aprendizado, adequação
ao domínio e implicações arquiteturais**.

> **Pendente:** o documento de ADS1253 indica que a persistência remota é construída
> com JDBC, DAO e transações, o que restringe as opções acima. Ver item 1.2 de
> [`duvidas-coordenacao.md`](duvidas-coordenacao.md). Esta decisão está bloqueada até
> o esclarecimento.

---

## Ciclos semanais

Processo iterativo e incremental em quatro ciclos ao longo de 20 semanas. Cada ciclo
compreende planejamento, execução, revisão e registro dos resultados.

| Semana | Período | Ciclo | Atividades previstas |
| --- | --- | --- | --- |
| 1 | 03 a 07/08 | Concepção | Apresentação do documento norteador, alinhamento de expectativas, discussão dos eixos temáticos, início da formação das equipes |
| 2 | 10 a 14/08 | Concepção | Registro definitivo das equipes. Delimitação do domínio e escopo preliminar |
| 3 | 17 a 21/08 | Concepção | Levantamento de requisitos, personas, mapeamento das regras de negócio. Submissão do tema |
| 4 | 24 a 28/08 | Concepção | Documento de escopo: contexto, justificativa, público-alvo, requisitos priorizados |
| 5 | 31/08 a 04/09 | Concepção | Modelagem de dados e definição arquitetural. Escolha e justificativa da pilha. Configuração do repositório e do ambiente |
| 6 | 08 a 11/09 | Concepção | Prototipação de interfaces e definição do backlog. **Checkpoint 1 em 11/09** |
| 7 | 14 a 18/09 | Ciclo 1 | Estruturação em camadas, navegação entre telas, módulo de autenticação |
| 8 | 21 a 25/09 | Ciclo 1 | Primeiro módulo funcional integrado à persistência local. Revisão do ciclo |
| 9 | 28/09 a 02/10 | Avaliação | **Entrega e apresentação da N1** |
| 10 | 05 a 09/10 | Ajuste | Devolutiva docente. Replanejamento do backlog e correção das inconsistências |
| 11 | 13 a 16/10 | Ciclo 2 | Manutenção de dados sobre as entidades principais, com validações |
| 12 | 19 a 23/10 | Ciclo 2 | Regras de negócio, listagens com filtro e ordenação, visão consolidada |
| 13 | 26 a 30/10 | Ciclo 3 | Integração com o serviço de retaguarda. Sincronização e conectividade |
| 14 | 03 a 06/11 | Ciclo 3 | Serviço externo e recurso nativo. **Checkpoint 2 em 06/11** |
| 15 | 09 a 13/11 | Verificação | Testes funcionais e sessões de usabilidade. Registro e classificação dos defeitos |
| 16 | 16 a 19/11 | Ciclo 4 | Correção dos defeitos priorizados. Interface, acessibilidade, tratamento de erros |
| 17 | 23 a 27/11 | Ciclo 4 | **Congelamento em 27/11.** Pacote instalável e testes em dispositivo físico |
| 18 | 30/11 a 04/12 | Encerramento | Relatório técnico e documentação. **Documentação final em 04/12** |
| 19 | 07 a 11/12 | Avaliação | **Entrega e apresentação da N2.** Mostra final com banca |
| 20 | 14 a 18/12 | Encerramento | Divulgação de resultados, devolutivas finais, encerramento formal |

O cronograma refere-se ao calendário acadêmico institucional e pode sofrer ajustes
divulgados oficialmente pela coordenação, com aviso prévio mínimo de 7 dias.
