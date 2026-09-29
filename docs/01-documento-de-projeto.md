# Documento de Projeto — StockEasy

**Projeto Integrador · ADS 2026/2 · PUC Goiás**
Escola Politécnica e de Artes — Curso Superior de Tecnologia em Análise e Desenvolvimento de Sistemas
Disciplina ADS1253 — Programação Orientada a Objeto com Banco de Dados

**Equipe:** StockEasy
**Domínio:** Gestão e produtividade — controle de estoque e inventário
**Entrega:** N1 — 29/09 a 02/10/2026
**Repositório:** https://github.com/MatheusMitter/Projeto-Integrador-2026_2
**Versão do documento:** 1.0 — 28/09/2026

---

## Identificação da equipe

| Integrante              | Matrícula          | Atribuição técnica no projeto                                                                               |
| ----------------------- | ------------------ | ----------------------------------------------------------------------------------------------------------- |
| Matheus Oliveira Mitter | 2025.1.0120.0128-3 | Retaguarda: modelagem do banco, API REST, camada de persistência JDBC/DAO, autenticação e autorização       |
| Vitor Leal dos Santos   | 2025.1.0120.0071-6 | Aplicação móvel: telas, navegação, componentes, formulários e validações de entrada                         |
| Felipe Milhomem Rocha   | 2025.1.0120.0024-4 | Integração: persistência local SQLite, sincronização, consumo de serviço externo, recursos nativos e testes |

A distribuição de responsabilidades por ciclo consta em [`06-gestao-do-projeto.md`](06-gestao-do-projeto.md).

---

## 1. Contexto e caracterização do domínio

O varejo de pequeno porte brasileiro é formado predominantemente por estabelecimentos de gestão familiar, com poucos funcionários e baixa informatização. Mercearias, minimercados, padarias, lojas de conveniência e pequenas farmácias operam com centenas de itens distintos, margens estreitas e giro heterogêneo: uma parte do catálogo sai diariamente, outra permanece semanas na prateleira.

Nesse contexto, o controle de estoque é a operação que conecta compra, venda e resultado financeiro. É também a que mais frequentemente falha. O padrão observado é o registro manual em caderno ou planilha alimentada de forma irregular, quando existe registro. A consequência prática é que o comerciante não sabe, em um dado momento, quanto tem de cada produto, quanto daquilo está prestes a vencer e quanto de capital está imobilizado em itens que não giram.

O ambiente de uso tem três características que condicionam o projeto. Primeiro, o registro precisa acontecer durante o atendimento, em segundos, frequentemente com uma mão ocupada — o que favorece a leitura de código de barras em vez da digitação. Segundo, a conectividade é intermitente: depósitos e áreas de estoque costumam ter sinal ruim, e o aplicativo não pode simplesmente parar de funcionar. Terceiro, quem opera não é necessariamente o dono: funcionários registram movimentações, mas não devem ter acesso a custo de aquisição e margem.

Essas três condições explicam as decisões centrais do projeto: recurso nativo de câmera para leitura de código de barras, persistência local com sincronização posterior e controle de acesso com dois perfis distintos.

---

## 2. Descrição do problema e justificativa

### 2.1 O problema

A ausência de controle de estoque confiável em pequenos comércios produz quatro perdas simultâneas:

| Perda                   | Mecanismo                                                                                                |
| ----------------------- | -------------------------------------------------------------------------------------------------------- |
| Venda não realizada     | O produto acaba sem que ninguém perceba, e a reposição só ocorre quando um cliente pede o item que falta |
| Capital imobilizado     | Compra-se por hábito ou por promoção do fornecedor, sem consultar o giro real do item                    |
| Descarte por vencimento | Produtos perecíveis vencem no fundo da prateleira porque não há acompanhamento de validade               |
| Decisão sem informação  | Não há como saber quais itens sustentam o faturamento e quais apenas ocupam espaço                       |

As quatro têm a mesma raiz: não existe um registro confiável e atualizado do que entra e do que sai.

### 2.2 A solução proposta

O StockEasy é um aplicativo móvel que transforma o registro de movimentação em uma ação de poucos segundos e, a partir desse registro, deriva automaticamente os alertas e as visões que hoje não existem.

A proposta se sustenta em três decisões de produto:

**Registro rápido e no ponto de uso.** A entrada e a saída são feitas pelo celular, com leitura de código de barras pela câmera. O aplicativo funciona sem conexão e sincroniza quando a rede voltar, porque o depósito é justamente onde o sinal falha.

**Alerta em vez de consulta.** O comerciante não precisa se lembrar de verificar o estoque. O sistema classifica cada produto em relação ao estoque mínimo que o próprio usuário definiu e avisa quando o item entra em situação crítica ou quando a validade se aproxima.

**Informação consolidada e acionável.** O painel responde a perguntas concretas: quanto vale meu estoque, quais produtos vendem, quais estão parados e há quanto tempo.

### 2.3 Justificativa técnica e acadêmica

O domínio atende às condições da Seção 3.3 do documento norteador: usuários identificáveis, dois perfis com permissões distintas, regras de negócio explícitas e verificáveis, e um fluxo principal — registrar movimentação e reagir ao alerta resultante — que justifica a existência da aplicação. Não se trata de listagem estática nem de agregador de conteúdo: o sistema mantém estado transacional, e cada movimentação altera o saldo do produto e pode disparar alertas.

O domínio também exercita integralmente o conteúdo da ADS1253. O controle de estoque é um problema transacional clássico: a baixa de saldo e o registro no histórico precisam ocorrer atomicamente, sob pena de o saldo divergir do histórico. Esse é exatamente o cenário de transações, isolamento e concorrência tratado na disciplina, e é a razão pela qual a equipe optou por interface de programação própria com JDBC e DAO em vez de uma plataforma de backend como serviço — decisão detalhada em [`03-arquitetura.md`](03-arquitetura.md).

---

## 3. Objetivos

### 3.1 Objetivo geral

Desenvolver uma aplicação móvel funcional que permita a proprietários e operadores de pequenos comércios controlar o estoque de produtos por meio do registro de movimentações de entrada e saída, com alertas automáticos de reposição e vencimento e visões consolidadas de desempenho, operando com ou sem conectividade.

### 3.2 Objetivos específicos

1. Implementar controle de acesso com dois perfis de permissão distintos, restringindo a informação financeira ao perfil proprietário.
2. Prover manutenção completa de dados — inclusão, consulta, alteração e exclusão — sobre produtos, fornecedores e categorias, com validação de entrada.
3. Registrar toda movimentação de estoque de forma rastreável, preservando produto, usuário responsável, tipo, quantidade, saldo resultante e instante do registro.
4. Impedir, por regra de negócio verificável, que uma saída exceda o estoque disponível.
5. Classificar automaticamente a situação de cada produto em relação ao estoque mínimo e gerar alertas de estoque crítico e de vencimento próximo.
6. Disponibilizar listagens com busca, filtro e ordenação, e ao menos uma visão consolidada com indicadores e gráfico.
7. Armazenar os dados localmente no dispositivo, mantendo a aplicação operante sem conectividade, e sincronizá-los com o serviço de retaguarda quando a conexão for restabelecida.
8. Consumir serviço externo de consulta de produtos por código de barras, tratando indisponibilidade e ausência de resultado sem interromper o cadastro.
9. Utilizar a câmera do dispositivo para leitura de código de barras, reduzindo o tempo de registro.
10. Organizar o código em camadas de apresentação, negócio e persistência, com nomenclatura consistente e sem credenciais versionadas.
11. Validar a solução por meio de testes funcionais e de sessões de usabilidade com usuários do perfil-alvo.
12. Gerar pacote instalável e comprovar execução em dispositivo físico.

---

## 4. Público-alvo e personas

### 4.1 Público-alvo

Proprietários e funcionários de estabelecimentos de varejo de pequeno porte, com até cinco colaboradores e catálogo entre algumas dezenas e alguns milhares de itens. O perfil típico possui smartphone Android, familiaridade com aplicativos de uso cotidiano como mensageria e banco digital, e nenhuma familiaridade com sistemas de gestão empresarial.

Excluem-se deste escopo redes com múltiplas filiais, operações com integração fiscal obrigatória e estabelecimentos que já utilizam sistema de frente de caixa integrado — cenários que exigiriam emissão de documento fiscal e conciliação contábil, fora dos limites deste projeto.

### 4.2 Personas

---

**Persona 1 — Dona Marlene, 54 anos — a proprietária**

Dona de uma mercearia de bairro em Goiânia há dezoito anos. Trabalha com o marido e uma funcionária. Controla o estoque "de cabeça" e anota as compras de fornecedor num caderno, que revisa nos domingos. Usa WhatsApp todos os dias e faz Pix sem dificuldade, mas nunca usou um sistema de gestão e desconfia de qualquer coisa que pareça complicada.

**Objetivos:** saber o que precisa comprar antes de o produto acabar; parar de descobrir vencimentos quando o cliente reclama; entender quais produtos realmente dão retorno.

**Frustrações:** já tentou uma planilha e abandonou em duas semanas porque dava trabalho demais; tem medo de perder os dados se trocar de celular.

**Consequência para o projeto:** o cadastro precisa ser rápido, com leitura de código de barras e preenchimento automático (RF12, RF31). Os alertas precisam chegar sem que ela vá procurar (RF19, RF20). A sincronização com o servidor é o que responde ao medo de perder dados (RF27). O perfil proprietário concentra o acesso financeiro (RN01).

---

**Persona 2 — Júnior, 22 anos — o operador**

Trabalha no balcão de uma loja de conveniência. É rápido no celular e não tem paciência com processos longos. Registra as saídas durante o atendimento, muitas vezes com fila esperando. Não é responsável por compras e não decide preço.

**Objetivos:** registrar uma saída em poucos segundos, sem sair do atendimento; conseguir consultar rapidamente se há um item no estoque quando o cliente pergunta.

**Frustrações:** formulários com muitos campos obrigatórios; qualquer coisa que exija digitar código manualmente; travamento quando o sinal cai no depósito.

**Consequência para o projeto:** o fluxo de saída é o caminho mais curto do aplicativo, acessível direto do painel. A leitura por câmera substitui a digitação (RF31). A persistência local garante que a falta de sinal não bloqueie o registro (RF26). O perfil operador não expõe custo nem margem (RN01), o que também protege a informação do proprietário.

---

**Persona 3 — Ricardo, 38 anos — o proprietário em expansão**

Abriu um minimercado há dois anos e planeja um segundo ponto. Tem perfil analítico, já usou planilhas com fórmulas e quer dados para negociar melhor com fornecedores. Contratou dois funcionários e não consegue mais acompanhar tudo pessoalmente.

**Objetivos:** identificar produtos de baixo giro para liberar capital; saber quanto tem investido em estoque; auditar quem registrou cada movimentação.

**Frustrações:** não consegue saber se uma divergência de estoque foi erro de registro ou perda; não tem histórico para negociar volume com fornecedor.

**Consequência para o projeto:** o histórico de movimentações precisa registrar o usuário responsável (RN05), o que sustenta a auditoria. Os relatórios de baixo giro e de mais vendidos atendem à análise (RF22, RF23). A gestão de fornecedores com histórico de compras apoia a negociação (RF15).

---

## 5. Requisitos funcionais

Priorização pelo método MoSCoW. **Obrigatório** indica requisito sem o qual a aplicação não atende ao mínimo de complexidade técnica da Seção 5 do documento norteador. **Desejável** agrega valor relevante. **Possível** é implementado conforme a capacidade da equipe. A coluna Ciclo indica o ciclo de desenvolvimento previsto, conforme a Seção 6 do documento norteador.

### 5.1 Autenticação e controle de acesso

| ID   | Requisito                                                                                                  | Prioridade  | Ciclo | Req. |
| ---- | ---------------------------------------------------------------------------------------------------------- | ----------- | ----- | ---- |
| RF01 | O sistema deve permitir o cadastro de usuário com nome, e-mail, senha e perfil                             | Obrigatório | 1     | R2   |
| RF02 | O sistema deve autenticar o usuário por e-mail e senha, com mensagem de erro genérica em caso de falha     | Obrigatório | 1     | R2   |
| RF03 | O sistema deve manter dois perfis de acesso, Proprietário e Operador, com permissões distintas             | Obrigatório | 1     | R2   |
| RF04 | O sistema deve permitir que o proprietário crie, edite e desative contas de operador vinculadas à sua loja | Desejável   | 2     | R2   |
| RF05 | O sistema deve permitir a recuperação de senha por envio de link ao e-mail cadastrado                      | Desejável   | 2     | R2   |
| RF06 | O sistema deve encerrar a sessão do usuário mediante solicitação                                           | Obrigatório | 1     | R2   |

### 5.2 Manutenção de produtos

| ID   | Requisito                                                                                                                       | Prioridade  | Ciclo | Req. |
| ---- | ------------------------------------------------------------------------------------------------------------------------------- | ----------- | ----- | ---- |
| RF07 | O sistema deve permitir o cadastro de produto com nome, categoria, preços de custo e venda, quantidade inicial e estoque mínimo | Obrigatório | 1     | R3   |
| RF08 | O sistema deve permitir o registro opcional de código de barras, fornecedor, data de validade e foto                            | Obrigatório | 1     | R3   |
| RF09 | O sistema deve listar os produtos cadastrados exibindo nome, quantidade e situação de estoque                                   | Obrigatório | 1     | R3   |
| RF10 | O sistema deve permitir a alteração dos dados de um produto, exceto a quantidade em estoque                                     | Obrigatório | 2     | R3   |
| RF11 | O sistema deve permitir a desativação de produto, preservando o histórico de movimentações                                      | Obrigatório | 2     | R3   |
| RF12 | O sistema deve exibir os dados completos de um produto, incluindo margem de lucro e histórico recente                           | Obrigatório | 2     | R3   |
| RF13 | O sistema deve calcular e exibir a margem de lucro a partir dos preços informados                                               | Obrigatório | 2     | R4   |

### 5.3 Manutenção de fornecedores e categorias

| ID   | Requisito                                                                                                              | Prioridade  | Ciclo | Req. |
| ---- | ---------------------------------------------------------------------------------------------------------------------- | ----------- | ----- | ---- |
| RF14 | O sistema deve permitir o cadastro de fornecedor com nome, telefone, e-mail, endereço e observações                    | Obrigatório | 2     | R3   |
| RF15 | O sistema deve listar os fornecedores e permitir a consulta dos produtos vinculados a cada um                          | Obrigatório | 2     | R3   |
| RF16 | O sistema deve permitir a alteração e a exclusão de fornecedor, impedindo a exclusão quando houver produtos vinculados | Obrigatório | 2     | R3   |
| RF17 | O sistema deve permitir a criação, alteração e desativação de categorias de produto                                    | Desejável   | 2     | R3   |

### 5.4 Movimentação de estoque

| ID   | Requisito                                                                                              | Prioridade  | Ciclo | Req. |
| ---- | ------------------------------------------------------------------------------------------------------ | ----------- | ----- | ---- |
| RF18 | O sistema deve registrar entrada de mercadoria com quantidade, tipo, data e observações                | Obrigatório | 1     | R3   |
| RF19 | O sistema deve registrar saída de mercadoria com quantidade, tipo, data e observações                  | Obrigatório | 1     | R3   |
| RF20 | O sistema deve exibir a previsão do saldo resultante antes da confirmação da movimentação              | Obrigatório | 1     | R10  |
| RF21 | O sistema deve impedir o registro de saída superior ao estoque disponível                              | Obrigatório | 1     | R4   |
| RF22 | O sistema deve atualizar o saldo do produto e registrar a movimentação no histórico de forma atômica   | Obrigatório | 1     | R4   |
| RF23 | O sistema deve apresentar o histórico de movimentações com filtro por tipo, produto, período e usuário | Obrigatório | 2     | R9   |

### 5.5 Alertas

| ID   | Requisito                                                                                               | Prioridade  | Ciclo | Req. |
| ---- | ------------------------------------------------------------------------------------------------------- | ----------- | ----- | ---- |
| RF24 | O sistema deve classificar cada produto em crítico, baixo, normal ou excesso, conforme o estoque mínimo | Obrigatório | 2     | R4   |
| RF25 | O sistema deve gerar alerta quando o estoque de um produto atingir ou ficar abaixo do mínimo            | Obrigatório | 2     | R4   |
| RF26 | O sistema deve gerar alerta para produtos cuja validade se aproxime do intervalo configurado            | Desejável   | 3     | R4   |
| RF27 | O sistema deve emitir notificação no dispositivo para alertas de estoque crítico e vencimento           | Obrigatório | 3     | R8   |
| RF28 | O sistema deve permitir a configuração do intervalo de antecedência do alerta de vencimento             | Possível    | 3     | —    |

### 5.6 Consulta e visões consolidadas

| ID   | Requisito                                                                                                                                            | Prioridade  | Ciclo | Req. |
| ---- | ---------------------------------------------------------------------------------------------------------------------------------------------------- | ----------- | ----- | ---- |
| RF29 | O sistema deve permitir a busca de produto por nome ou código de barras                                                                              | Obrigatório | 1     | R9   |
| RF30 | O sistema deve permitir filtrar produtos por categoria, fornecedor e situação de estoque                                                             | Obrigatório | 2     | R9   |
| RF31 | O sistema deve permitir ordenar a listagem de produtos por nome e por quantidade                                                                     | Obrigatório | 2     | R9   |
| RF32 | O sistema deve apresentar painel com total de produtos, valor total do estoque, quantidade de produtos críticos e de produtos próximos ao vencimento | Obrigatório | 2     | R9   |
| RF33 | O sistema deve apresentar gráfico dos produtos de maior saída no período selecionado                                                                 | Obrigatório | 2     | R9   |
| RF34 | O sistema deve apresentar relação de produtos de baixo giro, com o tempo desde a última saída                                                        | Desejável   | 2     | R9   |
| RF35 | O sistema deve permitir a exportação de relatório em formato PDF                                                                                     | Possível    | 4     | —    |

### 5.7 Persistência, sincronização e integração

| ID   | Requisito                                                                                                         | Prioridade  | Ciclo | Req. |
| ---- | ----------------------------------------------------------------------------------------------------------------- | ----------- | ----- | ---- |
| RF36 | O sistema deve armazenar todos os dados localmente no dispositivo                                                 | Obrigatório | 1     | R5   |
| RF37 | O sistema deve permanecer operante para consulta e registro na ausência de conectividade                          | Obrigatório | 1     | R5   |
| RF38 | O sistema deve sinalizar ao usuário a situação de ausência de conectividade                                       | Obrigatório | 1     | R10  |
| RF39 | O sistema deve sincronizar os dados locais com o serviço de retaguarda quando houver conexão                      | Obrigatório | 3     | R6   |
| RF40 | O sistema deve permitir que o usuário force a sincronização manualmente                                           | Desejável   | 3     | R6   |
| RF41 | O sistema deve consultar serviço externo para obter dados do produto a partir do código de barras                 | Obrigatório | 3     | R7   |
| RF42 | O sistema deve permitir o cadastro manual quando o serviço externo estiver indisponível ou não retornar resultado | Obrigatório | 3     | R10  |
| RF43 | O sistema deve utilizar a câmera do dispositivo para leitura de código de barras                                  | Obrigatório | 3     | R8   |

---

## 6. Requisitos não funcionais

| ID    | Categoria        | Requisito                                                                                                                                                                  | Prioridade  |
| ----- | ---------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------- |
| RNF01 | Usabilidade      | As ações do fluxo principal — registrar entrada e saída — devem ser alcançáveis em no máximo dois toques a partir do painel                                                | Obrigatório |
| RNF02 | Usabilidade      | Toda operação que altere dados deve apresentar confirmação explícita de sucesso ou de falha                                                                                | Obrigatório |
| RNF03 | Acessibilidade   | O contraste entre texto e fundo deve atender ao mínimo de 4,5:1 estabelecido pela WCAG 2.1 nível AA                                                                        | Obrigatório |
| RNF04 | Acessibilidade   | Os elementos interativos devem ter área de toque mínima de 44 por 44 pixels                                                                                                | Obrigatório |
| RNF05 | Acessibilidade   | Campos de formulário e controles de ícone devem possuir rótulo descritivo acessível a leitores de tela                                                                     | Obrigatório |
| RNF06 | Acessibilidade   | A informação não deve ser transmitida exclusivamente por cor                                                                                                               | Obrigatório |
| RNF07 | Desempenho       | A listagem de produtos deve responder em até dois segundos para catálogo de até mil itens                                                                                  | Desejável   |
| RNF08 | Desempenho       | A consulta ao serviço externo deve ter tempo limite de cinco segundos, com degradação graciosa                                                                             | Obrigatório |
| RNF09 | Confiabilidade   | A atualização de saldo e o registro no histórico devem ocorrer em transação única, sem estado intermediário observável                                                     | Obrigatório |
| RNF10 | Confiabilidade   | Falha de rede durante a sincronização não deve causar perda de registro local nem duplicação                                                                               | Obrigatório |
| RNF11 | Segurança        | Senhas devem ser armazenadas exclusivamente como resumo criptográfico com função de derivação adequada                                                                     | Obrigatório |
| RNF12 | Segurança        | Credenciais e chaves de acesso não devem ser versionadas no repositório                                                                                                    | Obrigatório |
| RNF13 | Segurança        | O perfil Operador não deve ter acesso a preço de custo, valor total do estoque e relatórios financeiros, tanto na interface quanto na resposta da interface de programação | Obrigatório |
| RNF14 | Manutenibilidade | O código deve estar organizado em camadas de apresentação, negócio e persistência, com nomenclatura consistente                                                            | Obrigatório |
| RNF15 | Portabilidade    | A aplicação deve executar em dispositivo Android físico a partir de pacote instalável                                                                                      | Obrigatório |

---

## 7. Regras de negócio

Cada regra indica o comportamento esperado e o ponto em que é verificável. As regras assinaladas como **não triviais** são as que atendem ao requisito R4 da Seção 5 do documento norteador, que exige no mínimo três regras dessa natureza.

---

**RN01 — Segregação de acesso por perfil** · _não trivial_

O perfil Proprietário tem acesso completo. O perfil Operador pode consultar produtos, registrar entradas e saídas e visualizar alertas, mas não acessa preço de custo, valor total do estoque, margem de lucro nem relatórios financeiros.

A restrição é aplicada em duas camadas: a interface omite os elementos e a camada de negócio filtra os campos antes de compor a resposta. A omissão apenas visual seria insuficiente, já que a informação continuaria acessível pela interface de programação.

_Verificável em:_ autenticação com perfil Operador, comparando a tela de detalhes do produto e a resposta do serviço com as do perfil Proprietário.

---

**RN02 — Unicidade de e-mail**

Não podem existir dois usuários ativos com o mesmo e-mail. Garantida por restrição de unicidade no banco e validada antes da submissão do formulário.

---

**RN03 — Preço de venda inferior ao custo**

Quando o preço de venda informado for inferior ao preço de custo, o sistema apresenta advertência, mas permite a gravação. A operação é legítima em liquidação e em queima de estoque próximo ao vencimento, e por isso não é bloqueada.

_Verificável em:_ cadastro de produto com preço de venda menor que o custo.

---

**RN04 — Unicidade de código de barras**

Dentro de uma mesma loja, um código de barras não pode estar associado a mais de um produto ativo. O campo é opcional; produtos sem código de barras não são afetados.

---

**RN05 — Rastreabilidade da movimentação**

Toda movimentação registra obrigatoriamente produto, usuário responsável, tipo, quantidade, saldo resultante e instante do registro. Nenhum desses campos admite ausência, e o registro não pode ser alterado nem removido após a gravação — correções são feitas por movimentação de ajuste em sentido contrário, preservando a trilha de auditoria.

_Verificável em:_ histórico de movimentações, que exibe o usuário responsável por cada lançamento.

---

**RN06 — Saída limitada ao estoque disponível** · _não trivial_

Não é permitido registrar saída de quantidade superior ao estoque disponível do produto. A validação ocorre na camada de negócio, dentro da transação que atualiza o saldo, e é reforçada por restrição de verificação no banco que impede saldo negativo.

A validação apenas na interface seria insuficiente: em operação offline com sincronização posterior, duas saídas registradas em dispositivos distintos poderiam, somadas, exceder o saldo. A verificação no momento da consolidação é o que garante a consistência.

_Verificável em:_ tela de movimentação, informando saída superior ao saldo. No protótipo, `prototipo/movimentacao.html` já demonstra o bloqueio.

---

**RN07 — Classificação automática da situação de estoque e geração de alerta** · _não trivial_

A cada alteração de saldo, o produto é reclassificado em relação ao estoque mínimo definido pelo usuário:

| Situação | Condição                                                     |
| -------- | ------------------------------------------------------------ |
| Crítico  | saldo menor ou igual ao estoque mínimo                       |
| Baixo    | saldo maior que o mínimo e menor ou igual a 1,5 vez o mínimo |
| Normal   | saldo maior que 1,5 vez e menor ou igual a 3 vezes o mínimo  |
| Excesso  | saldo maior que 3 vezes o mínimo                             |

Ao entrar em situação crítica, é gerado alerta não lido para o produto, desde que ainda não exista alerta ativo do mesmo tipo — o que evita acúmulo de avisos repetidos. Quando o saldo é reposto acima do mínimo, os alertas de estoque crítico pendentes daquele produto são baixados automaticamente.

_Verificável em:_ registro de saída que leve o saldo ao mínimo, seguido de entrada que o recomponha. No protótipo, `prototipo/movimentacao.html` demonstra a advertência.

---

**RN08 — Valor total do estoque**

O valor total do estoque corresponde à soma, entre todos os produtos ativos, do produto entre quantidade em estoque e preço de custo unitário. Utiliza-se o custo, não o preço de venda, porque o indicador representa capital imobilizado e não receita potencial. Visível apenas ao perfil Proprietário, conforme RN01.

---

**RN09 — Resolução de conflito na sincronização**

Registros criados ou alterados sem conectividade são marcados como pendentes e enviados em ordem cronológica ao restabelecimento da conexão. Em caso de conflito sobre o mesmo registro, prevalece a alteração de instante mais recente. Movimentações não entram em conflito por serem imutáveis (RN05): são apenas acrescentadas, e o saldo é recomposto a partir da sequência consolidada.

---

**RN10 — Cálculo da margem de lucro**

A margem é calculada como a diferença entre preço de venda e preço de custo, dividida pelo preço de venda, e apresentada em valor absoluto e percentual. Quando o preço de venda for zero, a margem não é calculada. Visível apenas ao perfil Proprietário, conforme RN01.

---

**RN11 — Alerta de vencimento**

Produtos com data de validade informada e dentro do intervalo de antecedência configurado — sete, quinze ou trinta dias, com quinze como padrão — entram na relação de próximos ao vencimento e geram alerta. Produtos sem data de validade não são afetados.

---

**RN12 — Desativação em vez de exclusão física**

Produtos, fornecedores, categorias e usuários não são removidos fisicamente: são marcados como inativos. Registros inativos deixam de aparecer nas listagens e nos seletores, mas permanecem referenciáveis pelo histórico de movimentações.

A exclusão física de um produto invalidaria todo o histórico associado, comprometendo a auditoria exigida por RN05. Por isso a chave estrangeira do histórico é restritiva e impede a remoção.

_Verificável em:_ desativação de produto com histórico, seguida de consulta ao histórico de movimentações.

---

**RN13 — Integridade referencial do fornecedor**

Um fornecedor não pode ser excluído enquanto houver produtos vinculados a ele. O sistema informa a quantidade de produtos impedindo a operação e orienta a reatribuição ou desativação prévia.

_Verificável em:_ `prototipo/fornecedores.html`, tentando excluir fornecedor com produtos vinculados.

---

### 7.1 Síntese do atendimento ao requisito R4

O requisito R4 exige no mínimo três regras de negócio não triviais, documentadas e verificáveis. O projeto apresenta cinco regras que atendem a esse critério, das quais três já são demonstráveis no protótipo:

| Regra | Por que não é trivial                                                                                       | Demonstrável no protótipo       |
| ----- | ----------------------------------------------------------------------------------------------------------- | ------------------------------- |
| RN01  | Exige aplicação em duas camadas e altera a composição da resposta do serviço conforme o perfil              | Sim, em `configuracoes.html`    |
| RN06  | Exige validação transacional e considera o cenário de registros concorrentes vindos de dispositivos offline | Sim, em `movimentacao.html`     |
| RN07  | Envolve classificação em faixas, criação condicional de alerta e baixa automática na reposição              | Sim, em `movimentacao.html`     |
| RN12  | Determina a política de integridade referencial de todo o modelo                                            | Sim, em `produto-detalhes.html` |
| RN13  | Impede operação que quebraria a integridade, com orientação ao usuário                                      | Sim, em `fornecedores.html`     |

As regras RN02 e RN04, de unicidade, não são contabilizadas aqui por serem restrições triviais de integridade.

---

## 8. Modelagem de dados

O modelo conceitual e lógico, o diagrama entidade-relacionamento, os scripts de criação, as consultas relevantes e a estratégia de persistência local estão em [`02-modelagem-de-dados.md`](02-modelagem-de-dados.md).

Síntese: sete entidades — `loja`, `usuario`, `categoria`, `fornecedor`, `produto`, `movimentacao` e `alerta` — normalizadas até a terceira forma normal, com uma desnormalização deliberada e justificada no campo de saldo resultante da movimentação.

---

## 9. Definição arquitetural

A organização em camadas, o fluxo de dados entre aplicação móvel e retaguarda, a justificativa da pilha tecnológica e as alternativas descartadas estão em [`03-arquitetura.md`](03-arquitetura.md).

---

## 10. Cronograma interno e distribuição de responsabilidades

O cronograma por ciclo, a alocação de requisitos por integrante e o registro de cada ciclo estão em [`06-gestao-do-projeto.md`](06-gestao-do-projeto.md). O backlog priorizado em formato de história de usuário, com critérios de aceite, está em [`05-backlog.md`](05-backlog.md).

---

## 11. Referências

**Documentos normativos da disciplina**

PONTIFÍCIA UNIVERSIDADE CATÓLICA DE GOIÁS. Escola Politécnica e de Artes. _Documento Norteador do Projeto Integrador — Desenvolvimento de Aplicação Móvel_. Versão 2.0. Goiânia, 2026.

JÚLIO, Welington. _ADS1253 — Projeto Integrador do Módulo: objetivo, entregáveis, cronograma e critérios de avaliação_. Atividade Externa da Disciplina. PUC Goiás, 2026.

**Referências técnicas**

NIELSEN, Jakob. _10 Usability Heuristics for User Interface Design_. Nielsen Norman Group. Disponível em: https://www.nngroup.com/articles/ten-usability-heuristics/

WORLD WIDE WEB CONSORTIUM. _Web Content Accessibility Guidelines (WCAG) 2.1_. W3C Recommendation, 2018. Disponível em: https://www.w3.org/TR/WCAG21/

GOOGLE. _Material Design 3 — Accessibility_. Disponível em: https://m3.material.io/foundations/accessible-design/overview

META PLATFORMS. _React Native Documentation_. Disponível em: https://reactnative.dev/docs/getting-started

EXPO. _Expo Documentation_. Disponível em: https://docs.expo.dev/

VMWARE TANZU. _Spring Boot Reference Documentation_. Disponível em: https://docs.spring.io/spring-boot/index.html

POSTGRESQL GLOBAL DEVELOPMENT GROUP. _PostgreSQL Documentation_. Disponível em: https://www.postgresql.org/docs/

OPEN FOOD FACTS. _Open Food Facts API Documentation_. Disponível em: https://openfoodfacts.github.io/openfoodfacts-server/api/

---

## Controle de versões do documento

| Versão | Data       | Alterações                                      | Responsável      |
| ------ | ---------- | ----------------------------------------------- | ---------------- |
| 1.0    | 28/09/2026 | Versão inicial consolidada para a entrega da N1 | Equipe StockEasy |
