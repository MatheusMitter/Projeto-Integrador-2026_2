# Guia da fala — Apresentação PP1

**Equipe StockEasy · 29/09/2026 · Grupo A**

Este é o roteiro prático: o que cada um fala, em que ordem, e o que aparece na tela. Baseado na estrutura do Encontro 15.

Não é para decorar palavra por palavra. É para saber o rumo, os números certos e as frases que precisam sair inteiras.

---

## Visão geral

| Quando          | Quem    | Bloco                   | Slides  |
| --------------- | ------- | ----------------------- | ------- |
| 0:00 a 0:30     | Vitor   | Abertura                | 1 e 2   |
| 0:30 a 3:00     | Vitor   | Escopo e domínio        | 3 a 6   |
| 3:00 a 7:00     | Matheus | Arquitetura e modelagem | 7 a 11  |
| 7:00 a 12:00    | Felipe  | Demonstração            | 12 a 14 |
| 12:00 em diante | Todos   | Arguição                | 15      |

São 12 minutos de fala. Quem estiver falando controla o tempo; quem não está, acompanha o relógio e avisa se estourar.

**Regra de ouro:** se o tempo apertar, corte explicação, nunca a demonstração. O bloco do Felipe vale 0,8 ponto, o maior peso da rubrica.

---

# BLOCO 1 — Vitor · 3 minutos

## Abertura (30 segundos) · slides 1 e 2

> "Boa noite. Nosso projeto é o StockEasy, um aplicativo de controle de estoque para pequenos comércios. Eu sou o Vitor, e apresento com o Matheus e o Felipe.
>
> A gente dividiu assim: eu falo do problema e do escopo, o Matheus mostra a modelagem e a arquitetura, e o Felipe demonstra o que já está rodando."

Passa o slide 2 rápido, só para mostrar a divisão. Não leia a tabela.

## O problema (1 minuto) · slide 4

> "O problema é que pequeno comerciante não controla estoque. Ou controla em caderno, ou numa planilha que ele atualiza quando dá.
>
> Isso gera quatro perdas ao mesmo tempo. Ele perde venda porque o produto acabou e ninguém viu. Ele imobiliza dinheiro comprando coisa que não gira. Ele joga fora produto que venceu no fundo da prateleira. E ele decide sem informação, porque não sabe o que sustenta o faturamento dele.
>
> E as quatro têm a mesma causa: não existe registro confiável do que entra e do que sai."

**Frase que precisa sair inteira** — é a resposta antecipada para "por que esse problema":

> "A gente escolheu esse domínio porque ele tem regra de negócio de verdade. Cada movimentação muda o saldo, pode disparar alerta e precisa ser auditável. Não é um cadastro com listagem."

## Público-alvo (40 segundos) · slide 5

> "O público é comércio de até cinco funcionários: mercearia, minimercado, padaria, conveniência. Gente que usa WhatsApp todo dia e nunca usou sistema de gestão.
>
> E tem dois perfis com necessidades opostas. O proprietário decide compra e preço, então ele precisa ver custo, margem e quanto tem investido em estoque. O operador registra a venda no balcão, com fila esperando, e não precisa ver nada disso.
>
> É daí que sai nossa primeira regra, a RN01: o operador não tem acesso à informação financeira."

Se quiser acrescentar uma frase que mostra cuidado técnico:

> "E a gente aplicou essa regra na camada de negócio, não só escondendo na tela. Se fosse só na tela, o dado continuaria acessível pela API."

## As regras de negócio (50 segundos) · slide 6

Não liste as treze. Mostre três e diga o que quebra se cada uma falhar.

> "A gente documentou treze regras. Vou mostrar três, e o que acontece se forem violadas.
>
> A RN06 diz que a saída não pode ser maior que o estoque. Parece óbvio, mas validar na tela não resolve. Imagina dois celulares sem internet: cada um registra saída de 30 de um produto que tem 50. Cada um passa, porque cada um vê 50. Somando, dão 60. O problema só aparece quando sincroniza.
>
> A RN07 diz que a situação do estoque é relativa ao mínimo. Saber que tem 8 unidades não diz nada: 8 pode ser excesso pra um produto que sai uma vez por mês e falta pra um que sai todo dia. Então a gente compara sempre com o mínimo que o usuário definiu.
>
> E a RN12 diz que nada é excluído de verdade. Se apagar um produto, o histórico dele perde a referência e acaba a auditoria. Então a gente desativa, e a chave estrangeira no banco impede a exclusão."

## Passagem para o Matheus

> "Essas condições todas viraram decisão de modelagem e de arquitetura. Matheus."

---

# BLOCO 2 — Matheus · 4 minutos

## Modelagem (1 min 20) · slide 8

> "São sete entidades. Loja, que é o escopo de tudo; usuário, categoria, fornecedor, produto; movimentação, que é o histórico; e alerta.
>
> Três decisões da modelagem que valem explicar."

> "Primeira: o histórico é imutável. A gente não altera nem apaga movimentação. Se errou, lança um ajuste no sentido contrário. Isso preserva a auditoria e, de bônus, elimina conflito na sincronização — registro que só é acrescentado nunca divergir entre aparelhos.
>
> Segunda: nenhum cadastro é apagado. As chaves estrangeiras são restritivas, e é isso que impede, no banco, que alguém destrua o histórico por acidente.
>
> Terceira: a gente grava o saldo resultante em cada movimentação. Dá pra calcular somando tudo, mas gravando eu consigo auditar qualquer ponto da série sem refazer a conta desde o começo. É desnormalização de propósito."

**Frase de fechamento do slide** — mostra que não é só diagrama:

> "E isso não ficou no papel. Instalei o script num PostgreSQL 16 de verdade: sete tabelas, o saldo de cada produto fechando com o último lançamento do histórico, e treze verificações de regra passando."

## Arquitetura em camadas (1 minuto) · slide 9

> "O código está em três camadas: apresentação, negócio e persistência.
>
> A regra que a gente seguiu é que a dependência aponta sempre para dentro. A tela chama o serviço, o serviço chama o repositório. Nunca o contrário. A tela não tem uma linha de SQL, e o banco não sabe o que é regra de negócio."

**A frase mais forte deste slide:**

> "E tem uma prova prática disso. Os 21 testes das nossas regras rodam no Node puro, sem emulador e sem banco. Isso só é possível porque a camada de negócio não depende das outras duas. Se a regra estivesse dentro da tela, não teria como testar sem abrir o app."

## A transação (1 min 10) · slide 10

Este é o ponto mais forte da apresentação inteira. Fale devagar.

> "O ponto mais delicado do sistema é registrar uma movimentação. Porque são duas escritas: atualizar o saldo do produto e gravar o lançamento no histórico.
>
> Se a primeira acontece e a segunda falha, o estoque diz 45 e a soma do histórico diz 50. E não tem nada explicando a diferença. A auditoria acabou.
>
> Então as duas ficam dentro de uma transação. Bloqueia a linha do produto, lê o saldo, valida a regra contra o que leu, calcula, atualiza, grava o lançamento, confirma. Se qualquer passo falhar, desfaz tudo."

**Explique o bloqueio, que é o detalhe que mostra domínio:**

> "O bloqueio da linha é o que impede perda de atualização. Sem ele, duas saídas ao mesmo tempo leem 50, as duas calculam 45, e a segunda sobrescreve a primeira. O saldo final fica errado.
>
> E é exatamente o assunto de transação e concorrência da disciplina. Foi por isso que a gente escolheu ter retaguarda própria em vez de usar um serviço pronto."

## Pilha tecnológica (30 segundos) · slide 11

Corra pela tabela e gaste o tempo no que descartou.

> "React Native com Expo no aplicativo, SQLite no aparelho, Spring Boot com JDBC e DAO na retaguarda, PostgreSQL no servidor.
>
> Mas o que explica a escolha é o que a gente descartou. Firebase e Supabase seriam bem mais rápidos de montar, e são permitidos. A gente não usou porque a persistência ficaria delegada a um serviço gerenciado e não sobraria camada de acesso a dados própria — que é justamente JDBC, DAO e transação, o que a disciplina avalia.
>
> Kotlin nativo e Flutter a gente descartou porque significaria aprender linguagem nova ao mesmo tempo que o Java da matéria, sem ganho que justificasse."

## Passagem para o Felipe

> "Felipe, mostra o que já roda."

---

# BLOCO 3 — Felipe · 5 minutos

Este bloco é o de maior peso na rubrica: 0,8 ponto. É mais ação que fala. Fale enquanto opera, sem pausar para narrar.

Deixe o celular já desbloqueado e o app aberto na tela de login antes de começar.

## Abertura (15 segundos) · slide 13

> "Isso está rodando no meu celular, com banco local. Vou mostrar quatro coisas, e as duas últimas são as que importam mais."

## 1. Entrar e ver o painel (1 minuto)

Entre como proprietário. Mostre o painel.

> "Entrei como proprietário. O painel traz o total de produtos, o valor investido em estoque, quantos estão em situação crítica e quantos estão perto de vencer.
>
> Esse valor de estoque usa o preço de custo, não o de venda — porque a pergunta que ele responde é quanto dinheiro está parado ali, não quanto daria de receita."

## 2. Cadastrar produto (1 minuto)

Cadastre algo rápido. Um nome curto, categoria, preços, quantidade.

> "No cadastro, ele calcula a margem sozinho enquanto eu digito os preços.
>
> E tem um detalhe de modelagem aqui: o produto nasce com saldo zero. A quantidade inicial que eu digitei entra como uma movimentação de entrada. Assim o histórico explica de onde veio o estoque, em vez do número simplesmente aparecer."

## 3. Movimentação — o momento principal (2 minutos)

Vá em Movimentação. Escolha um produto e mostre o saldo dele. Aba Saída.

**Primeiro o bloqueio:**

> "Esse produto tem 50 unidades. Vou tentar tirar 999."

Digite. Espere a tela reagir.

> "Olha o que aconteceu: o painel de previsão ficou vermelho, o botão de confirmar desabilitou, e a mensagem diz a quantidade que eu pedi, o que tem disponível, e qual regra bloqueou. É a RN06 funcionando."

**Depois o alerta:**

> "Agora vou tirar uma quantidade que deixa o produto abaixo do mínimo."

Digite um valor que derrube ao mínimo.

> "Ficou laranja. Ele deixa eu confirmar, mas avisa antes que o produto vai ficar em situação crítica. É a RN07.
>
> A diferença entre as duas é proposital: uma impede, a outra alerta. Saída maior que o estoque é impossível. Estoque baixo é uma decisão do comerciante, então ele decide com a informação na frente."

Confirme uma movimentação válida para mostrar que grava.

> "Confirmando uma saída normal: gravou, o saldo atualizou, e apareceu no histórico com meu usuário, o tipo e o saldo que ficou."

## 4. Trocar de perfil (1 minuto)

Saia. Entre como operador.

> "Agora entrei como operador, que é o funcionário do balcão.
>
> Repara no painel: o cartão de valor em estoque desapareceu."

Abra um produto.

> "E aqui nos detalhes, sumiu o preço de custo e a margem. Ele vê quanto tem, o preço de venda, e pode registrar movimentação. Mas não vê quanto o dono pagou nem quanto ele lucra.
>
> E isso não é a tela escondendo. Quem decide é a camada de negócio, antes de montar a resposta. Se fosse só na interface, bastaria olhar a requisição pra ver o dado."

## Encerramento (30 segundos) · slide 14

Não existe bloco separado para isso. Feche aqui.

> "O que não está pronto: a retaguarda e a sincronização, a leitura de código de barras, as notificações e o pacote instalável. Todos estão nos Ciclos 3 e 4 do nosso cronograma, então não são atrasos.
>
> E tem uma limitação que a gente assume: a senha ainda é comparada em texto puro. O hash entra junto com o servidor, no Ciclo 3, porque é lá que a verificação vai acontecer de verdade. Está sinalizado no código."

**Se sobrar tempo, acrescente a parte difícil** — é pergunta provável, e responder antes conta a favor:

> "A parte mais difícil até aqui foi garantir que o saldo e o histórico nunca divirjam. A primeira versão fazia as duas escritas soltas, e qualquer falha no meio deixava os dois inconsistentes. Resolver com transação trouxe uma consequência que a gente não tinha previsto: como o lançamento guarda o saldo, ele não pode mais ser editado. A gente aceitou isso, o histórico ficou imutável, e de graça resolveu o conflito da sincronização."

> "É isso. Obrigado."

---

# ARGUIÇÃO — 3 a 5 minutos

O documento avisa que a pergunta vai para **qualquer integrante**, inclusive sobre parte que não foi ele quem fez.

## Quem responde o quê

| Assunto                              | Primeiro | Reserva     |
| ------------------------------------ | -------- | ----------- |
| Escolha do problema, público, escopo | Vitor    | Matheus     |
| Regras de negócio                    | Vitor    | Felipe      |
| Modelagem, DER, banco                | Matheus  | Felipe      |
| Arquitetura, camadas, transação      | Matheus  | Felipe      |
| Pilha e alternativas descartadas     | Matheus  | Vitor       |
| O que roda e o que falta             | Felipe   | Vitor       |
| Divisão de tarefas                   | Vitor    | qualquer um |

Se a pergunta cair em alguém que não domina, a resposta honesta é melhor que inventar:

> "Essa parte quem implementou foi o Matheus. O que eu sei é que funciona assim… [explica o que sabe]. Ele completa melhor."

Mas **as três abaixo todos precisam saber**, porque são as mais prováveis de virem redirecionadas.

### A transação, em três frases

> "Atualizar o saldo e gravar o histórico ficam na mesma transação. Se a segunda falhar, a primeira é desfeita. Antes de ler o saldo, a linha do produto é bloqueada, senão duas movimentações simultâneas leem o mesmo número e a segunda sobrescreve a primeira."

### As camadas, em três frases

> "São três: apresentação, negócio e persistência. A tela chama o serviço, o serviço chama o repositório, nunca o contrário. A prova é que os testes das regras rodam sem emulador e sem banco."

### Por que desativa em vez de excluir

> "Porque apagar o produto levaria o histórico junto e acabaria com a auditoria. A gente marca como inativo, ele sai das listagens, e a chave estrangeira no banco impede a exclusão física."

## As quatro perguntas que o material sugere

### "Por que esse problema, e não outro? O que acontece se a regra for violada?"

Responde o Vitor. A primeira parte já foi dita no bloco 1: o domínio tem regra de negócio de verdade, não é cadastro com listagem.

A segunda parte, escolha uma:

> "Se a RN06 falhar, o estoque fica negativo e o sistema passa a afirmar que existe mercadoria que não existe. Toda decisão de compra tirada dali fica errada. Por isso tem validação no negócio e restrição no banco como última barreira."

### "Por que essa tecnologia e não outra? O que mudaria se trocassem de banco?"

Responde o Matheus. A primeira parte está no slide 11.

A segunda é a melhor pergunta possível para nós:

> "Trocar de banco afeta só duas pastas: repositories e database. A camada de negócio não sabe qual banco está embaixo — ela chama o repositório e recebe objeto de domínio. O serviço de estoque não tem uma linha de SQL.
>
> O que mudaria: reescrever as consultas pro dialeto novo, ajustar os tipos do esquema, e revisar o controle transacional, porque cada banco trata isolamento diferente. O que não mudaria: nenhuma regra, nenhuma tela, nenhum teste.
>
> E na verdade isso não é hipótese pra gente. Já mantemos dois bancos: SQLite no celular e PostgreSQL no servidor, com o mesmo modelo relacional. É a separação em camadas que deixa conviver com os dois sem duplicar a lógica."

### "O que ainda não funciona? Qual foi a parte mais difícil?"

Responde o Felipe. Já está no encerramento do bloco 3. Se perguntarem, repita mais curto.

### "Como dividiram as tarefas? Explique uma parte que não foi você."

Responde o Vitor a primeira parte:

> "Por frente técnica. Matheus na modelagem e na retaguarda, eu nas telas e navegação, Felipe na persistência local, integração e testes. As 30 histórias do backlog têm responsável com nome."

A segunda parte cai em quem o professor escolher. É para isso que servem as três respostas curtas acima.

---

# ANTES DE ENTRAR

| Item                                                            | Responsável |
| --------------------------------------------------------------- | ----------- |
| Celular carregado, desbloqueado, notificações silenciadas       | Felipe      |
| App aberto na tela de login, já testado                         | Felipe      |
| Saber de cabeça o saldo do produto que vai usar na demonstração | Felipe      |
| Slides em tela cheia, testados no projetor                      | Vitor       |
| Protótipo aberto em outra aba — vale 0,6 na rubrica             | Vitor       |
| Repositório aberto numa aba, caso peçam código                  | Matheus     |
| Diagrama da modelagem pronto para exibir                        | Matheus     |
| Ensaio cronometrado, 12 minutos sem estourar                    | todos       |

## Se a rede bloquear o celular

Em ordem: ponto de acesso do próprio celular com o computador conectado nele; depois `npx expo start --tunnel`; depois emulador Android; por último, demonstrar o protótipo, que o checklist do Encontro 15 admite.

O app não roda no navegador — o módulo de banco local não tem implementação para web. Então não conte com isso.

## Três coisas para não fazer

**Não leia os slides.** Eles são apoio. Quem lê slide perde ponto em apresentação técnica.

**Não invente na arguição.** "Não sei, quem fez foi o X" custa menos que resposta errada dita com firmeza.

**Não passe do tempo.** A rubrica avalia "dentro do tempo" explicitamente. Se estiver atrasado no bloco 2, corte a pilha tecnológica e vá para a demonstração.
