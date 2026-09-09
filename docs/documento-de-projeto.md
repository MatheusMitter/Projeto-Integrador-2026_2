# Documento de Projeto — Projeto Integrador ADS 2026/2

**Aplicação:** sistema móvel de gestão de ordens de serviço para assistência técnica
**Nome de trabalho:** GOS — Gestão de Ordens de Serviço
**Instituição:** PUC Goiás — Escola Politécnica e de Artes — Tecnologia em Análise e Desenvolvimento de Sistemas
**Repositório:** https://github.com/MatheusMitter/Projeto-Integrador-2026_2

---

## 1. Identificação da equipe

> Seção a completar com os dados dos integrantes. A atribuição técnica é exigida pelo
> Apêndice A.1 do norteador e é um dos critérios do Fator de Participação Individual.

| Integrante | Matrícula | Atribuição técnica |
| --- | --- | --- |
| Matheus Mitter | *a preencher* | *a definir* |
| *a preencher* | *a preencher* | *a definir* |

**Nome da equipe:** *a definir* — necessário para nomear os PDFs no padrão
`PI2026-2_NomeDaEquipe_Etapa.pdf`
**Coordenador:** *a definir*
**Responsável técnico pelo repositório:** *a definir*

---

## 2. Contexto e caracterização do domínio

Empresas de pequeno porte que prestam assistência técnica — refrigeração, linha
branca, informática, manutenção predial — operam com um fluxo de trabalho que nasce
de um contato informal e termina em um serviço executado em campo. Entre esses dois
pontos existe um conjunto de informações que precisa ser registrado, roteado e
recuperado: quem pediu, qual equipamento, qual defeito, quem atendeu, o que foi feito
e se o cliente aprovou.

Na prática, esse controle é feito por aplicativo de mensagens combinado com planilha
ou caderno. O chamado chega por texto, alguém anota, o técnico recebe o endereço por
mensagem e o histórico do equipamento existe apenas na memória de quem atendeu na
última vez.

O domínio tem três características que o tornam adequado a uma aplicação móvel. O
trabalho acontece fora do escritório, o que exige acesso pelo celular e tolerância a
conectividade instável. Existem papéis com necessidades e permissões distintas: quem
abre o chamado quer visibilidade do andamento, quem executa precisa de instruções e
de um meio de comprovar o que fez. E há regras de prazo e de sequência que não são
opcionais — um serviço não pode ser concluído antes de ser iniciado, e um chamado
crítico não pode competir em igualdade com um chamado de rotina.

---

## 3. Descrição do problema e justificativa

### 3.1 Problema

A ausência de um registro estruturado do ciclo de vida do atendimento produz quatro
efeitos observáveis:

**Perda de histórico por equipamento.** Sem vínculo entre o chamado e o equipamento
atendido, não é possível saber se um defeito é recorrente. Um compressor que falha
pela terceira vez em seis meses é tratado como um chamado novo.

**Ausência de controle de prazo.** Sem prazo derivado da criticidade, todo chamado é
urgente ou nenhum é. A priorização acontece por pressão de quem reclama mais, não por
critério.

**Técnico sem informação em campo.** O endereço e a descrição chegam fragmentados em
mensagens. Informação que existia no chamado anterior não é recuperável no local.

**Cliente sem visibilidade.** A única forma de saber o andamento é perguntar, o que
gera trabalho de atendimento que não agrega ao serviço.

### 3.2 Justificativa da solução

A solução proposta é uma aplicação móvel que registra o ciclo de vida da ordem de
serviço em uma máquina de estados explícita, vincula cada ordem a um cliente e a um
equipamento, deriva prazo a partir da prioridade e exige comprovação fotográfica
antes da conclusão.

A escolha do domínio observa as condições da Seção 3.3 do norteador. Os usuários são
identificáveis e possuem necessidades distintas. As entidades principais — ordem de
serviço e equipamento — são relacionadas e sujeitas a regras de validação. E a
solução não se reduz a listagem estática, calculadora ou agregador de conteúdo: o
valor está no tratamento do dado ao longo de um fluxo com transições controladas.

A operação em campo justifica organicamente três requisitos que, em outros domínios,
tendem a ser artificiais. A persistência local existe porque o técnico trabalha em
locais sem sinal. A câmera existe porque a comprovação do serviço é uma necessidade
real do negócio. E a consulta de endereço por CEP existe porque o cadastro de cliente
é feito por telefone, com margem de erro na transcrição do endereço.

---

## 4. Objetivos

### 4.1 Objetivo geral

Desenvolver uma aplicação móvel que controle o ciclo de vida de ordens de serviço em
assistência técnica, garantindo rastreabilidade das transições de estado,
cumprimento de prazos derivados da criticidade e comprovação da execução em campo,
com operação tolerante à ausência de conectividade.

### 4.2 Objetivos específicos

- Implementar controle de acesso com dois perfis de permissões distintas, solicitante
  e técnico.
- Registrar clientes e equipamentos com operações completas de manutenção de dados e
  validação de entrada.
- Implementar a máquina de estados da ordem de serviço, rejeitando transições
  inválidas e registrando cada mudança em trilha de auditoria.
- Derivar e monitorar o prazo de atendimento a partir da prioridade da ordem.
- Capturar evidência fotográfica georreferenciada como condição para conclusão.
- Consultar endereço a partir do CEP em serviço externo, reduzindo erro de cadastro.
- Manter os dados operacionais em base local e sincronizá-los com a retaguarda ao
  restabelecimento da conexão.
- Apresentar visão consolidada com indicadores de volume, aderência a prazo e tempo
  médio de atendimento.

---

## 5. Público-alvo e personas

**Público-alvo.** Prestadores de assistência técnica de pequeno porte, com equipe de
1 a 10 técnicos, que atendem clientes em campo e hoje controlam chamados por
mensagens e planilhas. Secundariamente, os clientes atendidos por essas empresas.

### Persona 1 — Rafaela Torres, solicitante

34 anos, gerente de uma padaria com duas unidades. Aciona a assistência quando algum
equipamento de refrigeração falha, o que representa risco imediato de perda de
estoque. Usa o celular durante todo o expediente, mas em intervalos curtos.

O que precisa: abrir o chamado em poucos toques, informar a criticidade real,
acompanhar o andamento sem telefonar e confirmar que o serviço foi concluído a
contento.

O que a frustra: descobrir que o chamado aberto ontem não foi registrado, e não saber
se o técnico vem hoje ou na semana que vem.

### Persona 2 — Jorge Almeida, técnico

41 anos, técnico em refrigeração com 15 anos de experiência. Atende de 4 a 7 chamados
por dia, dirigindo entre eles. Celular Android intermediário, plano de dados
limitado, frequentemente em casas de máquinas e subsolos sem sinal.

O que precisa: ver os chamados atribuídos com endereço e histórico do equipamento,
registrar o que fez sem digitar muito, e comprovar a execução com foto.

O que o frustra: chegar ao local e descobrir que a informação do defeito está errada,
e perder registro por falta de sinal na hora de salvar.

---

## 6. Requisitos

Prioridade: **E** essencial, entrega até a N1 · **I** importante, entrega até o
Checkpoint 2 · **D** desejável, entrega até o congelamento de escopo.

### 6.1 Requisitos funcionais

| Código | Requisito | Prior. | Atende |
| --- | --- | --- | --- |
| RF01 | Cadastrar usuário informando nome, e-mail, senha e perfil | E | R2 |
| RF02 | Autenticar usuário por e-mail e senha | E | R2 |
| RF03 | Encerrar sessão | E | R2 |
| RF04 | Recuperar sessão previamente autenticada ao reabrir o aplicativo | I | R2, R5 |
| RF05 | Restringir funcionalidades e dados conforme o perfil do usuário | E | R2 |
| RF06 | Cadastrar cliente com endereço preenchido a partir do CEP | E | R3, R7 |
| RF07 | Listar e consultar clientes | E | R3 |
| RF08 | Alterar dados de cliente | E | R3 |
| RF09 | Excluir cliente sem ordens de serviço vinculadas | E | R3 |
| RF10 | Cadastrar equipamento vinculado a um cliente | E | R3 |
| RF11 | Listar equipamentos de um cliente | E | R3 |
| RF12 | Alterar dados de equipamento | E | R3 |
| RF13 | Excluir equipamento sem ordens de serviço vinculadas | E | R3 |
| RF14 | Abrir ordem de serviço informando cliente, equipamento, prioridade e descrição do problema | E | R3, R4 |
| RF15 | Listar ordens de serviço com filtro por situação e prioridade e busca por número ou cliente | I | R9 |
| RF16 | Consultar ordem de serviço com linha do tempo das transições | I | R9 |
| RF17 | Aceitar ordem de serviço disponível, assumindo-a como técnico responsável | I | R4 |
| RF18 | Iniciar a execução de ordem de serviço aceita | I | R4 |
| RF19 | Registrar diagnóstico técnico na ordem de serviço | I | R3 |
| RF20 | Concluir ordem de serviço | I | R4 |
| RF21 | Validar ordem de serviço concluída | I | R4 |
| RF22 | Cancelar ordem de serviço ainda não iniciada, com justificativa | D | R4 |
| RF23 | Capturar evidência fotográfica da execução pela câmera do dispositivo | I | R8 |
| RF24 | Registrar as coordenadas geográficas no momento da captura da evidência | I | R8 |
| RF25 | Apresentar painel consolidado com contagem por situação, aderência a prazo e tempo médio de atendimento | I | R9 |
| RF26 | Operar as funcionalidades de consulta e registro sem conectividade, mantendo fila de pendências | I | R5 |
| RF27 | Sincronizar as pendências com a retaguarda ao restabelecimento da conexão | I | R5, R6 |
| RF28 | Notificar o técnico quando uma ordem de serviço atribuída se aproximar do prazo | D | R8 |

### 6.2 Requisitos não funcionais

| Código | Requisito | Prior. | Atende |
| --- | --- | --- | --- |
| RNF01 | Relação de contraste mínima de 4,5:1 entre texto e plano de fundo | E | R11 |
| RNF02 | Áreas de toque com dimensão mínima de 48 dp | E | R11 |
| RNF03 | Elementos interativos com rótulo descritivo acessível a leitores de tela | E | R11 |
| RNF04 | Toda tela que apresente dados deve tratar os estados de carregamento, lista vazia e erro | E | R10 |
| RNF05 | Falha de rede deve produzir mensagem ao usuário sem encerrar a aplicação | E | R10 |
| RNF06 | Entrada inválida deve ser rejeitada com indicação do campo e do motivo | E | R3, R10 |
| RNF07 | Senhas armazenadas exclusivamente como resumo criptográfico | E | R12 |
| RNF08 | Nenhuma credencial, chave ou segredo versionado no repositório | E | R12 |
| RNF09 | Código organizado em camadas de apresentação, negócio e persistência | E | R12 |
| RNF10 | Listagem de até 100 ordens de serviço renderizada em até 2 segundos a partir da base local | I | — |
| RNF11 | Pacote instalável compatível com Android 8.0 ou superior | I | R14 |

---

## 7. Regras de negócio

### RN01 — Transições válidas da ordem de serviço

A ordem de serviço percorre as situações `ABERTA`, `ATRIBUIDA`, `EM_EXECUCAO`,
`CONCLUIDA` e `VALIDADA`, admitindo `CANCELADA` como término alternativo.

São permitidas exclusivamente as transições:

| Origem | Destino permitido | Perfil autorizado |
| --- | --- | --- |
| `ABERTA` | `ATRIBUIDA`, `CANCELADA` | Técnico aceita · Solicitante cancela |
| `ATRIBUIDA` | `EM_EXECUCAO`, `CANCELADA` | Técnico responsável |
| `EM_EXECUCAO` | `CONCLUIDA` | Técnico responsável |
| `CONCLUIDA` | `VALIDADA` | Solicitante que abriu |
| `VALIDADA`, `CANCELADA` | — | Situações terminais |

Qualquer tentativa de transição fora desta tabela é rejeitada, com mensagem ao
usuário. Toda transição efetivada gera registro em `os_evento` com situação anterior,
situação nova, autor e instante.

**Verificável em:** tela de detalhe da ordem de serviço, onde apenas as ações válidas
para a situação e o perfil corrente são apresentadas, e na linha do tempo.

### RN02 — Prazo derivado da prioridade

O prazo de atendimento é calculado na abertura, a partir do instante de abertura e da
prioridade informada:

| Prioridade | Prazo |
| --- | --- |
| `BAIXA` | 72 horas |
| `MEDIA` | 48 horas |
| `ALTA` | 24 horas |
| `CRITICA` | 8 horas |

Ordem cujo prazo tenha expirado e cuja situação não seja terminal é sinalizada como
atrasada na listagem e no painel consolidado. O prazo não é recalculado por mudança
de responsável, apenas por alteração de prioridade, o que gera novo registro na linha
do tempo.

**Verificável em:** indicador de aderência a prazo no painel, e marcação visual na
listagem.

### RN03 — Limite de ordens em execução por técnico

Um técnico não pode ter mais de 5 ordens de serviço simultaneamente na situação
`EM_EXECUCAO`. A tentativa de iniciar a sexta é bloqueada com mensagem indicando o
limite e a quantidade atual.

A regra existe para impedir que o aceite de chamados seja usado como reserva, o que
retiraria ordens da fila disponível sem que houvesse execução efetiva.

**Verificável em:** ação de iniciar execução, com o técnico já no limite.

### RN04 — Conclusão condicionada a evidência

A transição de `EM_EXECUCAO` para `CONCLUIDA` exige que a ordem possua ao menos uma
evidência fotográfica do tipo `DEPOIS` e que o campo de diagnóstico esteja preenchido.
Sem essas condições, a ação de concluir permanece indisponível, com indicação do que
falta.

**Verificável em:** tela de conclusão, com e sem evidência registrada.

### RN05 — Validação restrita ao solicitante

A transição de `CONCLUIDA` para `VALIDADA` é permitida exclusivamente ao usuário de
perfil solicitante que abriu a ordem. O técnico responsável não pode validar a própria
execução, ainda que possua sessão ativa.

**Verificável em:** tela de detalhe da ordem concluída, comparando as ações
disponíveis nos dois perfis.

---

## 8. Modelagem de dados

O modelo relacional, o dicionário de dados e as decisões de normalização estão em
[`docs/der.md`](der.md).

Entidades: `usuario`, `cliente`, `equipamento`, `ordem_servico`, `os_evento` e
`os_evidencia`.

As entidades principais do domínio, para efeito do R3, são `ordem_servico` e
`equipamento`, ambas com operações completas de manutenção de dados. `cliente` também
recebe operações completas.

---

## 9. Definição arquitetural

### 9.1 Organização em camadas

A aplicação móvel e a retaguarda seguem a mesma separação de responsabilidades,
exigida pelo R12.

**Aplicativo**

| Camada | Responsabilidade | Não pode |
| --- | --- | --- |
| Apresentação | Telas, navegação, estados de interface | Conter regra de negócio ou consultar base diretamente |
| Negócio | Validações, máquina de estados, cálculo de prazo, orquestração da sincronização | Conhecer componentes de interface |
| Persistência | Base local, cliente da API, cliente do serviço de CEP | Conter regra de negócio |

**Retaguarda**

| Camada | Responsabilidade |
| --- | --- |
| Controlador | Exposição dos recursos HTTP, serialização, códigos de resposta |
| Serviço | Regras de negócio, controle transacional |
| DAO | Acesso a dados por JDBC, mapeamento entre registro e objeto |

As regras RN01 a RN05 são implementadas na camada de negócio de ambos os lados. A
duplicação é deliberada: o aplicativo precisa aplicá-las em operação offline, e a
retaguarda não pode confiar em validação feita no cliente.

### 9.2 Pilha tecnológica e justificativa

| Componente | Escolha |
| --- | --- |
| Aplicativo | React Native com Expo, em TypeScript |
| Navegação | React Navigation |
| Persistência local | SQLite via `expo-sqlite` |
| Recursos nativos | `expo-camera`, `expo-location`, `expo-notifications` |
| Retaguarda | Java com Spring Boot, DAO sobre JDBC |
| Base remota | PostgreSQL |
| Serviço externo | ViaCEP |

**Aplicativo — React Native com Expo.** A alternativa considerada foi Android nativo
com Kotlin. React Native foi escolhido pela proximidade com JavaScript e TypeScript,
o que reduz a curva de aprendizado para uma equipe pequena, e pelo ciclo de
desenvolvimento mais curto com Expo. O custo dessa escolha é a dependência de uma
camada de abstração para acesso a recursos nativos, aceitável porque os recursos
utilizados — câmera, localização e notificações — têm suporte maduro no Expo. Flutter
foi descartado por exigir aprendizado de uma linguagem adicional sem ganho
correspondente no escopo deste projeto.

**Retaguarda — Spring Boot com DAO sobre JDBC.** A Seção 4 do norteador admite tanto
interface de programação própria quanto plataforma de backend como serviço. A opção
por API própria em Java com padrão DAO sobre JDBC decorre de dois fatores. O primeiro
é de conformidade: essa configuração atende simultaneamente ao norteador e à
orientação do material de ADS1253, que indica JDBC, DAO e transações como base da
persistência remota, enquanto uma plataforma de backend como serviço atenderia apenas
ao primeiro documento. O segundo é de controle sobre o comportamento transacional
exigido pela RN03, cuja verificação de limite e subsequente atualização precisam
ocorrer sob a mesma transação para evitar condição de corrida entre dois aceites
simultâneos.

O custo reconhecido é o esforço adicional de implementar e hospedar a retaguarda,
comparado à alternativa gerenciada. Firebase e Supabase foram avaliados e
descartados por esse motivo de conformidade, registrado no item 1.2 de
[`docs/duvidas-coordenacao.md`](duvidas-coordenacao.md).

**Base remota — PostgreSQL.** Escolhida pela aderência a SQL padrão, disponibilidade
em camada gratuita de hospedagem e suporte nativo a tipos de data e hora com fuso, o
que importa para o cálculo de prazo da RN02.

**Persistência local — SQLite.** Escolhida por ser relacional, o que permite manter no
dispositivo o mesmo modelo da retaguarda e reduzir a tradução entre os dois lados. A
alternativa de armazenamento chave-valor foi descartada porque as consultas com filtro
e ordenação exigidas pelo RF15 e os indicadores do RF25 são naturalmente expressos em
SQL.

**Serviço externo — ViaCEP.** Consulta de endereço a partir do CEP no cadastro de
cliente, atendendo ao R7. É gratuito e não exige chave de acesso. A pertinência ao
domínio é direta: o cadastro é feito por telefone e o endereço é o dado que o técnico
usa para chegar ao local. O tratamento de indisponibilidade prevê preenchimento
manual do endereço, conforme RNF05.

**Nota sobre R7 e R8.** Geolocalização é utilizada como recurso nativo do dispositivo,
atendendo ao R8, e não é contabilizada como serviço externo. O R7 é atendido
exclusivamente pelo ViaCEP. A justificativa está registrada no item 3.3 do documento
de dúvidas.

### 9.3 Mapa de telas

| # | Tela | Perfis | Requisitos |
| --- | --- | --- | --- |
| 1 | Autenticação | público | R2 |
| 2 | Cadastro de usuário | público | R2 |
| 3 | Painel consolidado | ambos | R9 |
| 4 | Lista de ordens de serviço | ambos | R9, R10 |
| 5 | Detalhe da ordem com linha do tempo | ambos | R4, R9 |
| 6 | Abertura de ordem de serviço | solicitante | R3, R4 |
| 7 | Clientes: lista e formulário | solicitante | R3, R7 |
| 8 | Equipamentos: lista e formulário | ambos | R3 |
| 9 | Registro de evidência | técnico | R8 |
| 10 | Perfil e configurações | ambos | R2 |

Dez telas, acima do mínimo de seis do R1. A navegação é organizada em abas para
Painel, Ordens e Cadastros, com empilhamento em cada aba.

---

## 10. Cronograma interno

> Distribuição por ciclo, conforme o item 10 do Apêndice A.1 e a ficha do Apêndice B.
> Responsáveis a atribuir após a definição da equipe.

| Ciclo | Período | Entregas | Responsável |
| --- | --- | --- | --- |
| Concepção | até 11/09 | Escopo, DER, backlog, protótipo navegável | *a definir* |
| Ciclo 1 | 14/09 a 25/09 | Estrutura em camadas, navegação, autenticação, módulo de clientes com persistência local | *a definir* |
| Ciclo 2 | 13/10 a 23/10 | Manutenção de dados das entidades, regras RN01 a RN05, listagem com filtro, painel consolidado | *a definir* |
| Ciclo 3 | 26/10 a 06/11 | Retaguarda, sincronização, ViaCEP, câmera e geolocalização | *a definir* |
| Verificação | 09 a 13/11 | Testes funcionais e sessões de usabilidade com 5 usuários externos | *a definir* |
| Ciclo 4 | 16 a 27/11 | Correção de defeitos, acessibilidade, geração do pacote instalável | *a definir* |
| Encerramento | 30/11 a 04/12 | Relatório técnico, README, Apêndice C | *a definir* |

---

## 11. Referências

- PONTIFÍCIA UNIVERSIDADE CATÓLICA DE GOIÁS. Escola Politécnica e de Artes.
  *Documento Norteador — Projeto Integrador ADS, semestre letivo 2026/2*, versão 2.0.
  Goiânia, 2026.
- JÚLIO, Welington. *ADS1253 — AED · Projeto Integrador do Módulo*. Pontifícia
  Universidade Católica de Goiás, 2026.
- NIELSEN, Jakob. *10 Usability Heuristics for User Interface Design*. Nielsen Norman
  Group, 1994. Disponível em: https://www.nngroup.com/articles/ten-usability-heuristics/
- WORLD WIDE WEB CONSORTIUM. *Web Content Accessibility Guidelines (WCAG) 2.2*. 2023.
  Disponível em: https://www.w3.org/TR/WCAG22/
- GOOGLE. *Material Design 3 — Accessibility*. Disponível em:
  https://m3.material.io/foundations/accessible-design/overview
- VIACEP. *Webservice CEP e IBGE gratuito*. Disponível em: https://viacep.com.br/

---

## Declaração de uso de ferramentas de inteligência artificial

Conforme a Seção 9.1 do Documento Norteador, registra-se que este documento foi
elaborado com apoio de ferramenta de inteligência artificial nas seguintes
finalidades: cruzamento e sistematização dos requisitos dos documentos normativos,
estruturação do texto e redação da especificação de requisitos e regras de negócio a
partir do domínio definido pela equipe.

O conteúdo técnico foi revisado pela equipe, que responde integralmente por ele.
Registro a ser consolidado no relatório técnico final.
