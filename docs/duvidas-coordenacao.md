# Solicitação de esclarecimento — Projeto Integrador ADS 2026/2

**Assunto:** divergências identificadas no cruzamento dos documentos normativos do
Projeto Integrador

**Documentos analisados**

1. *Documento Norteador — Projeto Integrador ADS, semestre 2026/2, versão 2.0* —
   Escola Politécnica e de Artes, PUC Goiás
2. *ADS1253 — AED · Projeto Integrador do Módulo* — Prof. Welington Júlio

**Data:** 09/09/2026

---

## Apresentação

A equipe realizou a leitura integral dos dois documentos e identificou pontos em que
as orientações diferem entre si, ou em que o texto normativo apresenta redações
incompatíveis entre marcadores da mesma seção. Como parte desses pontos condiciona
decisões que precisam ser tomadas antes do Checkpoint 1 de 11/09, solicitamos
esclarecimento.

Os itens estão agrupados por urgência. Para cada um, indicamos a interpretação
provisória adotada, de modo que o desenvolvimento não fique paralisado enquanto
aguardamos resposta.

---

## Bloco 1 — Pontos que condicionam decisões imediatas

### 1.1 Número mínimo de integrantes por equipe

A Seção 3.2 do Documento Norteador apresenta, em marcadores consecutivos, duas
condições que não podem ser satisfeitas simultaneamente:

- as equipes "serão compostas por 3 (três) a 4 (quatro) discentes";
- "não serão admitidas equipes com número inferior a 4 integrantes, salvo
  autorização expressa da coordenação do curso mediante justificativa formal".

O documento de ADS1253 adota "grupos de 3 a 4 integrantes" em dois pontos distintos.

**Solicitamos:** definição de qual é o piso vigente, 3 ou 4 integrantes. E, como a
própria Seção 3.2 prevê autorização excepcional, qual o procedimento e o prazo para
requerê-la no caso de equipe com número inferior ao piso.

### 1.2 Persistência remota — JDBC e DAO ou plataforma de backend como serviço

A Seção 4 do Documento Norteador admite expressamente, para os serviços de
retaguarda, tanto o desenvolvimento de interface de programação própria (Spring
Boot, Node.js, FastAPI ou equivalente) quanto o uso de plataformas de backend como
serviço (Firebase, Supabase ou equivalentes).

O documento de ADS1253, no pilar de Persistência e Integração e na descrição do
Checkpoint 2, afirma que a camada de persistência remota é construída com JDBC, DAO
e transações — conteúdo da disciplina.

As duas orientações são conciliáveis apenas se a retaguarda for implementada em
Java. Uma plataforma de backend como serviço atenderia à Seção 4, mas não exercitaria
o conteúdo indicado no segundo documento.

**Solicitamos:** confirmação de se Firebase, Supabase ou equivalentes atendem ao
requisito R6, ou se a retaguarda deve ser obrigatoriamente implementada em Java com
acesso a dados por JDBC e padrão DAO.

**Impacto:** este é o ponto de maior consequência arquitetural. Define a pilha
tecnológica, a modelagem de dados e a distribuição de esforço no cronograma interno.

**Interpretação provisória adotada:** retaguarda própria em Spring Boot com DAO
sobre JDBC, por ser a única configuração que atende aos dois documentos ao mesmo
tempo.

### 1.3 Formalização dos prazos de registro de equipe e submissão de tema

Os dois documentos fixam 14/08/2026 para o registro das equipes e 21/08/2026 para a
submissão da proposta de tema. O documento de ADS1253 registra que o plano de ensino
foi aprovado em 24/08/2026 e adota, na prática, o critério de que equipe e tema
estejam definidos antes do Checkpoint 1 de 11/09.

A Seção 7 do Documento Norteador estabelece que ajustes de calendário sejam
divulgados oficialmente pela coordenação, com aviso prévio mínimo de 7 dias. A Seção
3.3 condiciona o início do desenvolvimento à validação formal do tema, e a Seção 9
prevê redução de 20% da pontuação por dia de atraso.

**Solicitamos:** formalização por escrito da nova data-limite para o registro da
equipe e a submissão da proposta de tema, a fim de afastar a incidência da penalidade
prevista na Seção 9 sobre entregas cujo prazo original foi anterior à aprovação do
plano de ensino.

---

## Bloco 2 — Pontos que afetam a entrega de 11/09

### 2.1 Diagrama Entidade-Relacionamento no Checkpoint 1

A Seção 7.1 do Documento Norteador descreve o Checkpoint 1 como "verificação de
escopo, protótipo navegável e backlog priorizado". O detalhamento da Semana 6 repete
esses três itens.

O documento de ADS1253 acrescenta o DER do banco de dados aos entregáveis da mesma
etapa.

**Solicitamos:** confirmação de que o DER integra os entregáveis do Checkpoint 1.

**Interpretação provisória adotada:** o DER será apresentado, por prevalecer a união
das exigências dos dois documentos.

### 2.2 Forma de entrega do Checkpoint 1

A Seção 9 do Documento Norteador determina que todas as entregas ocorram por meio do
ambiente virtual de aprendizagem, nos prazos da Seção 7, encerrando-se às 23h59 da
data limite. O Checkpoint 1 consta da Seção 7. Entretanto, a Seção 7.1 o descreve
como "verificação", o detalhamento da Semana 6 como "apresentação do protótipo
navegável", e o documento de ADS1253 como acompanhamento presencial de 2 horas.

**Solicitamos:** esclarecimento sobre se há submissão no ambiente virtual em 11/09,
sessão presencial, ou ambos.

Adicionalmente, a Seção 9 exige que o endereço do repositório de código seja
informado "no ato da primeira entrega". **Solicitamos** confirmação de que o
Checkpoint 1 constitui essa primeira entrega, para fins de cumprimento do requisito.

---

## Bloco 3 — Pontos que afetam o planejamento do semestre

### 3.1 Datas de três janelas de entrega

| Marco | Documento Norteador | Material de ADS1253 |
| --- | --- | --- |
| Entrega e apresentação da N1 | 28/09 a 02/10/2026 | 29/09 a 02/10/2026 |
| Testes com usuários | 09 a 13/11/2026 | 10 a 13/11/2026 |
| Entrega e apresentação da N2 | 07 a 11/12/2026 | 08 a 11/12/2026 |

Em todos os três casos, o segundo documento inicia a janela um dia depois. As semanas
do Documento Norteador correm de segunda a sexta-feira; o documento de ADS1253 desloca
o início para terça-feira.

**Solicitamos:** definição de qual data inicia cada janela.

**Interpretação provisória adotada:** a data mais cedo, por segurança.

### 3.2 Relação entre a lista de requisitos técnicos e a Seção 5

A Seção 5 do Documento Norteador estabelece 14 requisitos obrigatórios (R1 a R14). O
documento de ADS1253 apresenta uma lista de verificação com 8 itens, que não contempla:

- o número mínimo de 3 regras de negócio não triviais (R4);
- as listagens com filtro, ordenação ou busca e a visão consolidada de dados (R9),
  ausentes do segundo documento;
- a indicação de estados de carregamento e de listas vazias (R10);
- os critérios objetivos de contraste, áreas de toque e rótulos para leitores de tela
  (R11);
- a ausência de credenciais em código-fonte e de trechos comentados sem uso (R12).

**Solicitamos:** confirmação de que a lista de 8 itens é síntese didática e que a
Seção 5 prevalece integralmente na avaliação.

**Interpretação provisória adotada:** os 14 requisitos do Documento Norteador.

### 3.3 Classificação do uso de geolocalização

O documento de ADS1253 cita geolocalização como exemplo de serviço ou API externa
(requisito de integração) e também como recurso nativo do dispositivo. No Documento
Norteador, geolocalização aparece exclusivamente em R8, entre os recursos do
aparelho, enquanto R7 exige consumo de serviço ou interface de programação externa.

**Solicitamos:** esclarecimento sobre se o uso de geolocalização satisfaz R7, R8 ou
apenas R8.

**Interpretação provisória adotada:** geolocalização atende somente R8; R7 será
atendido por serviço externo distinto.

---

## Observação menor, sem impacto sobre a execução

O documento de ADS1253 afirma que o projeto representa o maior peso individual da
avaliação do semestre, com 8,0 dos 20,0 pontos das duas etapas. A soma está correta,
mas as avaliações presenciais totalizam o mesmo valor (P1 + P2 = 8,0), e por etapa
PP1 equivale a P1. Trata-se, portanto, de equivalência e não de predominância.

Registramos apenas para eventual ajuste do material.

---

## Resumo das interpretações provisórias

Enquanto aguardamos resposta, a equipe seguirá com:

| Item | Interpretação adotada |
| --- | --- |
| Datas divergentes | A mais cedo |
| Requisitos técnicos | Os 14 da Seção 5 |
| Retaguarda | Spring Boot com DAO sobre JDBC |
| Geolocalização | Atende apenas R8 |
| DER no Checkpoint 1 | Será apresentado |
| Piso de integrantes | Pendente de definição |

---

**Equipe:** *a preencher*
**Integrantes:** *a preencher*
**Repositório:** https://github.com/MatheusMitter/Projeto-Integrador-2026_2
