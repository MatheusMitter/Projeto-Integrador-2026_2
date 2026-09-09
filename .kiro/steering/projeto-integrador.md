---
inclusion: always
---

# Projeto Integrador ADS 2026/2 — Contexto Permanente

> Este arquivo é carregado automaticamente em toda sessão. Leia antes de iniciar
> qualquer codificação, alteração ou continuidade de desenvolvimento.
>
> **Fontes normativas (as duas valem, e tratam do mesmo projeto):**
>
> 1. `Documento Norteador Projeto Integrador ADS 2026-2 (1).pdf` — PUC Goiás,
>    Escola Politécnica e de Artes, versão 2.0. **Norma superior em caso de conflito**,
>    por se declarar referência normativa do semestre.
> 2. `ADS1253 - AED - Projeto Integrador.pdf` — Prof. Welington Júlio, ADS1253.
>
> **Relação entre os dois.** Os dois documentos tratam do **mesmo projeto**. O
> segundo é o material da disciplina ADS1253 sobre o Projeto Integrador do Módulo:
> referencia a AED (Atividade Externa da Disciplina) apenas na abertura — capa,
> roteiro e slide de definição — para situar sob qual rubrica curricular o projeto é
> avaliado, e depois usa "AED ·" só como rótulo de cabeçalho e rodapé. As demais 25
> páginas especificam o Projeto Integrador, nos mesmos termos do norteador.
>
> A AED é a **rubrica avaliativa**, não um trabalho separado: atividade curricular de
> 8 horas-aula, equivalente a 10% da carga de ADS1253, distinta das horas de extensão.
> É por ela que a nota do projeto entra na disciplina, como PP1 e PP2. Não existe
> entrega paralela.
>
> Ao citar este segundo documento, referir-se a ele como **documento de ADS1253** ou
> material da disciplina — não como "documento da AED".
>
> Onde os dois divergem, ver a seção 9 (pendências de esclarecimento).
> Onde um exige algo que o outro não menciona, **vale a união** — o requisito conta.

---

## 1. Repositório

- **URL:** https://github.com/MatheusMitter/Projeto-Integrador-2026_2
- **Branch principal:** `main`
- **Visibilidade:** público (atende à Seção 9 do norteador)
- **Conta GitHub:** MatheusMitter (`gh` autenticado)

O endereço do repositório é informado na primeira entrega e **não pode mudar** até
o encerramento do semestre. Não recriar, não renomear, não tornar privado.

---

## 2. Disciplina de versionamento — obrigatória

O histórico de commits é a principal evidência de participação individual e afeta
diretamente a nota. Regras que valem para toda alteração:

- **Commit ao final de cada alteração significativa.** Nunca acumular trabalho
  sem versionar. A Seção 6.2 veda expressamente submissão concentrada de código
  em datas próximas às entregas.
- **Mensagens descritivas.** Mensagens genéricas ("update", "ajustes", "wip") são
  vedadas pelo norteador. Descrever o que mudou e por quê.
- **Histórico distribuído entre os integrantes.** Commits concentrados em uma só
  pessoa reduzem o Fator de Participação Individual dos demais (ver seção 6).
  Atenção: commits gerados nesta sessão entram sob a identidade de MatheusMitter.
  Os outros integrantes precisam de commits próprios e reais.
- **Estratégia de branches.** Mínimo exigido: `main` separada de branches de
  funcionalidade, com integração via Pull Request revisado por outro integrante.
- **README sempre atualizado** com instruções de instalação e execução (R13).

Formato de mensagem adotado:

```
<tipo>: <descrição no imperativo>

tipo ∈ docs | feat | fix | refactor | chore | test
```

Exemplo: `docs: adiciona requisitos funcionais e regras de negócio ao escopo`

---

## 3. Regras de código não negociáveis

- **Nenhuma credencial, chave ou senha versionada.** Usar variáveis de ambiente
  com arquivo `.env` no `.gitignore` e um `.env.example` versionado (Seção 6.2 e R12).
- **Separação em camadas:** apresentação, negócio e persistência distintas e com
  comunicação explícita entre elas (R12).
- **Nomenclatura consistente** e ausência de trechos comentados sem uso (R12).
- **Tratamento explícito de falhas** — o app não pode quebrar com entrada inválida
  ou falha de rede (R10).
- Não reproduzir tutoriais, repositórios públicos ou projetos de semestres
  anteriores. Isso caracteriza plágio e zera a etapa (Seção 9.1).
- Uso de IA é permitido, mas **deve ser declarado no relatório final** com
  indicação das finalidades (Seção 9.1). Manter registro do que foi gerado com
  auxílio de IA ao longo do semestre.

---

## 4. Requisitos obrigatórios (R1–R14) — a especificação do produto

Todos são obrigatórios. Descumprir qualquer um reduz a pontuação técnica.

| Nº  | Requisito                    | Mínimo exigido                                                                                                      |
| --- | ---------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| R1  | Telas e navegação            | 6+ telas funcionais distintas, navegação estruturada e coerente                                                     |
| R2  | Autenticação e perfis        | Cadastro e login, com 2+ perfis de permissões distintas                                                             |
| R3  | CRUD                         | Inclusão, consulta, alteração e exclusão em 2+ entidades, com validação de entrada                                  |
| R4  | Regras de negócio            | 3+ regras não triviais, documentadas e verificáveis na aplicação                                                    |
| R5  | Persistência local           | Armazenamento local estruturado, com comportamento definido sem conectividade                                       |
| R6  | Persistência remota          | Serviço de retaguarda com sincronização (API própria ou BaaS)                                                       |
| R7  | Integração externa           | 1+ serviço ou API externa pertinente ao domínio                                                                     |
| R8  | Recurso nativo               | 1+ recurso do aparelho: câmera, geolocalização, notificações, arquivos, biometria ou sensores                       |
| R9  | Consulta e apresentação      | Listagens com filtro, ordenação ou busca **e** 1+ visão consolidada (resumo, indicador ou gráfico)                  |
| R10 | Erros e estados              | Tratamento de falhas, mensagens ao usuário, estados de carregamento e de lista vazia                                |
| R11 | Usabilidade e acessibilidade | Heurísticas de usabilidade, contraste adequado, áreas de toque conforme a plataforma, rótulos para leitores de tela |
| R12 | Organização do código        | Camadas, nomenclatura consistente, sem credenciais no código, sem código morto                                      |
| R13 | Versionamento                | Git com histórico distribuído, commits descritivos, README de instalação e execução                                 |
| R14 | Distribuição                 | Pacote APK ou AAB gerado e execução comprovada em dispositivo físico                                                |

**R9 é o requisito mais esquecido.** Filtro/busca e a visão consolidada precisam
existir explicitamente.

Tecnologias admitidas (Seção 4): Android nativo (Kotlin/Java), Flutter ou
React Native (Expo permitido). Retaguarda: API própria (Spring Boot, Node.js,
FastAPI) ou BaaS (Firebase, Supabase). A escolha **deve ser justificada** no
documento de projeto quanto a custo, curva de aprendizado, adequação ao domínio e
implicações arquiteturais. Vedado: web responsiva sem empacotamento móvel e
no-code/low-code sem código autoral.

---

## 5. Calendário

Onde as datas divergem entre os dois documentos, adotar a **data mais cedo** até
que a coordenação esclareça (ver seção 9).

| Marco                      | Data                                   | Entregáveis                                                                                           |
| -------------------------- | -------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| **Checkpoint 1**           | **11/09/2026**                         | Escopo, protótipo navegável, backlog priorizado **e DER** (o DER é exigido pelo documento de ADS1253) |
| Entrega e apresentação N1  | 28/09 a 02/10/2026 (ADS1253 diz 29/09) | 6 itens pontuados (ver seção 6)                                                                       |
| Avaliação Interdisciplinar | 03/11/2026                             | 1,0 pt na N2, institucional, fora do projeto (só no documento de ADS1253)                             |
| Checkpoint 2               | 06/11/2026                             | Versão beta com persistência local + remota e API externa                                             |
| Testes com usuários        | 09 a 13/11/2026 (ADS1253 diz 10/11)    | Testes funcionais + usabilidade com **5+ usuários externos**                                          |
| Congelamento de escopo     | 27/11/2026                             | Fim do desenvolvimento de novas funcionalidades                                                       |
| Documentação final         | 04/12/2026                             | Relatório técnico, pacote instalável, repositório                                                     |
| Entrega e apresentação N2  | 07 a 11/12/2026 (ADS1253 diz 08/12)    | Mostra final com banca e arguição individual                                                          |

**O Checkpoint 1 não é a N1.** O checkpoint verifica especificação e não tem
pontuação própria, mas alimenta o FPI. A N1 é em 28/09 e exige, além dos
artefatos do checkpoint, **aplicação parcial em execução** valendo 2,0 pontos —
navegação estruturada, autenticação e um módulo integrado à persistência.

Normas de entrega (Seção 9): submissão via AVA até 23h59 da data limite; PDFs
nomeados `PI2026-2_NomeDaEquipe_Etapa.pdf`; atraso custa 20% por dia, no máximo
3 dias, depois zera. Na N2, o APK vai acompanhado de credenciais de teste para
cada perfil de usuário.

Apresentações: 20 minutos + até 10 minutos de arguição, com todos os integrantes
apresentando. Blocos: contextualização (3 min), especificação (4 min), decisões
técnicas (5 min), demonstração (6 min), encerramento (2 min).

### 5.1 Obrigações de processo que só constam no norteador

Estes itens não aparecem no documento de ADS1253 e são o principal risco de omissão.
Vários valem ponto.

**Gestão (Seção 6.1)** — backlog em ferramenta de gestão de tarefas, com itens em
formato de história de usuário ou requisito funcional, priorizados e atribuídos a
responsáveis; quadro acessível ao docente durante todo o semestre; registro ao
término de cada ciclo do que foi concluído, replanejado e dos impedimentos.

**Qualidade e testes (Seção 6.3)** — roteiro de testes funcionais com resultado
esperado e obtido por caso; sessões de usabilidade com **no mínimo 5 usuários
externos** à equipe e do perfil definido; defeitos registrados com classificação de
severidade e acompanhados até resolução ou justificativa formal; versão da N2 livre
de falhas que impeçam qualquer fluxo principal declarado.

**Entregas indissociáveis (Seção 3.1)** — produto de software, artefatos de
engenharia e comunicação técnica. A ausência de qualquer uma zera a etapa.

**Equipe (Seção 3.2 e 8.4)** — alteração de composição após a Semana 4 só em
situação excepcional; integrante ausente ou omisso deve ser comunicado
formalmente até o Checkpoint correspondente, pois comunicação feita só na entrega
final não retroage.

**Apêndices operacionais** — Apêndice B: ficha de distribuição de
responsabilidades, atualizada por ciclo e apresentada nos checkpoints.
Apêndice C: lista de verificação R1–R14, de preenchimento obrigatório e anexada à
entrega da N2, indicando onde cada requisito é verificável.

**Vedações (Seções 3.3, 4 e 9.1)** — web responsiva sem empacotamento móvel;
no-code ou low-code sem código autoral; listagens estáticas, calculadoras simples
ou agregadores sem tratamento de dados; reprodução de tutoriais ou repositórios
públicos; reaproveitamento de projetos de semestres anteriores. Plágio zera a etapa.

**Ausência na apresentação (Seção 9)** — zera o item de apresentação para o
discente ausente, salvo justificativa formal amparada por norma institucional.

---

## 6. Avaliação

**N1 — 10,0 pontos:** documento de projeto 2,5 · modelagem e arquitetura 1,5 ·
protótipo navegável 2,0 · aplicação parcial em execução 2,0 · gestão do projeto
(backlog e versionamento) 1,0 · apresentação e defesa técnica 1,0.

**N2 — 10,0 pontos:** aplicação concluída (R1–R14) 3,5 · qualidade técnica 2,0 ·
verificação e testes 1,5 · relatório técnico e README 1,5 · apresentação final 1,5.

**Fator de Participação Individual (FPI):** a nota individual é a nota da equipe
**multiplicada** por um fator de 0,00 a 1,00, atribuído com base no histórico de
contribuições no repositório, na distribuição de responsabilidades, no desempenho
nos checkpoints e na arguição individual. É o maior risco individual do projeto —
por isso a seção 2 deste documento não é opcional.

A impossibilidade de explicar decisões de implementação na arguição caracteriza
ausência de autoria e reduz a pontuação dos itens correspondentes. Todo código
gerado precisa ser compreendido pelos integrantes.

---

## 7. Estado atual do projeto

Atualizar esta seção conforme as decisões forem tomadas.

| Item                                 | Situação                                             |
| ------------------------------------ | ---------------------------------------------------- |
| Repositório                          | ✅ criado e público                                  |
| Composição da equipe                 | ⏳ a definir (norteador pede 3 a 4 integrantes)      |
| Nome da equipe                       | ⏳ a definir (necessário para nomear os PDFs)        |
| Coordenador da equipe                | ⏳ a definir                                         |
| Responsável técnico pelo repositório | ⏳ a definir                                         |
| Domínio do problema / tema           | ⏳ a definir — **bloqueia todos os artefatos**       |
| Pilha tecnológica                    | ⏳ a definir — depende do esclarecimento do item 9.3 |
| Ferramenta de backlog                | ⏳ a definir                                         |
| Ferramenta de protótipo              | ⏳ a definir                                         |
| Escopo do projeto                    | ⏳ a produzir                                        |
| Protótipo navegável                  | ⏳ a produzir                                        |
| Backlog priorizado                   | ⏳ a produzir                                        |
| Modelagem de dados (DER)             | ⏳ a produzir                                        |

Observação de cronograma: a equipe informou que o cronograma está sendo adaptado
pelo docente e que os itens previstos para as semanas anteriores podem ser
entregues em 11/09.

---

## 8. Conteúdo do documento de projeto (Apêndice A.1 do norteador)

Estrutura exigida na entrega da N1:

1. Capa e identificação da equipe, com atribuição técnica de cada integrante
2. Contexto e caracterização do domínio do problema
3. Descrição do problema e justificativa da solução
4. Objetivo geral e objetivos específicos da aplicação
5. Público-alvo e personas
6. Requisitos funcionais e não funcionais, identificados e priorizados
7. Regras de negócio, com identificação e comportamento esperado
8. Modelagem de dados e diagramas pertinentes
9. Definição arquitetural e justificativa da pilha tecnológica
10. Cronograma interno da equipe, com distribuição de responsabilidades por ciclo
11. Referências utilizadas

Codificar os itens como `RF01`, `RNF01`, `RN01`. O Apêndice C exige, na N2, mapear
cada requisito R1–R14 para o local onde ele é verificável na aplicação ou no
repositório — a codificação desde o início evita retrabalho.

---

## 9. Pendências de esclarecimento com a coordenação

Divergências identificadas no cruzamento dos dois documentos normativos. Enquanto
não houver resposta, adotar a interpretação mais conservadora indicada.

### Contradições factuais (pedir correção)

**9.1 Datas de três janelas de entrega.** N1: 28/09 (norteador) contra 29/09 (ADS1253).
Testes: 09/11 contra 10/11. N2: 07/12 contra 08/12. O norteador roda semanas de
segunda a sexta; o documento de ADS1253 desloca o início para terça.
→ Interpretação adotada: **data mais cedo**.

**9.2 Piso de integrantes por equipe.** A Seção 3.2 do norteador afirma, em
marcadores consecutivos, "3 (três) a 4 (quatro) discentes" e "não serão admitidas
equipes com número inferior a 4 integrantes". Contradição interna. O documento de ADS1253 adota 3.
→ Pendente. Afeta diretamente a autorização de equipe com 2 integrantes, prevista
como exceção na própria Seção 3.2.

### Restrições implícitas (pedir esclarecimento)

**9.3 JDBC/DAO versus backend como serviço.** A Seção 4 do norteador admite
Firebase, Supabase ou equivalentes. O documento de ADS1253 afirma que a persistência remota é
construída com JDBC, DAO e transações, o que exclui BaaS na prática e exige
retaguarda em Java. **Maior impacto arquitetural — resolver antes de escolher a pilha.**

Como o projeto é avaliado dentro de ADS1253 — Programação Orientada a Objeto com
Banco de Dados —, há expectativa legítima de que exercite o conteúdo da disciplina.
Isso desloca a probabilidade para a retaguarda em Java.

→ Interpretação adotada: **retaguarda própria em Java (Spring Boot) com DAO sobre
JDBC**, porque essa escolha satisfaz os dois documentos simultaneamente — a Seção 4
do norteador admite expressamente "API própria (Spring Boot)", e o documento de ADS1253 tem seu
conteúdo contemplado. BaaS satisfaz apenas o norteador e carrega risco normativo.
Confirmar com o docente; se BaaS for liberado, reavaliar pelo custo de esforço.

**9.4 Checklist de 8 itens do documento de ADS1253 versus os 14 requisitos da Seção 5.** O checklist
de ADS1253 omite R4 (número mínimo de 3 regras), **R9 por completo**, os estados de
interface de R10, os critérios objetivos de R11 e parte de R12.
→ Interpretação adotada: **valem os 14 requisitos do norteador**.

**9.5 Geolocalização como API externa.** O documento de ADS1253 cita geolocalização como exemplo de
API externa (R7) e também como recurso nativo (R8). No norteador ela é apenas R8.
→ Interpretação adotada: geolocalização atende **somente R8**. R7 exige um serviço
externo distinto.

### Ambiguidades (pedir esclarecimento)

**9.6 Conversão da pontuação — resolvido, não é divergência.** O norteador diz que
cada etapa vale 10,0 pontos "integralmente distribuídos entre itens obrigatórios";
o documento de ADS1253 apresenta N1 = P1 + PP1 + Ex1 e N2 = (P2 + PP2 + Ex2) + AI, com o projeto
entrando como PP1/PP2 de até 4,0 pontos.

Os dois são compatíveis: os 10,0 do norteador são a **escala interna do projeto**,
e o documento de ADS1253 descreve como essa nota é convertida proporcionalmente para compor até 4,0
pontos dentro da nota da disciplina. É consequência direta de a AED ser a rubrica
pela qual o Projeto Integrador é avaliado em ADS1253. Mantido aqui apenas como item
de confirmação, não como conflito.

**9.7 Formato do Checkpoint 1.** A Seção 9 determina que todas as entregas sejam
via AVA até 23h59, e o Checkpoint 1 consta da Seção 7. Mas a Seção 7.1 o descreve
como "verificação", a Semana 6 como "apresentação", e o documento de ADS1253 como acompanhamento
presencial de 2 horas.
→ Confirmar se há upload no AVA e se o endereço do repositório deve ser informado
nesse momento, conforme a exigência da Seção 9 de informá-lo "no ato da primeira
entrega".

**9.8 Reprogramação dos prazos vencidos.** Registro de equipe (14/08) e submissão de
tema (21/08) venceram nos dois documentos. O documento de ADS1253 reprograma na prática, adotando
como critério que estejam fechados antes do Checkpoint 1. A Seção 7 do norteador
exige que ajustes de calendário sejam divulgados oficialmente pela coordenação com
aviso prévio mínimo de 7 dias, e a Seção 3.3 condiciona o desenvolvimento à
validação formal do tema.
→ Solicitar formalização por escrito da nova data-limite, para afastar a incidência
da multa de 20% por dia da Seção 9.

### Imprecisão menor

**9.9** O documento de ADS1253 afirma que o projeto é "o maior peso individual da avaliação". A conta
de 8,0 em 20,0 está correta, mas as provas somam o mesmo (P1 + P2 = 8,0). É empate,
não maioria.
