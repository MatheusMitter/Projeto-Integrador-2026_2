# Entregas — Projeto Integrador ADS 2026/2

O que entregar em cada data, e o que cada coisa significa na prática. As regras que
valem para todas as entregas — normas de submissão, penalidades, obrigações contínuas,
requisitos R1 a R14, formato das apresentações e ciclos semanais — estão em
[`normas-e-processo.md`](normas-e-processo.md).

**Fontes:** _Documento Norteador — Projeto Integrador ADS 2026/2_, versão 2.0 ·
_ADS1253 — Projeto Integrador do Módulo_, Prof. Welington Júlio.
Divergências de data estão sinalizadas e resolvidas pela data mais cedo, conforme
[`duvidas-coordenacao.md`](duvidas-coordenacao.md).

---

# ⚠️ Próxima entrega — Checkpoint 1, sexta-feira 11/09/2026

**Quatro artefatos obrigatórios.** O que é cada um e como produzir está na seção 3.

- [ ] **Escopo** — documento que descreve o que o app faz, para quem, e sob quais regras
- [ ] **Protótipo navegável** — telas desenhadas e ligadas, em que dá para clicar e percorrer o fluxo
- [ ] **Backlog priorizado** — lista ordenada do que precisa ser construído, em quadro de tarefas
- [ ] **DER** — desenho das tabelas do banco e de como elas se ligam

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

Somente as entregas 4 e 9 recebem nota lançada. As outras são avaliadas de forma
indireta, e o mecanismo está explicado em cada uma.

---

# 1 · Registro das equipes — 14/08/2026

> **Prazo vencido.** Reprogramação tratada no item 1.3 de
> [`duvidas-coordenacao.md`](duvidas-coordenacao.md).

### Entregar

- [ ] Composição da equipe, em formulário próprio junto ao docente
- [ ] Indicação do **coordenador** — quem fala com o docente em nome da equipe
- [ ] Indicação do **responsável técnico pelo repositório** — quem administra o Git
- [ ] Atribuição técnica de cada integrante — o que cada um vai fazer no projeto

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
> validação formal do tema pelo docente. E os quatro artefatos de 11/09 descrevem o
> domínio — sem tema, nenhum deles pode ser escrito.

### Entregar

- [ ] Delimitação do domínio do problema, submetida para validação

**O que é "domínio do problema".** A área da vida real que o app vai atender, com seus
usuários, seus dados e suas regras. Não é a tecnologia, é o assunto: controle de
medicação, reserva de espaços, ordens de serviço.

### O domínio precisa ter

- Problema delimitado com clareza, com usuários identificáveis
- Regras de negócio explícitas
- Um fluxo principal de uso que justifique a existência da aplicação
- No mínimo **duas entidades principais** relacionadas entre si e sujeitas a regras de
  validação — "entidade" é cada coisa que o sistema guarda e que virará uma tabela no
  banco

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

Nada do trabalho de sexta é descartável, e fazê-lo bem agora reduz o esforço da N1.

### O que não é exigido em 11/09

Código em execução, autenticação implementada, aplicação parcial, pacote instalável,
testes. Aplicação parcial é a entrega 4, em 28/09.

### Formato da sessão

O norteador descreve como "verificação" (Seção 7.1) e como "apresentação do protótipo
navegável" (Semana 6). ADS1253 prevê 2 horas de acompanhamento dedicadas. Há dúvida
sobre existir submissão no ambiente virtual — ver item 2.2 do documento de dúvidas.

---

## 3.1 Escopo do projeto

**O que é.** O documento que descreve o que o aplicativo faz, para quem, e sob quais
regras. É a base dos outros três: protótipo, DER e backlog todos derivam dele. Cobre os
itens 2 a 7 do Apêndice A.1.

### Entregar

- [ ] **Contexto e caracterização do domínio** — que área é essa, como as pessoas
      resolvem esse problema hoje
- [ ] **Descrição do problema e justificativa** — o que está errado hoje, e por que um
      app resolve
- [ ] **Objetivo geral e objetivos específicos** — uma frase dizendo o que o app faz, e
      uma lista do que ele precisa entregar para isso
- [ ] **Público-alvo e personas** — quem usa
- [ ] **Requisitos funcionais e não funcionais**, identificados e priorizados
- [ ] **Regras de negócio** — mínimo de 3 não triviais (R4)

### Os termos que costumam gerar dúvida

**Persona.** Descrição de um usuário fictício mas realista, com nome, idade, ocupação,
o que precisa do app e o que o frustra hoje. Serve para você projetar a interface
pensando em alguém concreto em vez de num usuário genérico. Uma por perfil, então duas
ou três.

**Requisito funcional.** O que o sistema faz. Sempre uma ação.
_"RF07 — O sistema deve permitir consultar os registros cadastrados."_

**Requisito não funcional.** Qualidade que o sistema precisa ter, não ação que ele
executa. Desempenho, segurança, usabilidade, acessibilidade.
_"RNF04 — Toda tela que apresente dados deve tratar o estado de lista vazia."_

**Identificados e priorizados.** Identificado é ter código: `RF01`, `RNF01`, `RN01`.
Priorizado é cada um ter uma prioridade explícita — alta, média, baixa, ou o ciclo em
que será feito. Sem isso o item fica incompleto.

**Regra de negócio não trivial.** Uma condição do domínio que o sistema precisa fazer
valer, e que envolve mais de um dado ou mais de um passo. A diferença importa porque o
R4 exige que sejam não triviais:

| Trivial — não conta                | Não trivial — conta                                                                            |
| ---------------------------------- | ---------------------------------------------------------------------------------------------- |
| O e-mail precisa ter @             | Uma reserva não pode se sobrepor a outra no mesmo espaço e horário                             |
| O campo nome é obrigatório         | O prazo é calculado a partir da prioridade, e o registro é marcado como atrasado quando expira |
| A senha tem no mínimo 8 caracteres | Um registro só pode ser concluído se tiver foto anexada e diagnóstico preenchido               |

Validação de campo é validação de campo. Regra de negócio é uma decisão que o sistema
toma.

> Codificar desde já como `RF01`, `RNF01`, `RN01`. O Apêndice C exigirá, na N2, mapear
> cada requisito R1 a R14 para onde é verificável — a codificação agora evita
> retrabalho depois.

---

## 3.2 Protótipo navegável

**O que é.** O desenho das telas do app, ligadas entre si, em que dá para clicar e
percorrer o fluxo como se fosse o aplicativo de verdade. **"Navegável" é a palavra que
importa:** imagens soltas das telas não atendem — os botões precisam levar de uma tela
à outra.

Não exige código. Ferramenta de prototipação como Figma atende, conforme orientação de
ADS1253.

### Entregar

- [ ] **Mínimo de 6 telas** funcionais distintas, com navegação estruturada (R1)
- [ ] **Fluxo de autenticação e as duas visões de perfil** (R2)
- [ ] **Telas de manutenção de dados** das entidades principais — cadastrar, consultar,
      alterar e excluir (R3)
- [ ] **Listagem com filtro, ordenação ou busca, e a visão consolidada** (R9)
- [ ] **Estados de carregamento e de lista vazia** (R10)

### Os termos que costumam gerar dúvida

**Duas visões de perfil.** O app tem dois tipos de usuário com permissões diferentes, e
o protótipo tem de mostrar as duas. Se só existir o fluxo de um perfil, o R2 não está
coberto.

**Visão consolidada.** Uma tela ou painel que **resume** os dados em vez de listá-los:
contagem por situação, total, média, percentual, ou um gráfico. É diferente da
listagem. O R9 exige as duas coisas — a listagem com filtro **e** a visão consolidada.

**Estados de tela.** O que a tela mostra enquanto os dados carregam, e o que ela mostra
quando não há nada para listar. São dois quadros extras no protótipo, simples, mas o
R10 os exige explicitamente.

> **Duas armadilhas.** Protótipo com um só perfil não cobre o R2. E a visão consolidada
> do R9 é o requisito mais esquecido do projeto — ele não aparece na lista resumida do
> documento de ADS1253.

---

## 3.3 Backlog priorizado

**O que é.** A lista ordenada de tudo que o aplicativo precisa ter, quebrada em itens
pequenos, cada um escrito da perspectiva de quem vai usar. A ordem informa o que será
construído primeiro. É por ele que a equipe planeja e o docente acompanha o andamento.

**Onde vive.** Em ferramenta de quadro de tarefas, não em documento. A Seção 6.1 exige
que o quadro esteja acessível ao docente durante todo o semestre, e um arquivo entregue
uma vez não cumpre isso. Recomendação: **GitHub Projects**, porque fica no mesmo lugar
do repositório e vincula cada item aos commits que o implementam. Trello e Jira também
atendem.

### Entregar

- [ ] Quadro criado na ferramenta, com colunas de fluxo — por exemplo Backlog, A fazer,
      Em andamento, Concluído
- [ ] Um item por requisito funcional do escopo
- [ ] Prioridade marcada em cada item
- [ ] Um responsável nominal em cada item
- [ ] Quadro ordenado de modo que a prioridade fique visível
- [ ] Quadro acessível ao docente, com o endereço registrado junto ao do repositório

### Como escrever cada item

Dois formatos são aceitos. O de história de usuário é preferível, porque carrega o
motivo e ajuda na arguição.

**História de usuário** — `Como <perfil>, quero <ação> para <benefício>`

> Como técnico, quero ver apenas os registros atribuídos a mim, para saber o que
> atender hoje sem procurar na lista inteira.

**Requisito funcional** — referência ao código do escopo

> RF15 — O sistema deve listar os registros filtrados por situação e prioridade.

Cada item precisa ser pequeno o suficiente para caber em um ciclo e resultar em algo
demonstrável. "Fazer o aplicativo" não é um item. "Cadastrar cliente com validação dos
campos obrigatórios" é.

### O que "priorizado" significa

Não é ordenar por gosto. Cada item recebe uma prioridade explícita — um campo ou
etiqueta, ou a própria posição na coluna — e a ordem precisa ser **justificável**, porque
um dos eixos da arguição individual é exatamente os critérios de priorização do backlog.

Critério que se sustenta: primeiro o que os requisitos R1 a R14 obrigam, ordenado por
dependência técnica. Autenticação antes de CRUD, porque o CRUD depende de saber quem é
o usuário. CRUD antes das regras de negócio, porque as regras operam sobre os dados.
Persistência local antes da sincronização. O que é desejável e não pontua fica no fim.

### Quantos itens

As normas não fixam mínimo. O tamanho decorre da cobertura: o backlog precisa
contemplar os requisitos funcionais do escopo. Um app com 6 telas, 2 entidades com
manutenção completa e 3 regras de negócio costuma render entre 20 e 30 itens.

> **Onde reaparece.** Na N1, item 5, valendo 1,0 ponto, avaliado junto com a
> distribuição de responsabilidades e a regularidade do histórico de commits. E ao fim
> de cada ciclo é preciso registrar o que foi concluído, o que foi replanejado e quais
> impedimentos apareceram — o quadro é onde esse registro se sustenta.

---

## 3.4 DER do banco de dados

**O que é.** DER é diagrama entidade-relacionamento: o desenho das tabelas do banco de
dados e de como elas se ligam. Mostra o que o sistema guarda e como as informações se
referenciam.

Exigido pelo documento de ADS1253, que o vincula ao conteúdo da aula técnica —
modelagem relacional, normalização e integridade. Ou seja, será lido como banco de
dados, não como desenho.

### Entregar

- [ ] **Entidades com seus atributos** — cada tabela e seus campos
- [ ] **Chaves primárias e estrangeiras** explícitas
- [ ] **Cardinalidades** nos relacionamentos
- [ ] **Normalizado**
- [ ] Mínimo de **2 entidades principais** relacionadas (Seção 3.3)

### Os termos que costumam gerar dúvida

| Termo                      | O que é                                                                                                                                                                                        |
| -------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Entidade**               | Cada coisa que o sistema guarda e que vira uma tabela. Cliente, produto, pedido                                                                                                                |
| **Atributo**               | Cada campo da tabela. Nome, telefone, data de cadastro                                                                                                                                         |
| **Chave primária (PK)**    | O campo que identifica cada registro de forma única, normalmente um `id`                                                                                                                       |
| **Chave estrangeira (FK)** | O campo que aponta para o registro de outra tabela, criando o vínculo. Em `pedido`, um `cliente_id` que aponta para `cliente`                                                                  |
| **Cardinalidade**          | Quantos registros de um lado se ligam a quantos do outro. Um cliente tem muitos pedidos, e cada pedido pertence a um cliente: um para muitos                                                   |
| **Normalizado**            | Organizado para não repetir a mesma informação em lugares diferentes. Em vez de escrever o nome do cliente em cada pedido, o pedido guarda o `cliente_id` e o nome fica só na tabela `cliente` |
| **Integridade**            | As regras que impedem dado inconsistente — não deixar cadastrar um pedido apontando para um cliente que não existe, por exemplo                                                                |

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

### 4.1 Documento de projeto — estrutura do Apêndice A.1

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

Os itens 2 a 7 são o escopo de 11/09, revisado. Os itens 1, 9, 10 e 11 são novos.

### 4.2 Aplicação parcial em execução

**O único item que exige código rodando.**

- [ ] Navegação estruturada entre as telas
- [ ] Autenticação funcionando — cadastro e login de verdade
- [ ] Ao menos um módulo funcional integrado à persistência

**O que é "módulo integrado à persistência".** Uma funcionalidade completa que grava e
lê dados de verdade. Por exemplo: cadastrar um cliente, e ele continuar lá depois de
fechar e reabrir o app. Tela com dados fixos escritos no código não conta.

### 4.3 Definição arquitetural e memoriais

- [ ] **Definição arquitetural** — como o código é dividido em camadas de apresentação,
      negócio e persistência, e como elas conversam
- [ ] **Justificativa da pilha tecnológica** — por que essas tecnologias, avaliadas
      quanto a custo, curva de aprendizado, adequação ao domínio e implicações
      arquiteturais
- [ ] **Memorial de usabilidade e acessibilidade**, acompanhando o protótipo
- [ ] Backlog e distribuição de responsabilidades atualizados, com histórico de commits
      regular
- [ ] Apresentação presencial com participação de **todos** os integrantes

**O que é "memorial".** Um texto curto que explica e justifica as decisões tomadas. No
memorial do protótipo: por que essas cores e esse contraste, por que os botões têm esse
tamanho, por que as telas estão nessa ordem. Não basta entregar o protótipo — o item 3
cobra a justificativa.

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

- [ ] **Versão beta funcional**, demonstrada — o app rodando, não apresentação de slides
- [ ] **Persistência local e remota** operando, com sincronização de dados
- [ ] **Integração com pelo menos um serviço ou API externa**
- [ ] **Recurso nativo do dispositivo** integrado (previsto na Semana 14)

### Os termos que costumam gerar dúvida

**Persistência local.** Os dados guardados no próprio celular, para o app funcionar sem
internet.

**Persistência remota.** Os dados guardados em um servidor ou serviço fora do aparelho.

**Sincronização.** Os dois lados se manterem consistentes: o que foi criado offline
sobe quando a conexão volta, e o que mudou no servidor desce para o aparelho.

**Serviço ou API externa.** Um serviço de terceiros que o app consulta pela internet e
que é pertinente ao domínio — consulta de CEP, previsão do tempo, cotação de moeda.

**Recurso nativo.** Uma capacidade do próprio aparelho: câmera, geolocalização,
notificações, arquivos, biometria, sensores.

> Geolocalização conta como recurso nativo (R8), não como API externa (R7). São
> requisitos distintos e precisam de soluções distintas — ver item 3.3 do documento de
> dúvidas.

### O salto em relação à N1

Na N1 a arquitetura precisava estar **definida**. Aqui ela precisa estar **em
execução**, com dados sendo gravados e sincronizados.

---

# 6 · Testes com usuários — 09 a 13/11/2026

### Como isso pesa na nota

O produto desta etapa é avaliado na N2, item 3, valendo **1,5 ponto**.

### Entregar

- [ ] **Roteiro de testes funcionais** cobrindo os fluxos principais, com resultado
      esperado e resultado obtido registrados para cada caso
- [ ] **Sessões de usabilidade com no mínimo 5 usuários externos à equipe**,
      pertencentes ao perfil definido para a aplicação
- [ ] **Defeitos registrados com classificação de severidade**, acompanhados até a
      resolução ou a justificativa formal de não correção

### Os termos que costumam gerar dúvida

**Roteiro de testes funcionais.** Uma tabela com um caso de teste por linha: o que
fazer, o que se espera que aconteça, e o que aconteceu de fato. Exemplo de linha:
"tentar salvar cadastro sem preencher o nome → mensagem indicando o campo obrigatório →
obtido: mensagem exibida corretamente".

**Usuário externo à equipe.** Alguém que não é integrante do grupo e que corresponde ao
perfil de quem usaria o app. Cinco pessoas, no mínimo.

**Classificação de severidade.** Quão grave é cada defeito encontrado. Uma escala
simples resolve: impede o uso, atrapalha mas tem contorno, ou cosmético.

> **Atenção:** o mínimo de 5 usuários externos consta apenas do norteador e é um dos
> itens mais esquecidos. Depende de agendar pessoas de fora da equipe — combinar isso
> em outubro, não em novembro.

---

# 7 · Congelamento de escopo — 27/11/2026

### Entregar

- [ ] Desenvolvimento de novas funcionalidades encerrado
- [ ] **Pacote instalável gerado** — o arquivo APK ou AAB, que é o formato de
      distribuição de aplicativos Android
- [ ] Instalação testada em **dispositivo físico** — celular real, não emulador

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

> O item 8 é obrigatório e frequentemente esquecido. Se a equipe usou IA em qualquer
> etapa — código, redação ou pesquisa — precisa declarar, indicando para quê. Vale
> manter esse registro ao longo do semestre em vez de tentar reconstituir em dezembro.

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
      [`normas-e-processo.md`](normas-e-processo.md)
- [ ] Pacote APK ou AAB, com instruções de instalação
- [ ] **Credenciais de acesso para teste de cada perfil de usuário** — login e senha
      prontos para o professor entrar como cada tipo de usuário
- [ ] **Apêndice C preenchido**
- [ ] Relatório técnico final e README com instalação, execução e administração
- [ ] Apresentação com demonstração em dispositivo e arguição individual

**O que é o Apêndice C.** Uma tabela que já vem pronta no norteador, com os requisitos
R1 a R14 em linhas e duas colunas para preencher: se o requisito foi atendido, e **onde
ele é verificável** na aplicação ou no repositório. É de preenchimento obrigatório e
anexado à entrega. Preencher isso fica trivial se os requisitos estiverem codificados
desde o escopo.

**O que é "arguição individual".** Depois da apresentação, a banca pergunta a cada
integrante separadamente sobre o projeto — decisões de arquitetura, trechos de código,
o que você fez. Não conseguir explicar caracteriza ausência de autoria e reduz a
pontuação dos itens correspondentes.

### Condição de qualidade

A versão entregue deve estar livre de falhas que impeçam a execução de **qualquer
fluxo principal** declarado na documentação.
