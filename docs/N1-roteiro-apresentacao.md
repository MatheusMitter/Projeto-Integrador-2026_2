# Roteiro de Apresentação e Arguição — N1

**Projeto Integrador · ADS 2026/2 · PUC Goiás**
**Equipe:** StockEasy · **Apresentação:** 29/09 a 02/10/2026
**Versão:** 1.0 — 28/09/2026

Atende ao item 6 da composição da N1: apresentação e defesa técnica, com participação de todos os integrantes e domínio demonstrado das decisões tomadas.

Estrutura conforme o Apêndice D: 20 minutos de apresentação e até 10 minutos de arguição. Todos os integrantes apresentam parte do conteúdo.

---

## 1. Divisão dos blocos

| Bloco             | Duração | Responsável | Conteúdo                                                    |
| ----------------- | ------- | ----------- | ----------------------------------------------------------- |
| Contextualização  | 3 min   | Vitor       | Domínio do problema, público-alvo e proposta de valor       |
| Especificação     | 4 min   | Matheus     | Requisitos, regras de negócio e modelagem de dados          |
| Decisões técnicas | 5 min   | Matheus     | Arquitetura, pilha tecnológica e justificativa das escolhas |
| Demonstração      | 6 min   | Felipe      | Execução da aplicação, percorrendo os fluxos principais     |
| Encerramento      | 2 min   | Vitor       | Estado atual, limitações e próximos passos                  |

A distribuição segue a frente técnica de cada um: quem fez a modelagem defende a modelagem, quem fez a integração demonstra a aplicação.

---

## 2. Bloco 1 — Contextualização (3 min)

**Abertura, 30 segundos.** Nome do projeto, integrantes e o domínio: controle de estoque para pequenos comércios.

**O problema, 1 min 30.** Pequenos comerciantes controlam estoque em caderno ou planilha desatualizada, quando controlam. Isso gera quatro perdas simultâneas: venda perdida por ruptura, capital imobilizado em item de baixo giro, descarte por vencimento e decisão tomada sem informação. As quatro têm a mesma raiz: não existe registro confiável do que entra e do que sai.

**Público-alvo, 30 segundos.** Estabelecimentos com até cinco colaboradores. Dois perfis de uso: o proprietário, que decide compra e preço, e o operador, que registra movimentação mas não deve ver custo nem margem.

**Proposta de valor, 30 segundos.** Três decisões de produto: registro em segundos no ponto de uso, alerta em vez de consulta, e informação consolidada acionável. Fechar dizendo que as três condições do ambiente — registro durante o atendimento, sinal ruim no depósito e operador que não é o dono — explicam as decisões técnicas que o próximo bloco vai detalhar.

**Transição:** "Essas três condições viraram requisitos. O Matheus mostra como."

---

## 3. Bloco 2 — Especificação (4 min)

**Requisitos, 1 min.** 43 requisitos funcionais e 15 não funcionais, priorizados por MoSCoW e associados ao ciclo de desenvolvimento. Não percorrer a lista: mostrar a estrutura e citar que cada requisito aponta para o requisito obrigatório que atende.

**Regras de negócio, 1 min 30.** O R4 exige três regras não triviais. O projeto tem cinco. Detalhar duas:

RN06, que impede saída superior ao estoque disponível. O ponto técnico: a validação na tela não bastaria. Dois dispositivos operando offline podem registrar saídas que, somadas, excedem o saldo. O conflito só aparece na consolidação, então a validação que garante a integridade é a do servidor, dentro da transação.

RN07, que classifica o produto em quatro faixas contra o estoque mínimo e gera alerta ao entrar em situação crítica, com baixa automática quando o saldo é reposto. Um número isolado não informa nada — oito unidades pode ser excesso ou falta, depende do giro. A faixa relativa ao mínimo é o que torna o dado útil.

**Modelagem, 1 min 30.** Sete entidades. Mostrar o diagrama e destacar três decisões:

O histórico de movimentações é imutável. Não há alteração nem exclusão; correção se faz por lançamento de ajuste em sentido contrário. Isso preserva a auditoria e elimina uma classe inteira de conflito na sincronização.

Nenhum cadastro é excluído fisicamente. As chaves estrangeiras são restritivas, e é isso que impede, no nível do banco, que uma remoção destrua o histórico.

O saldo resultante é gravado em cada movimentação. É desnormalização deliberada: permite auditar qualquer ponto do histórico sem recalcular a série inteira.

**Encerrar com a validação:** o script foi executado em PostgreSQL e as regras foram verificadas na prática, não apenas escritas.

---

## 4. Bloco 3 — Decisões técnicas (5 min)

**Arquitetura em camadas, 1 min 30.** Apresentação, negócio e persistência, replicadas nos dois lados da fronteira de rede. Explicar por que a regra de negócio existe nos dois lados: no aplicativo ela dá resposta imediata e permite operar offline; no servidor ela é a única garantia real. Não é redundância acidental.

**A transação da movimentação, 1 min 30.** Este é o ponto técnico mais forte da apresentação. Atualizar o saldo e gravar o histórico são duas escritas que precisam ser indivisíveis: se a primeira ocorre e a segunda falha, o saldo divergir do histórico e a auditoria se perde.

Percorrer a sequência: bloqueio da linha do produto, validação da regra, cálculo do saldo, atualização, gravação, aplicação da regra de alerta, confirmação. Destacar o bloqueio — sem ele, duas movimentações simultâneas leem o mesmo saldo e a segunda sobrescreve o resultado da primeira.

Dizer explicitamente que este é o cenário de transações e concorrência tratado na disciplina, e que é a principal razão da escolha de retaguarda própria.

**Pilha tecnológica, 1 min 30.** React Native com Expo na aplicação, SQLite local, Spring Boot com JDBC e DAO na retaguarda, PostgreSQL, Open Food Facts como serviço externo, câmera e notificações como recursos nativos.

Apresentar as alternativas descartadas, que é o que distingue justificativa de preferência:

Firebase e Supabase seriam mais rápidos de montar e são admitidos. Foram descartados porque a persistência ficaria delegada a um serviço gerenciado, sem código de acesso a dados próprio — e é justamente JDBC, DAO e transações que a disciplina avalia.

Android nativo com Kotlin e Flutter exigiriam aprender uma linguagem nova em paralelo ao Java da disciplina, sem vantagem decisiva para este domínio.

**Decisões registradas, 30 segundos.** Sete decisões arquiteturais documentadas, cada uma com o motivo e o custo assumido. Mencionar uma como exemplo: o identificador gerado no dispositivo, que garante que um reenvio após falha de rede não duplique a movimentação.

**Transição:** "O Felipe mostra o que já está rodando."

---

## 5. Bloco 4 — Demonstração (6 min)

Executar no aparelho, não em emulador. Ter o roteiro decorado: seis minutos não permitem hesitação.

| Tempo | O que mostrar                                                                                                                                                                                                         |
| ----- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1 min | Cadastro e autenticação. Entrar como proprietário.                                                                                                                                                                    |
| 1 min | Cadastro de produto, com validação de campo obrigatório e cálculo automático de margem.                                                                                                                               |
| 1 min | Listagem com busca, mostrando a situação de estoque de cada item.                                                                                                                                                     |
| 2 min | Movimentação: entrada, depois saída. Mostrar a previsão de saldo mudando. **Tentar uma saída maior que o estoque e mostrar o bloqueio.** Depois uma saída que derruba o produto abaixo do mínimo, mostrando o alerta. |
| 1 min | Persistência: fechar o aplicativo, reabrir e mostrar que os dados continuam. Se possível, ativar o modo avião e registrar uma movimentação.                                                                           |

O momento mais importante é o bloqueio da saída. É a prova de que a regra de negócio está implementada, e não apenas documentada. Ensaiar para que aconteça sem tropeço.

Se algum fluxo estiver instável, não improvisar: mostrar o que funciona e declarar o que ainda não está pronto. Uma demonstração honesta e curta vale mais que uma tentativa que falha ao vivo.

---

## 6. Bloco 5 — Encerramento (2 min)

**Estado atual, 45 segundos.** O que está pronto: documentação de projeto, modelagem validada por execução, arquitetura definida e justificada, protótipo navegável de 11 telas, backlog em quatro ciclos, e a aplicação em execução com navegação, autenticação de dois perfis e o módulo de produtos e movimentação sobre persistência local. Mencionar os 21 testes automatizados das regras de negócio, que rodam sem emulador.

> **Confira antes de apresentar.** Este trecho e o slide correspondente descrevem o estado da aplicação. Se algum fluxo deixar de funcionar até o dia, ajuste o texto: afirmação que não se sustenta na demonstração custa mais do que pendência declarada com honestidade.

**Limitações, 45 segundos.** Declarar abertamente, porque a arguição vai perguntar de qualquer forma:

A retaguarda ainda não está em operação — a aplicação persiste apenas localmente. Isso segue o cronograma, que prevê integração com serviço de retaguarda no Ciclo 3.

Leitura de código de barras, notificações e sincronização estão especificadas e não implementadas, previstas para o Ciclo 3.

O relatório de mais vendidos usa o preço atual do produto, não o preço praticado na venda. A limitação está registrada, com a correção prevista para a N2.

A acessibilidade foi verificada estruturalmente, mas não validada com usuários. As sessões de usabilidade estão previstas para a Semana 15.

**Próximos passos, 30 segundos.** Ciclo 2 fecha manutenção de dados, regras e consultas consolidadas. Ciclo 3 entrega retaguarda, sincronização, serviço externo e recursos nativos, e é o escopo do Checkpoint 2 em 06/11.

---

## 7. Preparação para a arguição individual

O Apêndice D lista os eixos que a arguição pode abordar. As perguntas abaixo derivam desses eixos. Cada integrante precisa responder sobre a própria frente, e ter noção das outras duas.

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

## 8. Checagem antes de apresentar

| Item                                                                        |
| --------------------------------------------------------------------------- |
| Aplicação instalada e testada no aparelho que será usado                    |
| Roteiro de demonstração ensaiado, com o bloqueio de saída funcionando       |
| Aparelho carregado, com notificações silenciadas                            |
| Protótipo aberto em aba separada, como alternativa se a demonstração falhar |
| Diagrama de modelagem e diagrama de camadas prontos para exibição           |
| Repositório acessível, para mostrar código se solicitado                    |
| Documentos exportados em PDF conforme o padrão de nomeação da disciplina    |
| Cada integrante sabe qual bloco apresenta e em quanto tempo                 |
| Cada integrante leu o memorial de arquitetura, não apenas a própria parte   |

---

## 9. Postura na arguição

Três orientações práticas.

**Responder o que foi perguntado.** A arguição verifica autoria e domínio técnico. Resposta longa que desvia do ponto sugere insegurança.

**Declarar o que não sabe.** Dizer "essa parte foi implementada pelo Felipe, o que eu sei é que ela funciona assim" é melhor que inventar. O que compromete é a resposta errada dita com confiança.

**Defender as decisões com o custo assumido.** Toda escolha técnica tem contrapartida. Apresentar a decisão junto com o que ela custou demonstra que houve avaliação, e não escolha por acaso — que é exatamente o que a rubrica de nível excelente descreve como "decisões devidamente justificadas".

---

## Controle de versões

| Versão | Data       | Alterações                          | Responsável      |
| ------ | ---------- | ----------------------------------- | ---------------- |
| 1.0    | 28/09/2026 | Versão inicial para a entrega da N1 | Equipe StockEasy |
