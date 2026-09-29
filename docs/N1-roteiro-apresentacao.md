# Roteiro de Apresentação e Arguição — PP1

**Projeto Integrador · ADS 2026/2 · PUC Goiás**
**Equipe:** StockEasy · **Apresentação:** 29/09/2026 — Grupo A
**Versão:** 2.0 — 29/09/2026

Estrutura conforme o material do Encontro 15, de 29/09/2026.

---

## 1. Divisão dos blocos

Quatro blocos, 15 a 17 minutos por equipe. São **12 minutos de fala**, seguidos da arguição.

| Bloco                             | Duração   | Responsável   | Conteúdo                                                     |
| --------------------------------- | --------- | ------------- | ------------------------------------------------------------ |
| Escopo e domínio                  | 3 min     | Vitor         | O problema, o público-alvo e as principais regras de negócio |
| Arquitetura e modelagem           | 4 min     | Matheus       | O DER atualizado, a pilha escolhida e as decisões tomadas    |
| Demonstração da aplicação parcial | 5 min     | Felipe        | A aplicação rodando, mostrando o que já funciona             |
| Arguição                          | 3 a 5 min | Toda a equipe | Perguntas da banca a qualquer integrante                     |

São 15 slides para 12 minutos, cerca de 45 segundos cada. Não acrescente slide sem tirar outro.

> **Mudança em relação à versão 1.0.** A primeira versão seguia o Apêndice D do documento norteador: cinco blocos e 20 minutos. O Encontro 15 propõe quatro blocos, 15 a 17 minutos, e coloca as regras de negócio no bloco de escopo em vez do de especificação. Slides e roteiro foram reorganizados.

---

## 1.1 Os oito critérios avaliados

A PP1 vale até 4,0 pontos, distribuídos assim na rubrica proposta:

| Critério                            | Pontos | Onde é demonstrado                                    |
| ----------------------------------- | ------ | ----------------------------------------------------- |
| Definição e documentação do projeto | 0,5    | Bloco 1 e o documento de projeto                      |
| Requisitos e regras de negócio      | 0,5    | Bloco 1, slide das regras                             |
| Modelagem e arquitetura             | 0,7    | Bloco 2, com o DER e a justificativa da pilha         |
| Qualidade do protótipo              | 0,6    | Protótipo de 11 telas, aberto em aba separada         |
| Aplicação parcial                   | 0,8    | Bloco 3, demonstração ao vivo                         |
| Gestão do projeto                   | 0,4    | Backlog com responsável por história                  |
| Versionamento                       | 0,3    | Repositório, com histórico de commits dos integrantes |
| Apresentação técnica                | 0,2    | Clareza, tempo cumprido e coerência na arguição       |

O maior peso é a aplicação parcial, seguida da modelagem e arquitetura — e são justamente os dois blocos mais longos da apresentação.

---

## 1.2 O que levar para a defesa

Checklist da página 8 do Encontro 15:

| Item                                                               | Onde está                                          |
| ------------------------------------------------------------------ | -------------------------------------------------- |
| Documento de escopo, com domínio e público-alvo definidos          | `docs/N1-documento-de-projeto.md`                  |
| DER atualizado do banco de dados                                   | `docs/checkpoint1-der-modelagem.md`                |
| Definição arquitetural, com a pilha justificada                    | `docs/N1-arquitetura.md`                           |
| Protótipo navegável ou aplicação parcial, pronta para demonstração | `app/` e `prototipo/`                              |
| Backlog priorizado, com distribuição de responsabilidades          | `docs/checkpoint1-backlog.md`                      |
| Repositório Git acessível, com histórico de commits                | github.com/MatheusMitter/Projeto-Integrador-2026_2 |

---

## 2. Bloco 1 — Escopo e domínio (3 min) · Vitor

**Abertura, 20 segundos.** Nome do projeto, integrantes, e o domínio: controle de estoque para pequenos comércios.

**O problema, 1 min.** Pequenos comerciantes controlam estoque em caderno ou planilha desatualizada, quando controlam. Quatro perdas simultâneas: venda perdida por ruptura, capital imobilizado em item de baixo giro, descarte por vencimento, e decisão tomada sem informação. As quatro têm a mesma raiz: não existe registro confiável do que entra e do que sai.

Acrescentar por que este problema: ele tem regra de negócio suficiente para sustentar um sistema transacional, e não apenas telas de cadastro. Isso já responde de véspera a primeira pergunta provável da banca.

**Público-alvo, 40 segundos.** Estabelecimentos de até cinco colaboradores. Dois perfis com necessidades opostas: o proprietário decide compra e preço; o operador registra movimentação durante o atendimento e não deve ver custo nem margem. É dessa separação que nasce a regra RN01.

**Principais regras de negócio, 1 min.** Não percorrer as treze. Mostrar três e dizer o que acontece se cada uma for violada:

RN06, a saída não pode exceder o estoque. Validar só na tela não basta: dois aparelhos offline registram saída de 30 de um produto que tem 50, cada um passa porque cada um vê 50, e somadas dão 60. O conflito só aparece na consolidação.

RN07, a situação de estoque é relativa ao mínimo. Oito unidades não informa nada: pode ser excesso para item de baixo giro e falta para item de alto giro.

RN12, nenhum cadastro é excluído de verdade. Se violada, o histórico perde a referência e a auditoria deixa de existir.

**Transição:** "Essas condições viraram decisões de modelagem e de arquitetura. O Matheus mostra."

---

## 3. Bloco 2 — Arquitetura e modelagem (4 min) · Matheus

**Modelagem, 1 min 20.** Sete entidades. Mostrar o diagrama e destacar três decisões:

O histórico de movimentações é imutável. Correção se faz por lançamento de ajuste em sentido contrário. Preserva a auditoria e elimina uma classe inteira de conflito na sincronização.

Nenhum cadastro é excluído fisicamente. As chaves estrangeiras são restritivas, e é isso que impede, no nível do banco, que uma remoção destrua o histórico.

O saldo resultante é gravado em cada movimentação. Desnormalização deliberada: permite auditar qualquer ponto da série sem recalcular desde o início.

Fechar dizendo que o script foi executado em PostgreSQL 16, com sete tabelas, saldos fechando com o histórico e treze verificações de regra aprovadas. Não é só diagrama.

**Arquitetura em camadas, 1 min.** Apresentação, negócio e persistência, com a dependência apontando sempre para dentro: a tela chama o serviço, o serviço chama o repositório, nunca o contrário.

A prova prática vale mais que a explicação: os 21 testes das regras rodam em Node puro, sem emulador e sem banco. Só é possível porque a camada de negócio não depende das outras duas.

**A transação da movimentação, 1 min 10.** É o ponto técnico mais forte. Atualizar o saldo e gravar o histórico precisam ser indivisíveis: se a primeira escrita ocorre e a segunda falha, o estoque diz 45 e a soma dos lançamentos diz 50, sem nada explicando a diferença.

Percorrer os seis passos e destacar o bloqueio da linha do produto. Sem ele, duas saídas simultâneas leem 50, ambas calculam 45, e a segunda sobrescreve a primeira.

Dizer explicitamente que este é o cenário de transações e concorrência da disciplina, e a razão principal de termos escolhido retaguarda própria.

**Pilha tecnológica, 30 segundos.** React Native com Expo, SQLite local, Spring Boot com JDBC e DAO, PostgreSQL. O que distingue justificativa de preferência são as alternativas descartadas: Firebase e Supabase seriam mais rápidos e são admitidos, mas a persistência ficaria delegada, sem camada de acesso a dados própria. Kotlin e Flutter exigiriam aprender linguagem nova em paralelo ao Java da disciplina.

**Transição:** "O Felipe mostra o que já está rodando."

---

## 4. Bloco 3 — Demonstração (5 min) · Felipe

Executar no aparelho. Ter o roteiro decorado: cinco minutos não permitem hesitação.

| Tempo | O que mostrar                                                                                                                                                      |
| ----- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 1 min | Autenticação como proprietário e visão geral do painel, com os indicadores                                                                                         |
| 1 min | Cadastro de produto, com validação de campo e margem calculada automaticamente                                                                                     |
| 2 min | **Movimentação.** Saída maior que o estoque: o sistema bloqueia e cita a regra. Depois, saída que derruba o produto abaixo do mínimo: aparece o alerta preventivo. |
| 1 min | Sair e entrar como operador: custo, margem e valor do estoque desaparecem                                                                                          |

Os dois últimos são o que separa regra documentada de regra implementada. O bloqueio da saída é o momento mais importante da apresentação inteira.

Se der tempo, fechar mostrando que fechar e reabrir o aplicativo preserva os dados — é a persistência local funcionando.

**Encerramento, dentro deste bloco.** Não há bloco separado para isso na estrutura nova. Em cerca de 30 segundos, declarar o que ainda não está pronto: retaguarda e sincronização, leitura de código de barras, notificações e pacote instalável, todos previstos para os Ciclos 3 e 4. Mencionar que a senha ainda é comparada em texto puro e que o resumo criptográfico entra junto com o servidor.

Declarar limitação é melhor que ser pego por ela. A rubrica valoriza coerência na arguição, e uma pendência assumida com o motivo demonstra controle do projeto.

Se algum fluxo estiver instável no dia, não improvisar: mostrar o que funciona e declarar o resto. Demonstração honesta e curta vale mais que tentativa que falha ao vivo.

---

## 5. As quatro perguntas que o Encontro 15 sugere

Estas são as perguntas propostas no material do próprio encontro. São as mais prováveis, e por isso vêm primeiro.

---

**"Por que esse problema, e não outro? O que acontece no sistema se essa regra de negócio for violada?"**

Sobre a escolha: o controle de estoque tem regra de negócio suficiente para sustentar um sistema transacional, e não apenas telas de cadastro. Cada movimentação altera saldo, pode disparar alerta e precisa ser auditável. Outros temas que consideramos se reduziriam a listagem com formulário.

Sobre a violação, três respostas concretas:

Se a RN06 falhar, o estoque fica negativo e o sistema passa a afirmar que existe mercadoria que não existe. Toda decisão de compra derivada dali fica errada. Por isso há validação na camada de negócio e restrição de verificação no banco, como última barreira.

Se a RN12 falhar e um produto for excluído fisicamente, o histórico de movimentações perde a referência e a auditoria deixa de existir. É por isso que as chaves estrangeiras são restritivas.

Se a transação da movimentação falhar no meio, o saldo diverge do histórico: o estoque diz 45 e a soma dos lançamentos diz 50, sem nada explicando a diferença.

---

**"Por que essa tecnologia foi escolhida em vez de outra? O que mudaria se precisassem trocar de banco de dados?"**

A primeira parte está no bloco 2: React Native porque a equipe já domina JavaScript; Spring Boot com JDBC e DAO porque exercita transações e concorrência, conteúdo da disciplina; Firebase e Supabase descartados porque a persistência ficaria delegada, sem camada de acesso a dados própria.

A segunda parte é a pergunta mais interessante, e a resposta é o motivo de existir a camada de persistência separada.

Trocar de banco afeta apenas `repositories/` e `database/`. A camada de negócio não sabe qual banco está embaixo: ela chama `produtoRepository.listar()` e recebe objetos de domínio. O serviço de estoque não tem uma linha de SQL.

O que mudaria na prática: reescrever as consultas para o dialeto novo, ajustar os tipos no esquema, e verificar o controle transacional, porque cada banco trata isolamento de forma diferente. O que não mudaria: nenhuma regra de negócio, nenhuma tela, nenhum teste das regras.

Vale acrescentar que isso não é hipótese no nosso caso. Já mantemos dois bancos: SQLite no aparelho e PostgreSQL no servidor. Os dois têm o mesmo modelo relacional, e é justamente a separação em camadas que permite conviver com os dois sem duplicar a lógica.

---

**"O que, do planejado, ainda não está funcionando? Qual foi a parte mais difícil de implementar até aqui?"**

Não está funcionando: retaguarda e sincronização, leitura de código de barras, notificações e pacote instalável. Todos previstos para os Ciclos 3 e 4, conforme o cronograma — não são atrasos. Além disso, a senha ainda é comparada em texto puro; o resumo criptográfico entra junto com o servidor, e a limitação está sinalizada no próprio código.

A parte mais difícil foi garantir que o saldo e o histórico nunca divirjam. A primeira versão atualizava o produto e gravava o lançamento em duas operações soltas: qualquer falha entre elas deixava os dois inconsistentes. A solução foi envolver em transação e gravar o saldo resultante em cada movimentação.

Isso trouxe uma consequência que não estava prevista e acabou sendo boa: como o lançamento guarda o saldo, ele não pode ser alterado depois sem quebrar a série. Aceitamos isso como decisão, o histórico passou a ser imutável, e uma classe inteira de conflito na sincronização desapareceu — registros que só são acrescentados nunca divergem entre aparelhos.

---

**"Como as tarefas foram distribuídas? Explique uma parte que não foi você quem fez."**

A distribuição é por frente técnica: Matheus na modelagem e retaguarda, Vitor nas telas e navegação, Felipe na persistência local, integração e testes. As 30 histórias do backlog têm responsável nomeado.

A segunda parte é a mais exigente: qualquer integrante pode ser chamado a explicar o trabalho de outro. Prepare-se para estas três, que são as mais prováveis:

_A transação da movimentação_ — está em `services/estoqueService.ts`. Abre transação, lê o saldo do produto, valida a regra contra o saldo lido, calcula o resultado, atualiza o produto, grava o lançamento com o saldo, confirma. Qualquer falha no meio desfaz tudo.

_A separação em camadas_ — a tela chama o serviço, o serviço chama o repositório, nunca o contrário. A prova prática é que os testes das regras rodam em Node puro, sem emulador e sem banco.

_Por que o produto é desativado e não excluído_ — porque excluir levaria o histórico junto e destruiria a auditoria. O campo `ativo` marca a desativação e a chave estrangeira restritiva impede a remoção física.

---

## 6. Outras perguntas prováveis

Derivadas dos eixos de arguição do documento norteador. Cada integrante responde sobre a própria frente e tem noção das outras duas.

### Sobre decisões arquiteturais e alternativas descartadas

**Por que não usaram Firebase, que seria mais rápido?**
Porque a persistência ficaria delegada a um serviço gerenciado e não haveria camada de acesso a dados própria. A disciplina avalia JDBC, DAO e controle transacional, e a arguição pede explicação do fluxo de dados até o banco. Com Firebase não haveria esse fluxo para explicar. Assumimos o custo de mais implementação em troca de exercitar o conteúdo.

**Por que JDBC e não uma ferramenta de mapeamento objeto-relacional?**
Para manter o SQL explícito e sob controle da equipe, e porque é o mecanismo estudado na disciplina. O custo é mais código de conversão de resultado, que aceitamos.

**Por que a base local não é apenas um cache?**
Porque o requisito é operar offline, não acelerar leitura. Um cache serve dados obtidos anteriormente; nossa base local aceita escrita sem conexão e sincroniza depois. São problemas diferentes.

### Sobre trechos específicos do código

**Explique o fluxo de um registro de saída, do toque até o banco.**
A tela chama o serviço de movimentação passando produto, tipo e quantidade. O serviço abre transação, bloqueia a linha do produto, lê o saldo, valida a regra de saída, calcula o saldo resultante, atualiza o produto, grava a movimentação com o saldo e aplica a regra de alerta. Confirma a transação. Qualquer falha no meio desfaz tudo.

**Por que bloquear a linha do produto?**
Para impedir perda de atualização. Sem o bloqueio, duas movimentações simultâneas leem o mesmo saldo inicial e a segunda gravação sobrescreve o resultado da primeira. O saldo final ficaria errado.

**Onde a regra que restringe o operador é aplicada?**
Na camada de negócio, que filtra os campos financeiros antes de compor a resposta, e também na interface, que omite os elementos. Se estivesse apenas na interface, a informação continuaria acessível pela API — o que seria uma falha de controle de acesso, não um detalhe de tela.

### Sobre o fluxo de dados com a retaguarda

**Como funciona a sincronização e o que acontece em caso de conflito?**
Toda operação grava localmente e entra em fila de pendências. Com conexão, a fila é enviada em ordem cronológica. Para cadastros, prevalece a alteração mais recente. Movimentações não conflitam: são imutáveis, apenas acrescentadas, e o saldo é recomposto pela sequência consolidada.

**E se a rede cair depois de o servidor gravar, mas antes de o aplicativo receber a resposta?**
O aplicativo reenvia. Cada registro tem identificador gerado no dispositivo, e o servidor usa esse identificador para reconhecer o reenvio. Sem isso, a movimentação seria duplicada.

### Sobre tratamento de falhas e exceções

**O que acontece se o serviço externo não responder?**
Há tempo limite de cinco segundos. Esgotado o prazo, o cadastro segue manualmente. A indisponibilidade de um serviço de terceiros não pode bloquear o cadastro de produto.

**E se o usuário perder a conexão no meio de um registro?**
O registro é gravado localmente e fica pendente. A interface sinaliza a situação. Nada é perdido.

### Sobre priorização e replanejamento

**Por que a persistência local está no primeiro ciclo?**
Porque a Semana 8 do cronograma exige o primeiro módulo funcional integrado à persistência local, e o item 4 da N1 repete a exigência. O planejamento inicial a colocava no terceiro ciclo, o que não fechava a entrega. Foi remanejada.

**Algo mudou de prioridade durante o ciclo?**
Sim. A história de listar e editar fornecedores estava como prioridade baixa. Como o R3 exige manutenção completa sobre duas entidades, sem ela Fornecedor teria apenas cadastro e o requisito não fecharia. Subiu para prioridade alta.

### Sobre modelagem

**Por que o saldo resultante está gravado na movimentação, se pode ser calculado?**
É desnormalização deliberada, para auditar qualquer ponto do histórico sem recalcular a série inteira. O custo é manter o valor coerente, o que a função de registro garante ao gravá-lo na mesma transação que atualiza o produto.

**Por que as chaves estrangeiras são restritivas e não em cascata?**
Porque em cascata a remoção de um produto apagaria todo o histórico dele, e a auditoria exige o oposto. A única exceção é o alerta, que é estado derivado do saldo e pode ser recalculado — perdê-lo não perde informação.

**Por que categoria virou uma tabela?**
Porque o cadastro de produto e a tela de configurações permitem criar categorias próprias, e uma lista fixa no banco impediria exatamente isso. Antes era texto com restrição de valores fixos, o que contradizia a interface.

---

## 7. Checagem antes de apresentar

| Item                                                                              |
| --------------------------------------------------------------------------------- |
| Aplicação instalada e testada no aparelho que será usado                          |
| Roteiro de demonstração ensaiado, com o bloqueio de saída funcionando             |
| Aparelho carregado, com notificações silenciadas                                  |
| Protótipo aberto em aba separada — a rubrica avalia qualidade do protótipo em 0,6 |
| Slides abertos em tela cheia, testados no projetor se possível                    |
| Diagrama de modelagem pronto para exibição                                        |
| Repositório aberto numa aba, para mostrar código e histórico se pedirem           |
| Cada integrante sabe qual bloco apresenta e em quanto tempo                       |
| Cada integrante leu o memorial de arquitetura, não apenas a própria parte         |
| Ensaio cronometrado: 12 minutos de fala, sem passar                               |

**Plano de contingência para a demonstração.** Se a rede da faculdade bloquear a conexão entre o computador e o celular, o Expo não consegue servir o aplicativo. Duas alternativas, na ordem: usar o ponto de acesso do próprio celular para conectar o computador, ou abrir a versão web com `npm run web` numa aba já preparada. A segunda é inferior, porque a rubrica espera a aplicação rodando, mas é melhor que ficar sem demonstração.

---

## 8. Postura na arguição

Três orientações práticas.

**Responder o que foi perguntado.** A arguição verifica autoria e domínio técnico. Resposta longa que desvia do ponto sugere insegurança.

**Declarar o que não sabe.** Dizer "essa parte foi implementada pelo Felipe, o que eu sei é que ela funciona assim" é melhor que inventar. O que compromete é a resposta errada dita com confiança.

**Defender as decisões com o custo assumido.** Toda escolha técnica tem contrapartida. Apresentar a decisão junto com o que ela custou demonstra que houve avaliação, e não escolha por acaso — que é exatamente o que a rubrica de nível excelente descreve como "decisões devidamente justificadas".

---

## Controle de versões

| Versão | Data       | Alterações                                                                                                                                                                                                                                   | Responsável      |
| ------ | ---------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------- |
| 1.0    | 28/09/2026 | Versão inicial, seguindo o Apêndice D: cinco blocos e 20 minutos                                                                                                                                                                             | Equipe StockEasy |
| 2.0    | 29/09/2026 | Reorganizado para a estrutura do Encontro 15: três blocos e 12 minutos de fala, com as regras de negócio no bloco de escopo. Acrescentados os oito critérios da rubrica, o checklist da defesa e as quatro perguntas sugeridas pelo material | Equipe StockEasy |
