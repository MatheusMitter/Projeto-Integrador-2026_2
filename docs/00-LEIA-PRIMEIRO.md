# Documentação do projeto StockEasy

Sete documentos, na ordem em que fazem sentido ser lidos. Cada um cobre um assunto e não repete o dos outros.

---

## Qual arquivo abrir

| Arquivo                                                    | Do que trata                                                       | Quando abrir                                           |
| ---------------------------------------------------------- | ------------------------------------------------------------------ | ------------------------------------------------------ |
| [`01-documento-de-projeto.md`](01-documento-de-projeto.md) | O problema, quem usa, requisitos e regras de negócio               | Para entender o que o sistema faz e por quê            |
| [`02-modelagem-de-dados.md`](02-modelagem-de-dados.md)     | As tabelas do banco, o diagrama e os comandos SQL                  | Para mexer no banco ou entender como os dados se ligam |
| [`03-arquitetura.md`](03-arquitetura.md)                   | Como o código está organizado e por que escolhemos cada tecnologia | Antes de escrever código novo                          |
| [`04-prototipo.md`](04-prototipo.md)                       | As telas desenhadas e as decisões de interface                     | Ao criar ou alterar tela                               |
| [`05-backlog.md`](05-backlog.md)                           | A lista de tarefas, com responsável e prazo                        | Para saber o que fazer em seguida                      |
| [`06-gestao-do-projeto.md`](06-gestao-do-projeto.md)       | Cronograma, divisão de trabalho e regras de versionamento          | Ao planejar um ciclo                                   |
| [`99-historico-de-revisao.md`](99-historico-de-revisao.md) | O que foi corrigido na revisão e por quê                           | Para entender por que algo mudou                       |

Existe também o `APOIO-apresentacao.md`, que é material interno de ensaio e não faz parte da entrega.

---

## O projeto em um parágrafo

O StockEasy é um aplicativo de celular para controle de estoque em comércio de pequeno porte — mercearia, minimercado, padaria, conveniência. O comerciante registra o que entra e o que sai, e o sistema avisa quando um produto está acabando ou perto de vencer. Funciona sem internet, porque o depósito da loja é onde o sinal cai, e sincroniza depois.

---

## As três coisas que mais aparecem em prova e em arguição

### A arquitetura

**Nome:** arquitetura em camadas, distribuída em cliente-servidor, com estratégia de dados offline-first e sincronização.

Se alguém perguntar "qual arquitetura vocês usaram", essa é a resposta. O resto é detalhe dela.

Código separado em três camadas, cada uma conversando só com a de baixo:

```
Telas           o que o usuário vê
Regras          o que pode e o que não pode
Banco de dados  onde os dados ficam
```

A tela não sabe mexer no banco. O banco não sabe as regras. Quem decide é sempre a camada do meio.

**Por que escolhemos assim.** Três motivos: o requisito R12 exige separar em camadas; dá para testar as regras sem abrir o aplicativo — os 21 testes rodam direto no computador, o que só funciona se a separação for real; e trocar de banco afetaria só a camada de baixo, sem mexer em regra, tela ou teste.

**Por que offline-first.** O comerciante registra mercadoria no depósito, que é onde o sinal cai. Se dependesse de internet para gravar, não funcionaria no momento de maior necessidade. Então grava no celular primeiro e manda ao servidor depois.

**O que descartamos.** Código sem camadas, com a lógica nas telas: proibido pelo R12 e impossível de testar. Clean Architecture: estrutura demais para sete entidades. Cliente magro com tudo no servidor: quebraria o funcionamento sem internet. Microsserviços: complexidade sem benefício para um domínio só e três pessoas.

Detalhes e o custo assumido em [`03-arquitetura.md`](03-arquitetura.md), seção 1.

### As regras de negócio

São 13 documentadas. As três principais:

**Não pode tirar mais do que tem.** Se o produto tem 50, não dá para registrar saída de 60. Checado no aplicativo e no servidor, porque dois celulares sem internet podem, cada um por si, aprovar saídas que somadas estouram o estoque.

**Estoque baixo depende do produto.** Oito unidades pode ser muito ou pouco, conforme o giro. O sistema compara sempre com o mínimo que o dono definiu para aquele item.

**Nada é apagado de verdade.** Produto, fornecedor e categoria ficam inativos. Apagar levaria o histórico junto e acabaria com a auditoria.

Todas as 13, com o que acontece se cada uma falhar, em [`01-documento-de-projeto.md`](01-documento-de-projeto.md).

### O banco de dados

Sete tabelas:

```
LOJA
 ├── USUARIO       proprietário ou operador
 ├── CATEGORIA
 ├── FORNECEDOR
 └── PRODUTO
      ├── MOVIMENTACAO  histórico de entradas e saídas
      └── ALERTA
```

O histórico não pode ser alterado. Erro se corrige com um lançamento no sentido contrário, nunca editando o anterior. Cada movimentação guarda o saldo que ficou, para conferir qualquer ponto sem refazer a conta desde o começo.

Diagrama e comandos SQL em [`02-modelagem-de-dados.md`](02-modelagem-de-dados.md).

---

## Onde está cada coisa no repositório

```
app/          o aplicativo em React Native
prototipo/    as telas desenhadas em HTML, navegáveis
apresentacao/ os slides
docs/         estes documentos
```
