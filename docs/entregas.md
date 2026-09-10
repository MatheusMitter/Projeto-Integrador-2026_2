# Entregas — Projeto Integrador ADS 2026/2

O que entregar em cada data. As regras que valem para todas as entregas — normas de
submissão, penalidades, obrigações contínuas, formato das apresentações e ciclos
semanais — estão em [`normas-e-processo.md`](normas-e-processo.md).

**Fontes:** _Documento Norteador — Projeto Integrador ADS 2026/2_, versão 2.0 ·
_ADS1253 — Projeto Integrador do Módulo_, Prof. Welington Júlio.
Divergências de data estão sinalizadas e resolvidas pela data mais cedo, conforme
[`duvidas-coordenacao.md`](duvidas-coordenacao.md).

---

# ⚠️ Próxima entrega — Checkpoint 1, sexta-feira 11/09/2026

**Quatro artefatos obrigatórios.** Detalhamento completo na seção 3, abaixo.

- [ ] **Escopo do projeto** — domínio, problema, objetivos, público-alvo, personas,
      requisitos funcionais e não funcionais priorizados, regras de negócio
- [ ] **Protótipo navegável** — mínimo 6 telas com navegação; não precisa de código
- [ ] **Backlog priorizado** — em ferramenta de gestão, com responsáveis atribuídos
- [ ] **DER do banco de dados** — entidades, chaves, cardinalidades, normalização

**Antes disso, três pendências têm de estar fechadas:** equipe registrada, tema
submetido e validado pelo docente, repositório criado.

---

## Calendário

| #   | Entrega                      | Data                                                 | Peso                          |
| --- | ---------------------------- | ---------------------------------------------------- | ----------------------------- |
| 1   | Registro das equipes         | 14/08/2026                                           | pré-requisito                 |
| 2   | Proposta de tema             | 21/08/2026                                           | pré-requisito                 |
| 3   | **Checkpoint 1**             | **11/09/2026**                                       | indireto — ver entrega 3      |
| 4   | **N1**                       | **28/09 a 02/10/2026** <br><sub>ADS1253: 29/09</sub> | **10,0 pontos**               |
| —   | _Avaliação Interdisciplinar_ | _03/11/2026_                                         | _1,0 na N2 — fora do projeto_ |
| 5   | **Checkpoint 2**             | **06/11/2026**                                       | indireto — ver entrega 5      |
| 6   | Testes com usuários          | 09 a 13/11/2026 <br><sub>ADS1253: 10/11</sub>        | avaliado na N2                |
| 7   | Congelamento de escopo       | 27/11/2026                                           | pré-requisito da N2           |
| 8   | Documentação final           | 04/12/2026                                           | avaliado na N2                |
| 9   | **N2**                       | **07 a 11/12/2026** <br><sub>ADS1253: 08/12</sub>    | **10,0 pontos**               |

Somente as entregas 4 e 9 recebem nota lançada. Todas as outras são avaliadas de forma
indireta, e o mecanismo está explicado em cada uma.

---

# 1 · Registro das equipes — 14/08/2026

> **Prazo vencido.** Reprogramação tratada no item 1.3 de
> [`duvidas-coordenacao.md`](duvidas-coordenacao.md).

### Entregar

- [ ] Composição da equipe, em formulário próprio junto ao docente
- [ ] Indicação do coordenador, responsável pela interlocução com o docente
- [ ] Indicação do responsável técnico pelo repositório
- [ ] Atribuição técnica identificável para cada integrante

### Condições

3 a 4 discentes. A Seção 3.2 do norteador se contradiz quanto ao piso — ver item 1.1
do documento de dúvidas. Número inferior exige autorização expressa da coordenação
mediante justificativa formal.

Alteração de composição após a Semana 4 somente em situação excepcional, formalmente
justificada.

---

# 2 · Proposta de tema — 21/08/2026

> **Prazo vencido.** Ver item 1.3 de [`duvidas-coordenacao.md`](duvidas-coordenacao.md).
>
> **Bloqueia todo o resto.** A Seção 3.3 condiciona o início do desenvolvimento à
> validação formal do tema pelo docente.

### Entregar

- [ ] Delimitação do domínio do problema, submetida para validação

### O domínio precisa ter

- Problema delimitado com clareza, com usuários identificáveis
- Regras de negócio explícitas
- Um fluxo principal de uso que justifique a existência da aplicação
- No mínimo **duas entidades principais** relacionadas entre si e sujeitas a regras de
  validação

### O que não é aceito

- Listagens estáticas, calculadoras simples, agregadores de conteúdo sem tratamento de
  dados, aplicações de exibição sem interação relevante do usuário
- Reprodução de tutoriais, cursos, repositórios públicos ou projetos de semestres
  anteriores, próprios ou de terceiros

---

# 3 · Checkpoint 1 — 11/09/2026

### Como isso pesa na nota

Não há nota lançada nesta data. O peso é real, mas indireto, por dois caminhos:

**Fator de Participação Individual.** A Seção 8.4 lista o desempenho nos checkpoints
entre os critérios do FPI, que multiplica a nota individual de cada integrante por um
fator de 0,00 a 1,00.

**Os artefatos voltam pontuados na N1, três semanas depois.** Os quatro alimentam
quatro dos seis itens da N1, que somam **7,0 dos 10,0 pontos**:

| Artefato de 11/09   | Item da N1                        | Pontos |
| ------------------- | --------------------------------- | ------ |
| Escopo              | Item 1 — documento de projeto     | 2,5    |
| DER                 | Item 2 — modelagem e arquitetura¹ | 1,5    |
| Protótipo navegável | Item 3 — protótipo e memorial²    | 2,0    |
| Backlog priorizado  | Item 5 — gestão do projeto        | 1,0    |

<sub>¹ O item 2 exige também a definição arquitetural e a justificativa da pilha
tecnológica, além do DER. ² O item 3 exige também o memorial de usabilidade e
acessibilidade.</sub>

Ou seja: nada do trabalho de sexta é descartável, e fazê-lo bem agora reduz o esforço
da N1.

### Entregar

#### 3.1 Escopo do projeto

Conteúdo, conforme os itens 2 a 7 do Apêndice A.1 e as Semanas 3 e 4:

- [ ] Contexto e caracterização do domínio do problema
- [ ] Descrição do problema e justificativa da solução
- [ ] Objetivo geral e objetivos específicos
- [ ] Público-alvo e personas
- [ ] Requisitos funcionais e não funcionais, identificados e priorizados
- [ ] Regras de negócio, com comportamento esperado — mínimo de 3 não triviais (R4)

Codificar como `RF01`, `RNF01`, `RN01`. O Apêndice C exigirá, na N2, mapear cada
requisito R1 a R14 para onde é verificável — a codificação desde já evita retrabalho.

#### 3.2 Protótipo navegável

- [ ] Mínimo de 6 telas funcionais distintas, com navegação estruturada (R1)
- [ ] Fluxo de autenticação e as **duas** visões de perfil (R2)
- [ ] Telas de manutenção de dados das entidades principais (R3)
- [ ] Listagem com filtro, ordenação ou busca, e a visão consolidada (R9)
- [ ] Estados de carregamento e de lista vazia (R10)

Não exige código. Ferramenta de prototipação como Figma atende, conforme orientação de
ADS1253. Atenção: protótipo com um só perfil não cobre o R2, e a visão consolidada do
R9 é o requisito mais esquecido.

#### 3.3 Backlog priorizado

Conforme a Seção 6.1:

**O que é.** Uma lista ordenada de tudo que o aplicativo precisa ter, quebrada em
itens pequenos, cada um escrito da perspectiva de quem vai usar. Ordenada porque a
ordem informa o que será construído primeiro. É o instrumento pelo qual a equipe
planeja e o docente acompanha o andamento.

**Onde vive.** Em ferramenta de quadro de tarefas, não em documento. A Seção 6.1 exige
que o quadro esteja acessível ao docente durante todo o semestre — um arquivo entregue
uma vez não cumpre isso.

Recomendação: **GitHub Projects**, porque fica no mesmo lugar do repositório, é público
junto com ele e vincula cada item aos commits que o implementam. Trello e Jira também
atendem.

#### Como escrever cada item

Dois formatos são aceitos. O de história de usuário é preferível, porque carrega o
motivo e ajuda na arguição.

_História de usuário_ — `Como <perfil>, quero <ação> para <benefício>`

> Como técnico, quero ver apenas os chamados atribuídos a mim, para saber o que
> atender hoje sem procurar na lista inteira.

_Requisito funcional_ — referência ao código do escopo

> RF15 — O sistema deve listar os registros filtrados por situação e prioridade.

Cada item precisa ser pequeno o suficiente para caber em um ciclo e resultar em algo
demonstrável. "Fazer o aplicativo" não é um item. "Cadastrar cliente com validação dos
campos obrigatórios" é.

#### O que "priorizado" significa

Não é ordenar por gosto. Cada item recebe uma prioridade explícita — um campo ou
etiqueta com Alta, Média e Baixa, ou a própria posição na coluna — e a ordem precisa ser
**justificável**. Um dos eixos da arguição individual é exatamente "os critérios
utilizados na priorização do backlog e no replanejamento entre ciclos".

Critério que se sustenta neste projeto: primeiro o que os requisitos R1 a R14 obrigam,
ordenado por dependência técnica. Autenticação antes de CRUD, porque o CRUD depende de
saber quem é o usuário. CRUD antes de regras de negócio, porque as regras operam sobre
os dados. Persistência local antes de sincronização. O que é desejável e não pontua
fica no fim.

#### Quantos itens

As normas não fixam mínimo. O tamanho decorre da cobertura: o backlog precisa
contemplar os requisitos funcionais do escopo. Um aplicativo com 6 telas, 2 entidades
com manutenção completa e 3 regras de negócio costuma render entre 20 e 30 itens.

#### Passo a passo

- [ ] Escolher a ferramenta e criar o quadro
- [ ] Criar as colunas de fluxo — por exemplo: Backlog, A fazer, Em andamento, Concluído
- [ ] Lançar um item por requisito funcional do escopo, em formato de história de
      usuário ou requisito
- [ ] Marcar a prioridade de cada item
- [ ] Atribuir cada item a um integrante, nominalmente
- [ ] Ordenar o quadro de modo que a prioridade seja visível
- [ ] Tornar o quadro acessível ao docente e registrar o endereço junto com o do
      repositório

#### Onde isso reaparece

Na N1, item 5, valendo 1,0 ponto, avaliado junto com a distribuição de
responsabilidades e a regularidade do histórico de versionamento. E ao fim de cada
ciclo é preciso registrar o que foi concluído, o que foi replanejado e quais
impedimentos apareceram — o quadro é onde esse registro se sustenta.

> **Depende do tema.** Os itens do backlog descrevem funcionalidades, e as
> funcionalidades vêm do domínio escolhido. Sem o tema definido, o quadro pode ser
> criado e as colunas configuradas, mas os itens não podem ser escritos.

#### 3.4 DER do banco de dados

Exigido pelo documento de ADS1253, que o vincula ao conteúdo da aula técnica:
modelagem relacional, normalização e integridade.

- [ ] Entidades com atributos
- [ ] Chaves primárias e estrangeiras explícitas
- [ ] Cardinalidades nos relacionamentos
- [ ] Normalizado
- [ ] Mínimo de 2 entidades principais relacionadas (Seção 3.3)

### O que não é exigido em 11/09

Código em execução, autenticação implementada, aplicação parcial, pacote instalável,
testes. Aplicação parcial é a entrega 4, em 28/09.

### Formato

O norteador descreve como "verificação" (Seção 7.1) e como "apresentação do protótipo
navegável" (Semana 6). ADS1253 prevê 2 horas de acompanhamento dedicadas. Há dúvida
sobre existir submissão no ambiente virtual — ver item 2.2 do documento de dúvidas.

---

# 4 · N1 — 28/09 a 02/10/2026 · **10,0 pontos**

### Como é pontuada

| Item | Descrição                                                               | Pontos | Artefato                        |
| ---- | ----------------------------------------------------------------------- | ------ | ------------------------------- |
| 1    | Documento de projeto                                                    | 2,5    | PDF                             |
| 2    | Modelagem de dados e definição arquitetural, com justificativa da pilha | 1,5    | Diagramas e memorial técnico    |
| 3    | Protótipo navegável, com justificativa de usabilidade e acessibilidade  | 2,0    | Protótipo e memorial descritivo |
| 4    | **Aplicação parcial em execução**                                       | 2,0    | Repositório Git e demonstração  |
| 5    | Gestão do projeto                                                       | 1,0    | Quadro de tarefas e repositório |
| 6    | Apresentação e defesa técnica                                           | 1,0    | Apresentação presencial         |

### Entregar

#### 4.1 Documento de projeto — estrutura do Apêndice A.1

- [ ] 1. Capa e identificação da equipe, com atribuição técnica de cada integrante
- [ ] 2. Contexto e caracterização do domínio
- [ ] 3. Descrição do problema e justificativa da solução
- [ ] 4. Objetivo geral e objetivos específicos
- [ ] 5. Público-alvo e personas
- [ ] 6. Requisitos funcionais e não funcionais, identificados e priorizados
- [ ] 7. Regras de negócio, com comportamento esperado
- [ ] 8. Modelagem de dados e diagramas pertinentes
- [ ] 9. Definição arquitetural e justificativa da pilha tecnológica
- [ ] 10. Cronograma interno da equipe, com responsabilidades por ciclo
- [ ] 11. Referências utilizadas

#### 4.2 Aplicação parcial em execução

O único item que exige código rodando:

- [ ] Navegação estruturada entre as telas
- [ ] Autenticação funcionando
- [ ] Ao menos um módulo funcional integrado à persistência

#### 4.3 Demais itens

- [ ] Memorial de usabilidade e acessibilidade, acompanhando o protótipo
- [ ] Backlog e distribuição de responsabilidades atualizados, com histórico de
      versionamento regular
- [ ] Apresentação presencial com participação de **todos** os integrantes

### O que a N1 acrescenta ao Checkpoint 1

Capa com atribuição técnica, definição arquitetural e justificativa da pilha,
cronograma interno, referências, memorial de usabilidade, **aplicação parcial em
execução** e apresentação presencial.

---

# 5 · Checkpoint 2 — 06/11/2026

### Como isso pesa na nota

Sem nota lançada. Alimenta o FPI, pela Seção 8.4, e o que for demonstrado aqui é a base
da aplicação concluída que vale 3,5 pontos na N2.

### Entregar

- [ ] Versão beta funcional, demonstrada
- [ ] Persistência local **e** remota operando, com sincronização de dados
- [ ] Integração com pelo menos um serviço ou API externa
- [ ] Recurso nativo do dispositivo integrado (previsto na Semana 14)

### O salto em relação à N1

Na N1 a arquitetura precisava estar definida. Aqui ela precisa estar em execução, com
dados sendo gravados e sincronizados.

---

# 6 · Testes com usuários — 09 a 13/11/2026

### Como isso pesa na nota

O produto desta etapa é avaliado na N2, item 3, valendo **1,5 ponto**.

### Entregar

Conforme a Seção 6.3:

- [ ] Roteiro de testes funcionais cobrindo os fluxos principais, com resultado
      esperado e resultado obtido registrados **para cada caso**
- [ ] Sessões de teste de usabilidade com **no mínimo 5 usuários externos à equipe**,
      pertencentes ao perfil definido para a aplicação
- [ ] Defeitos registrados com classificação de severidade, acompanhados até a
      resolução ou a justificativa formal de não correção

> **Atenção:** o mínimo de 5 usuários externos consta apenas do norteador e é um dos
> itens mais esquecidos. Depende de agendar pessoas de fora da equipe — começar a
> combinar isso em outubro, não em novembro.

---

# 7 · Congelamento de escopo — 27/11/2026

### Entregar

- [ ] Desenvolvimento de novas funcionalidades encerrado
- [ ] Pacote instalável gerado
- [ ] Instalação testada em dispositivo físico

Depois desta data, apenas correção de defeitos, refinamento de interface,
acessibilidade e tratamento de erros.

---

# 8 · Documentação final — 04/12/2026

### Como isso pesa na nota

Avaliado na N2, item 4, valendo **1,5 ponto** junto com o README.

### Entregar

- [ ] Relatório técnico final
- [ ] Pacote instalável
- [ ] Repositório consolidado

### Estrutura do relatório técnico — Apêndice A.2

- [ ] 1. Atualização consolidada do documento de projeto, com as alterações de escopo
- [ ] 2. Funcionalidades implementadas, com mapeamento explícito para R1 a R14
- [ ] 3. Registro das telas, com descrição dos fluxos principais
- [ ] 4. Arquitetura implementada e decisões técnicas relevantes
- [ ] 5. Relatório de testes: roteiro, resultados, defeitos e correções
- [ ] 6. Síntese das sessões de usabilidade e dos ajustes decorrentes
- [ ] 7. Limitações identificadas e proposições de evolução
- [ ] 8. **Declaração de uso de ferramentas de inteligência artificial**, com as
     finalidades
- [ ] 9. Instruções de instalação, execução e administração, com credenciais de teste
     por perfil

---

# 9 · N2 — 07 a 11/12/2026 · **10,0 pontos**

### Como é pontuada

| Item | Descrição                                                                                            | Pontos | Artefato                         |
| ---- | ---------------------------------------------------------------------------------------------------- | ------ | -------------------------------- |
| 1    | Aplicação concluída, atendendo R1 a R14, com execução comprovada em dispositivo físico               | 3,5    | Pacote instalável e demonstração |
| 2    | Qualidade técnica: camadas, tratamento de erros, validações, nomenclatura, sem credenciais em código | 2,0    | Repositório Git                  |
| 3    | Verificação e testes                                                                                 | 1,5    | Relatório de testes              |
| 4    | Relatório técnico final e documentação do repositório                                                | 1,5    | PDF e README                     |
| 5    | Apresentação final, com arguição individual pela banca                                               | 1,5    | Apresentação presencial          |

### Entregar

- [ ] Aplicação atendendo aos **14 requisitos** — ver
      [`normas-e-processo.md`](normas-e-processo.md#requisitos-obrigatórios-r1-a-r14)
- [ ] Pacote APK ou AAB, com instruções de instalação
- [ ] **Credenciais de acesso para teste de cada perfil de usuário**
- [ ] **Apêndice C** — lista de verificação de conformidade, de preenchimento
      obrigatório, indicando para cada requisito R1 a R14 se foi atendido e onde é
      verificável
- [ ] Relatório técnico final e README com instalação, execução e administração
- [ ] Apresentação com demonstração em dispositivo e arguição individual

### Condição de qualidade

A versão entregue deve estar livre de falhas que impeçam a execução de **qualquer
fluxo principal** declarado na documentação.
