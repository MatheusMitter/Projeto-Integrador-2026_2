# Backlog do Produto — StockEasy

**Projeto:** StockEasy — Controle de Estoque Inteligente
**Artefato do Checkpoint 1 (11/09/2026), revisado para a entrega N1 (29/09 a 02/10/2026)**
**Formato:** Histórias de usuário priorizadas
**Ferramenta:** GitHub Projects — https://github.com/MatheusMitter/Projeto-Integrador-2026_2/projects
**Versão:** 2.0 — 28/09/2026

---

## Histórico de revisão

| Correção na versão 2.0                                               | Motivo                                                                                                                            |
| -------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| Sprints renomeadas para Ciclos, com datas explícitas                 | A versão 1.0 usava "Sprint 1 a 4" sem datas, desalinhadas dos quatro ciclos definidos na Seção 6 do documento norteador           |
| Persistência local movida do Ciclo 3 para o Ciclo 1                  | A Semana 8 do cronograma oficial exige "primeiro módulo funcional integrado à persistência local" já na N1                        |
| US07 e US09 reescritas                                               | Diziam coisas contraditórias: uma afirmava que a exclusão remove o histórico, a outra que a exclusão é "permanente (soft delete)" |
| Adicionada legenda das estimativas                                   | As siglas P, M, G e XG apareciam sem definição de esforço                                                                         |
| Adicionada US30, de manutenção de categorias                         | O modelo passou a ter categoria como entidade, e não havia história cobrindo sua manutenção                                       |
| Mapeamento de R4 passou a distinguir regras triviais de não triviais | O requisito exige três regras **não triviais**; unicidade de e-mail e de código de barras não contam                              |

---

## Como ler este backlog

Cada história segue o formato:

```
ID | Título
Como <perfil>, quero <ação>, para <benefício>
Prioridade · Estimativa · Ciclo · Responsável
Critérios de aceite
Regras de negócio aplicáveis · Dependências
```

### Legenda de estimativas

A estimativa é relativa, em esforço de equipe, e não em horas de calendário.

| Sigla | Esforço                          | Referência                                                        |
| ----- | -------------------------------- | ----------------------------------------------------------------- |
| P     | Pequeno, até meio dia            | Tela simples ou um formulário sem regra de negócio                |
| M     | Médio, cerca de um dia           | Tela com validações, ou operação que envolve mais de uma entidade |
| G     | Grande, dois a três dias         | Fluxo completo com regra de negócio e persistência                |
| XG    | Muito grande, acima de três dias | Deve ser quebrado antes de entrar em um ciclo                     |

Histórias XG são sinal de que falta decompor. US25, de sincronização, é o único caso e está decomposta em subitens no seu detalhamento.

### Ciclos de desenvolvimento

Os ciclos seguem a Seção 6 e o detalhamento semanal da Seção 7.2 do documento norteador. Não são sprints arbitrárias.

| Ciclo   | Semanas | Período            | Foco                                                                                  | Marco        |
| ------- | ------- | ------------------ | ------------------------------------------------------------------------------------- | ------------ |
| Ciclo 1 | 7 e 8   | 14 a 25/09/2026    | Estrutura em camadas, navegação, autenticação, primeiro módulo com persistência local | Entrega N1   |
| Ciclo 2 | 11 e 12 | 13 a 23/10/2026    | Manutenção de dados das entidades, validações, regras, listagens e visão consolidada  | —            |
| Ciclo 3 | 13 e 14 | 26/10 a 06/11/2026 | Retaguarda, sincronização, serviço externo e recurso nativo                           | Checkpoint 2 |
| Ciclo 4 | 16 e 17 | 16 a 27/11/2026    | Correção de defeitos, acessibilidade, pacote instalável                               | Congelamento |

A Semana 15 (09 a 13/11) é de verificação: testes funcionais e sessões de usabilidade, entre os Ciclos 3 e 4.

---

## ÉPICO 1: Autenticação e Gestão de Usuários

### US01 | Cadastro de Usuário

**Como** proprietário de um pequeno comércio  
**Quero** criar uma conta no aplicativo  
**Para** começar a usar o sistema de controle de estoque

**Prioridade:** ALTA  
**Estimativa:** M  
**Ciclo:** Ciclo 1 (14 a 25/09) — entra na N1
**Responsável:** Vitor

**Critérios de Aceite:**

- [ ] Formulário com campos: nome completo, e-mail, senha, confirmação de senha, tipo de perfil (proprietário/operador)
- [ ] Validação de e-mail (formato válido e não duplicado)
- [ ] Senha com no mínimo 8 caracteres, incluindo letras e números
- [ ] Indicador visual de força da senha
- [ ] Confirmação de senha deve coincidir
- [ ] Checkbox de aceite dos termos de uso
- [ ] Mensagem de erro clara para cada tipo de validação
- [ ] Criação bem-sucedida redireciona para o dashboard

**Regras de Negócio:**

- RN01: Perfil "Proprietário" tem acesso completo; perfil "Operador" não acessa relatórios financeiros
- RN02: E-mail único por conta

---

### US02 | Login no Sistema

**Como** usuário cadastrado  
**Quero** fazer login com e-mail e senha  
**Para** acessar minhas informações de estoque

**Prioridade:** ALTA  
**Estimativa:** P  
**Ciclo:** Ciclo 1 (14 a 25/09) — entra na N1
**Responsável:** Vitor

**Critérios de Aceite:**

- [ ] Campos de e-mail e senha
- [ ] Validação: credenciais corretas redirecionam ao dashboard
- [ ] Validação: credenciais incorretas mostram mensagem de erro genérica ("E-mail ou senha inválidos")
- [ ] Botão de alternar visibilidade da senha (mostrar/ocultar)
- [ ] Link para recuperação de senha
- [ ] Link para cadastro de nova conta
- [ ] Estado de carregamento durante autenticação

**Dependências:** US01

---

### US03 | Recuperação de Senha

**Como** usuário que esqueceu a senha  
**Quero** receber um link de recuperação por e-mail  
**Para** redefinir minha senha e voltar a acessar o sistema

**Prioridade:** MÉDIA  
**Estimativa:** M  
**Ciclo:** Ciclo 2 (13 a 23/10)
**Responsável:** Vitor

**Critérios de Aceite:**

- [ ] Campo para inserir e-mail cadastrado
- [ ] Validação: se e-mail existe, enviar link de recuperação
- [ ] Link de recuperação válido por 24 horas
- [ ] Tela de redefinição de senha com confirmação
- [ ] Mensagem de confirmação de envio (mesmo se e-mail não existir, por segurança)
- [ ] Após redefinição bem-sucedida, redirecionar para login

---

### US04 | Gestão de Perfis de Acesso

**Como** proprietário  
**Quero** criar contas de operadores vinculadas à minha loja  
**Para** que meus funcionários possam registrar movimentações sem acessar dados financeiros

**Prioridade:** MÉDIA  
**Estimativa:** M  
**Ciclo:** Ciclo 2 (13 a 23/10)
**Responsável:** Matheus

**Critérios de Aceite:**

- [ ] Proprietário pode criar, editar e desativar contas de operadores
- [ ] Operadores vinculados à mesma "loja" (identificador comum)
- [ ] Operadores não veem: valor de custo, valor total do estoque, relatórios financeiros
- [ ] Operadores podem: registrar entradas/saídas, consultar produtos, ver alertas
- [ ] Histórico de movimentações registra qual usuário fez cada ação

**Regras de Negócio:**

- RN01: Perfil "Proprietário" tem acesso completo; perfil "Operador" tem acesso limitado

---

## ÉPICO 2: Gestão de Produtos

### US05 | Cadastrar Produto

**Como** proprietário ou operador  
**Quero** cadastrar um novo produto no sistema  
**Para** começar a controlar seu estoque

**Prioridade:** ALTA  
**Estimativa:** G  
**Ciclo:** Ciclo 1 (14 a 25/09) — entra na N1
**Responsável:** Vitor

**Critérios de Aceite:**

- [ ] Formulário com campos obrigatórios: nome, categoria, preço de custo (só proprietário), preço de venda, quantidade inicial, estoque mínimo
- [ ] Campos opcionais: código de barras, fornecedor, data de validade, foto
- [ ] Validação: nome não vazio, preços numéricos positivos, estoque mínimo ≥ 0
- [ ] Botão de scanner de código de barras (ativa câmera)
- [ ] Após leitura de código de barras, tentar buscar dados via API externa (nome, categoria, foto)
- [ ] Opção de capturar foto do produto via câmera ou galeria
- [ ] Cálculo automático de margem de lucro (preço venda - custo)
- [ ] Dropdown de categorias pré-definidas + opção de criar nova
- [ ] Dropdown de fornecedores cadastrados + opção de criar novo
- [ ] Salvamento persiste no banco local e sincroniza com servidor
- [ ] Mensagem de confirmação após salvamento

**Regras de Negócio:**

- RN03: Preço de venda deve ser maior ou igual ao preço de custo (alerta se for menor, mas permite salvar)
- RN04: Código de barras, se informado, deve ser único no sistema

**Dependências:** US02

**Dependências postergadas:** o seletor de fornecedor (US15) e a leitura por código de barras (US21) entram nos Ciclos 2 e 3. No Ciclo 1 o campo de fornecedor é texto livre opcional e o código de barras é digitado, de modo que esta história não fica bloqueada.

---

### US06 | Listar Produtos

**Como** usuário  
**Quero** ver uma lista de todos os produtos cadastrados  
**Para** consultar rapidamente informações de estoque

**Prioridade:** ALTA  
**Estimativa:** M  
**Ciclo:** Ciclo 1 (14 a 25/09) — entra na N1
**Responsável:** Vitor

**Critérios de Aceite:**

- [ ] Lista exibe: foto (ou placeholder), nome, quantidade em estoque, status visual (crítico/baixo/normal/excesso)
- [ ] Status visual baseado no estoque mínimo: crítico (≤ estoque mínimo), baixo (≤ 1.5x estoque mínimo), normal, excesso (> 3x estoque mínimo)
- [ ] Busca por nome ou código de barras (filtro em tempo real)
- [ ] Filtros: categoria, fornecedor, status de estoque
- [ ] Ordenação: nome (A-Z, Z-A), quantidade (menor→maior, maior→menor)
- [ ] Toque no item abre tela de detalhes
- [ ] Ícone de edição rápida em cada item
- [ ] Estado vazio: mensagem "Nenhum produto cadastrado" com botão para cadastrar
- [ ] Estado de carregamento: skeleton screens
- [ ] Paginação ou scroll infinito se houver muitos produtos

**Dependências:** US05

---

### US07 | Visualizar Detalhes do Produto

**Como** usuário  
**Quero** ver informações completas de um produto  
**Para** tomar decisões sobre reposição ou vendas

**Prioridade:** ALTA  
**Estimativa:** M  
**Ciclo:** Ciclo 1 (14 a 25/09) — entra na N1
**Responsável:** Vitor

**Critérios de Aceite:**

- [ ] Exibe: foto, nome, código de barras, categoria, fornecedor, estoque atual, estoque mínimo, preços (custo só para proprietário, venda), margem de lucro, data de validade
- [ ] Status visual destacado (crítico/baixo/normal/excesso)
- [ ] Histórico das últimas 10 movimentações deste produto (data, tipo, quantidade, saldo, usuário)
- [ ] Botões de ação: "Registrar Entrada", "Registrar Saída", "Editar", "Desativar"
- [ ] Confirmação ao desativar explica o efeito: o produto sai das listagens e o histórico é preservado
- [ ] A desativação não remove o histórico de movimentações (RN12)

**Regras de Negócio:**

- RN01: o preço de custo e a margem de lucro não são exibidos ao perfil Operador
- RN10: a margem é calculada a partir dos preços cadastrados
- RN12: produto é desativado, nunca excluído fisicamente

**Dependências:** US05, US06

---

### US08 | Editar Produto

**Como** usuário  
**Quero** alterar informações de um produto cadastrado  
**Para** corrigir erros ou atualizar preços

**Prioridade:** ALTA  
**Estimativa:** M  
**Ciclo:** Ciclo 2 (13 a 23/10)
**Responsável:** Vitor

**Critérios de Aceite:**

- [ ] Formulário idêntico ao de cadastro, pré-preenchido com dados atuais
- [ ] Todas as validações do cadastro aplicam-se
- [ ] Alteração de quantidade não é permitida por aqui (deve usar movimentação)
- [ ] Salvamento atualiza no banco local e sincroniza com servidor
- [ ] Mensagem de confirmação após salvamento

**Dependências:** US05, US07

---

### US09 | Desativar Produto

**Como** proprietário
**Quero** retirar de circulação produtos que não trabalho mais
**Para** manter o catálogo organizado sem perder o histórico

**Prioridade:** MÉDIA
**Estimativa:** P
**Ciclo:** Ciclo 2 (13 a 23/10)
**Responsável:** Vitor

> **Reescrita na versão 2.0.** A redação anterior era contraditória: prometia excluir "o produto e todo o histórico", oferecia desativação como alternativa e ainda afirmava que a exclusão era "permanente (soft delete)" — três comportamentos incompatíveis. A decisão está registrada em RN12: existe apenas desativação. Também era contraditória com a US07, que dizia que a exclusão remove o histórico.

**Critérios de Aceite:**

- [ ] Apenas o perfil Proprietário pode desativar produto
- [ ] Modal de confirmação explica o efeito real: "O produto deixa de aparecer nas listagens e nos seletores. O histórico de movimentações é preservado para auditoria."
- [ ] O produto desativado não aparece nas listagens, na busca nem nos seletores de movimentação
- [ ] O produto desativado continua referenciável pelo histórico, que segue consultável
- [ ] Alertas pendentes do produto são baixados na desativação
- [ ] O produto desativado não entra no cálculo do valor total do estoque (RN08)
- [ ] É possível reativar um produto desativado
- [ ] Confirmação: "Produto desativado com sucesso"
- [ ] Não existe operação de exclusão física na interface

**Regras de Negócio:**

- RN01: operação restrita ao perfil Proprietário
- RN12: desativação em vez de exclusão física, preservando a auditoria

**Dependências:** US07

---

## ÉPICO 3: Controle de Estoque (Movimentações)

### US10 | Registrar Entrada de Mercadoria

**Como** usuário  
**Quero** registrar a entrada de produtos no estoque  
**Para** atualizar a quantidade disponível após uma compra

**Prioridade:** ALTA  
**Estimativa:** G  
**Ciclo:** Ciclo 1 (14 a 25/09) — entra na N1
**Responsável:** Felipe

**Critérios de Aceite:**

- [ ] Seleção de produto via busca ou scanner de código de barras
- [ ] Campos: quantidade (obrigatório), tipo de entrada (Compra, Devolução de cliente, Ajuste, Outros), data/hora (padrão: atual, editável), observações (opcional)
- [ ] Previsão visual: "Estoque atual: X | Após entrada: Y"
- [ ] Validação: quantidade > 0
- [ ] Salvamento: atualiza estoque do produto, cria registro no histórico de movimentações, sincroniza
- [ ] Se produto estava crítico e volta ao normal, limpar alerta
- [ ] Mensagem de confirmação: "Entrada registrada com sucesso!"

**Regras de Negócio:**

- RN05: Toda movimentação é registrada no histórico com timestamp, usuário, produto, tipo, quantidade e saldo resultante

**Dependências:** US05

**Dependência postergada:** a seleção por leitura de código de barras (US21) entra no Ciclo 3. No Ciclo 1 o produto é selecionado por busca textual.

---

### US11 | Registrar Saída de Mercadoria

**Como** usuário  
**Quero** registrar a saída de produtos do estoque  
**Para** atualizar a quantidade após vendas, perdas ou vencimentos

**Prioridade:** ALTA  
**Estimativa:** G  
**Ciclo:** Ciclo 1 (14 a 25/09) — entra na N1
**Responsável:** Felipe

**Critérios de Aceite:**

- [ ] Seleção de produto via busca ou scanner de código de barras
- [ ] Campos: quantidade (obrigatório), tipo de saída (Venda, Perda, Vencimento, Devolução a fornecedor, Ajuste, Outros), data/hora (padrão: atual, editável), observações (opcional)
- [ ] Previsão visual: "Estoque atual: X | Após saída: Y"
- [ ] Validação: quantidade > 0 e ≤ estoque atual
- [ ] Se saída resultar em estoque ≤ estoque mínimo, exibir alerta: "Atenção: produto ficará crítico!"
- [ ] Salvamento: atualiza estoque do produto, cria registro no histórico, sincroniza
- [ ] Se estoque ficar crítico, gerar notificação
- [ ] Mensagem de confirmação: "Saída registrada com sucesso!"

**Regras de Negócio:**

- RN05: Toda movimentação é registrada no histórico com timestamp, usuário, produto, tipo, quantidade e saldo resultante
- RN06: Não é possível registrar saída maior que o estoque disponível (validação hard)

**Dependências:** US05

**Dependência postergada:** a seleção por leitura de código de barras (US21) entra no Ciclo 3. No Ciclo 1 o produto é selecionado por busca textual.

---

### US12 | Visualizar Histórico de Movimentações

**Como** usuário  
**Quero** consultar o histórico completo de movimentações  
**Para** auditar entradas e saídas e identificar padrões

**Prioridade:** MÉDIA  
**Estimativa:** M  
**Ciclo:** Ciclo 2 (13 a 23/10)
**Responsável:** Felipe

**Critérios de Aceite:**

- [ ] Lista cronológica (mais recente primeiro) de todas as movimentações
- [ ] Cada item exibe: data/hora, tipo (entrada/saída com ícone e cor), produto, quantidade, saldo após movimentação, usuário responsável
- [ ] Filtros: tipo de movimentação, produto específico, período (data inicial e final), usuário
- [ ] Busca por nome de produto
- [ ] Toque em item abre modal com detalhes completos (incluindo observações)
- [ ] Paginação ou scroll infinito

**Dependências:** US10, US11

---

## ÉPICO 4: Alertas e Notificações

### US13 | Alerta de Produto em Estoque Crítico

**Como** proprietário  
**Quero** receber alertas quando produtos atingirem o estoque mínimo  
**Para** repor a tempo e evitar falta

**Prioridade:** ALTA  
**Estimativa:** M  
**Ciclo:** Ciclo 2 (13 a 23/10)
**Responsável:** Matheus

**Critérios de Aceite:**

- [ ] Quando estoque ≤ estoque mínimo, produto entra na lista de "críticos"
- [ ] Dashboard exibe card "Produtos Críticos" com contador e botão "Ver produtos"
- [ ] Notificação push: "Atenção: [nome do produto] está em falta!" (se notificações ativadas)
- [ ] Ícone de notificações no dashboard com badge numérico
- [ ] Lista de produtos críticos acessível em um toque
- [ ] Alerta persiste até que o estoque seja reposto acima do mínimo

**Regras de Negócio:**

- RN07: Produto com estoque ≤ estoque mínimo é classificado como "crítico" e gera alerta

**Dependências:** US06, US10, US11

**Dependência postergada:** a notificação no dispositivo (US22) entra no Ciclo 3. No Ciclo 2 o alerta aparece no painel e na lista de produtos, sem envio de notificação.

---

### US14 | Alerta de Produto Próximo ao Vencimento

**Como** proprietário  
**Quero** receber alertas de produtos próximos ao vencimento  
**Para** promovê-los ou descartar antes da validade

**Prioridade:** MÉDIA  
**Estimativa:** M  
**Ciclo:** Ciclo 3 (26/10 a 06/11) — entra no Checkpoint 2
**Responsável:** Matheus

**Critérios de Aceite:**

- [ ] Produtos com data de validade dentro de X dias (configurável, padrão 15) entram na lista de "próximos ao vencimento"
- [ ] Dashboard exibe card com contador e botão "Ver produtos"
- [ ] Notificação push diária (às 9h): "Você tem [N] produtos próximos ao vencimento"
- [ ] Lista de produtos com data de vencimento destacada
- [ ] Configuração em "Configurações": intervalo de alerta (7, 15, 30 dias)

**Dependências:** US05, US22 (ambas no Ciclo 3)

---

## ÉPICO 5: Gestão de Fornecedores

### US15 | Cadastrar Fornecedor

**Como** proprietário  
**Quero** cadastrar fornecedores  
**Para** associá-los aos produtos e facilitar reposições

**Prioridade:** MÉDIA  
**Estimativa:** P  
**Ciclo:** Ciclo 2 (13 a 23/10)
**Responsável:** Vitor

**Critérios de Aceite:**

- [ ] Formulário: nome (obrigatório), telefone, e-mail, endereço, observações
- [ ] Validação: nome não vazio
- [ ] Salvamento persiste no banco local e sincroniza
- [ ] Mensagem de confirmação

**Dependências:** US02

---

### US16 | Listar e Editar Fornecedores

**Como** proprietário  
**Quero** ver e editar informações de fornecedores  
**Para** manter dados atualizados

**Prioridade:** ALTA
**Estimativa:** P
**Ciclo:** Ciclo 2 (13 a 23/10)
**Responsável:** Vitor

> **Prioridade elevada de BAIXA para ALTA na versão 2.0.** O requisito R3 exige operações **completas** de inclusão, consulta, alteração e exclusão sobre no mínimo duas entidades. Sem esta história, Fornecedor só teria inclusão (US15), e a segunda entidade com manutenção completa deixaria de existir. Classificá-la como BAIXA colocava um requisito obrigatório em risco.

**Critérios de Aceite:**

- [ ] Lista de fornecedores com nome, telefone e quantidade de produtos vinculados
- [ ] Busca por nome
- [ ] Toque abre o formulário de edição preenchido
- [ ] Edição persiste localmente e entra na fila de sincronização
- [ ] Exclusão permitida apenas quando não houver produtos vinculados (RN13)
- [ ] Ao bloquear a exclusão, informa a quantidade de produtos que impedem a operação e orienta a reatribuição
- [ ] Fornecedor sem produtos vinculados pode ser excluído, com confirmação

**Regras de Negócio:**

- RN01: operação restrita ao perfil Proprietário
- RN13: integridade referencial do fornecedor

**Dependências:** US15

---

### US30 | Manutenção de Categorias

**Como** proprietário
**Quero** criar e manter as categorias dos meus produtos
**Para** classificar o catálogo conforme a realidade da minha loja

**Prioridade:** MÉDIA
**Estimativa:** P
**Ciclo:** Ciclo 2 (13 a 23/10)
**Responsável:** Vitor

> **História nova na versão 2.0.** A categoria deixou de ser texto com lista fixa e passou a ser entidade própria no modelo de dados, justamente porque o cadastro de produto e a tela de configurações prometiam permitir criar categorias. Não havia história cobrindo essa manutenção.

**Critérios de Aceite:**

- [ ] Lista as categorias da loja, com a quantidade de produtos em cada uma
- [ ] Permite criar categoria informando apenas o nome
- [ ] Permite renomear categoria existente
- [ ] Impede criar duas categorias com o mesmo nome na mesma loja
- [ ] Permite desativar categoria sem produtos ativos vinculados
- [ ] Impede desativar categoria com produtos ativos, informando a quantidade
- [ ] A loja é criada com cinco categorias padrão: Alimentos, Bebidas, Limpeza, Higiene e Outros
- [ ] Acessível por Configurações, em "Gerenciar categorias"

**Regras de Negócio:**

- RN01: operação restrita ao perfil Proprietário
- RN12: categoria é desativada, não excluída fisicamente

**Dependências:** US02

---

## ÉPICO 6: Relatórios e Visões Consolidadas

### US17 | Visão Geral do Estoque (Dashboard)

**Como** usuário  
**Quero** ver um resumo visual do estado do estoque  
**Para** tomar decisões rápidas

**Prioridade:** ALTA  
**Estimativa:** M  
**Ciclo:** Ciclo 2 (13 a 23/10)
**Responsável:** Matheus

**Critérios de Aceite:**

- [ ] Cards com: total de produtos cadastrados, valor total em estoque (proprietário), produtos críticos (com link direto), produtos próximos ao vencimento (com link)
- [ ] Gráfico de barras: top 5 produtos mais vendidos no último mês
- [ ] Botão de atualização manual (pull to refresh)
- [ ] Dados atualizados automaticamente ao abrir o app

**Regras de Negócio:**

- RN08: Valor total do estoque = Σ(quantidade \* preço de custo) de todos os produtos

**Dependências:** US06, US10, US11, US13

---

### US18 | Relatório de Produtos Mais Vendidos

**Como** proprietário  
**Quero** ver quais produtos têm maior saída  
**Para** priorizar reposição e negociar melhores preços

**Prioridade:** ALTA  
**Estimativa:** M  
**Ciclo:** Ciclo 2 (13 a 23/10)
**Responsável:** Matheus

**Critérios de Aceite:**

- [ ] Ranking top 10 produtos com mais saídas (tipo "Venda") no período selecionado
- [ ] Gráfico de barras horizontal com quantidade vendida
- [ ] Exibição: nome do produto, quantidade, valor total gerado
- [ ] Filtro por período: última semana, mês, trimestre, customizado
- [ ] Toque em produto abre detalhes

**Dependências:** US11, US12

---

### US19 | Relatório de Produtos de Baixo Giro

**Como** proprietário  
**Quero** identificar produtos com pouca saída  
**Para** considerar promoções ou reduzir reposição

**Prioridade:** MÉDIA  
**Estimativa:** M  
**Ciclo:** Ciclo 2 (13 a 23/10)
**Responsável:** Matheus

**Critérios de Aceite:**

- [ ] Lista de produtos com menor saída (tipo "Venda") no período
- [ ] Exibição: nome, quantidade em estoque, última saída (data), dias parado
- [ ] Filtro por período
- [ ] Sugestão: "Considere promoção ou redução de reposição"

**Dependências:** US11, US12

---

### US20 | Exportar Relatório

**Como** proprietário  
**Quero** exportar relatórios em PDF  
**Para** compartilhar com contadores ou sócios

**Prioridade:** BAIXA  
**Estimativa:** M  
**Ciclo:** Ciclo 4 (16 a 27/11)
**Responsável:** Matheus

**Critérios de Aceite:**

- [ ] Botão "Exportar" na tela de relatórios
- [ ] Gera PDF com: cabeçalho (nome da loja, período), resumo (cards do dashboard), gráficos, histórico de movimentações
- [ ] Opções de compartilhamento: WhatsApp, e-mail, salvamento local
- [ ] PDF formatado e legível

**Dependências:** US17, US18, US19

---

## ÉPICO 7: Recursos Nativos e Integração Externa

### US21 | Scanner de Código de Barras

**Como** usuário  
**Quero** usar a câmera para ler códigos de barras  
**Para** agilizar cadastro e movimentações

**Prioridade:** ALTA  
**Estimativa:** M  
**Ciclo:** Ciclo 3 (26/10 a 06/11) — entra no Checkpoint 2
**Responsável:** Felipe

**Critérios de Aceite:**

- [ ] Botão de scanner ativa câmera
- [ ] Detecção automática de código de barras (formatos EAN-13, EAN-8, UPC-A, Code 128)
- [ ] Após leitura, buscar produto no banco local primeiro
- [ ] Se não encontrar, buscar dados via API externa (nome, categoria, foto)
- [ ] Feedback visual e sonoro na leitura bem-sucedida
- [ ] Opção de cancelar e voltar

**Dependências:** US05, US10, US11

---

### US22 | Notificações Push

**Como** proprietário  
**Quero** receber notificações no celular  
**Para** ser alertado de situações críticas mesmo sem abrir o app

**Prioridade:** MÉDIA  
**Estimativa:** M  
**Ciclo:** Ciclo 3 (26/10 a 06/11) — entra no Checkpoint 2
**Responsável:** Felipe

**Critérios de Aceite:**

- [ ] Permissão de notificações solicitada no primeiro uso
- [ ] Notificações enviadas: produto crítico, produto próximo ao vencimento
- [ ] Toggle para ativar/desativar notificações nas configurações
- [ ] Toque na notificação abre a tela correspondente

**Dependências:** US13, US14

---

### US23 | Integração com API de Produtos

**Como** usuário  
**Quero** que produtos sejam preenchidos automaticamente ao escanear  
**Para** economizar tempo no cadastro

**Prioridade:** MÉDIA  
**Estimativa:** M  
**Ciclo:** Ciclo 3 (26/10 a 06/11) — entra no Checkpoint 2
**Responsável:** Felipe

**Critérios de Aceite:**

- [ ] Após leitura de código de barras, fazer requisição à API externa (ex: Open Food Facts, Cosmos API)
- [ ] Se produto encontrado, preencher: nome, categoria, foto (URL)
- [ ] Usuário pode editar dados antes de salvar
- [ ] Se API não responder ou produto não encontrado, permitir cadastro manual
- [ ] Timeout de 5 segundos na requisição

**Dependências:** US21

---

## ÉPICO 8: Persistência e Sincronização

### US24 | Persistência Local (Offline)

**Como** usuário  
**Quero** usar o app sem conexão com a internet  
**Para** continuar registrando movimentações mesmo em áreas sem sinal

**Prioridade:** ALTA  
**Estimativa:** G  
**Ciclo:** Ciclo 1 (14 a 25/09) — entra na N1
**Responsável:** Felipe

**Critérios de Aceite:**

- [ ] Todos os dados (produtos, movimentações, fornecedores, usuários) armazenados localmente em SQLite
- [ ] Operações CRUD funcionam offline
- [ ] Flag "pendente de sincronização" em registros criados/editados offline
- [ ] Indicador visual: ícone de "offline" no cabeçalho
- [ ] Mensagem ao usuário: "Você está offline. Dados serão sincronizados quando conectar"

**Dependências:** US05, US10, US11

---

### US25 | Sincronização com Servidor Remoto

**Como** usuário  
**Quero** que meus dados sejam salvos em nuvem  
**Para** não perdê-los se trocar de celular ou perder o aparelho

**Prioridade:** ALTA  
**Estimativa:** XG  
**Ciclo:** Ciclo 3 (26/10 a 06/11) — entra no Checkpoint 2
**Responsável:** Felipe

**Critérios de Aceite:**

- [ ] Sincronização automática a cada abertura do app (se online)
- [ ] Sincronização automática a cada operação CRUD (se online)
- [ ] Sincronização manual: botão "Sincronizar agora" nas configurações
- [ ] Upload de dados locais pendentes
- [ ] Download de dados novos do servidor
- [ ] Resolução de conflitos: timestamp mais recente prevalece (ou estratégia last-write-wins)
- [ ] Indicador visual de sincronização em andamento
- [ ] Mensagem de confirmação: "Sincronização concluída"
- [ ] Tratamento de erros: tentar novamente em caso de falha

**Regras de Negócio:**

- RN09: Sincronização é automática, mas pode ser forçada manualmente

**Dependências:** US24 e a retaguarda operante (API REST, Ciclo 3)

---

## ÉPICO 9: Configurações e Usabilidade

### US26 | Configurações do Aplicativo

**Como** usuário  
**Quero** personalizar configurações do app  
**Para** ajustar alertas e preferências

**Prioridade:** BAIXA  
**Estimativa:** P  
**Ciclo:** Ciclo 4 (16 a 27/11)
**Responsável:** Vitor

**Critérios de Aceite:**

- [ ] Toggle: Notificações ativadas/desativadas
- [ ] Toggle: Sincronização automática ativada/desativada
- [ ] Seletor: Intervalo de alerta de vencimento (7, 15, 30 dias)
- [ ] Botão: Backup manual (forçar sincronização)
- [ ] Botão: Limpar cache
- [ ] Informações: versão do app, termos de uso, política de privacidade

**Dependências:** US02

---

### US27 | Modo Escuro (Dark Mode)

**Como** usuário  
**Quero** ativar modo escuro  
**Para** usar o app à noite sem desconforto visual

**Prioridade:** BAIXA  
**Estimativa:** M  
**Ciclo:** Ciclo 4 (16 a 27/11)
**Responsável:** Vitor

**Critérios de Aceite:**

- [ ] Toggle nas configurações: "Modo escuro"
- [ ] Opção automática: seguir configuração do sistema
- [ ] Todas as telas adaptadas para modo escuro
- [ ] Contraste adequado (WCAG AA)

**Dependências:** Todas as telas implementadas

---

## ÉPICO 10: Testes e Qualidade

### US28 | Testes Funcionais

**Como** desenvolvedor  
**Quero** roteiro de testes funcionais  
**Para** validar cada funcionalidade

**Prioridade:** ALTA  
**Estimativa:** M  
**Ciclo:** Semana 15 (09 a 13/11) — verificação
**Responsável:** Felipe

**Critérios de Aceite:**

- [ ] Documento com casos de teste para R1-R14
- [ ] Cada caso: pré-condições, passos, resultado esperado, resultado obtido
- [ ] Testes executados em dispositivo físico
- [ ] Defeitos identificados registrados e classificados por severidade

**Dependências:** Todas as funcionalidades implementadas

---

### US29 | Testes de Usabilidade com Usuários Reais

**Como** equipe de projeto  
**Quero** testar o app com 5+ usuários externos  
**Para** identificar problemas de usabilidade

**Prioridade:** ALTA  
**Estimativa:** M  
**Ciclo:** Semana 15 (09 a 13/11) — verificação
**Responsável:** Felipe

**Critérios de Aceite:**

- [ ] Recrutamento de 5+ usuários do perfil-alvo (pequenos comerciantes)
- [ ] Roteiro de tarefas: cadastro, adicionar produto, registrar venda, ver relatório
- [ ] Registro de observações: dificuldades, erros, tempo gasto, feedback
- [ ] Relatório consolidado com melhorias identificadas
- [ ] Implementação das melhorias críticas antes da N2

**Dependências:** US28

---

## Priorização para as Entregas

### Para o Checkpoint 1 (11/09):

- Backlog completo documentado ✅
- Prototipo navegável com as telas principais ✅

### Para a N1 (29/09 a 02/10) — escopo do Ciclo 1

A N1 vale 10,0 pontos distribuídos em seis itens, conforme a Seção 8.1 do documento norteador. O item 4 é o único que depende de código em execução.

| Item | Descrição                                                             | Pontos | Artefato                                                                                                  |
| ---- | --------------------------------------------------------------------- | ------ | --------------------------------------------------------------------------------------------------------- |
| 1    | Documento de projeto                                                  | 2,5    | [`01-documento-de-projeto.md`](01-documento-de-projeto.md)                                                |
| 2    | Modelagem de dados e definição arquitetural                           | 1,5    | [`02-modelagem-de-dados.md`](02-modelagem-de-dados.md) e [`03-arquitetura.md`](03-arquitetura.md) |
| 3    | Protótipo navegável com justificativa de usabilidade e acessibilidade | 2,0    | `prototipo/` e [`04-prototipo.md`](04-prototipo.md)                                     |
| 4    | Aplicação parcial em execução                                         | 2,0    | Repositório e demonstração                                                                                |
| 5    | Gestão do projeto                                                     | 1,0    | Este backlog e [`06-gestao-do-projeto.md`](06-gestao-do-projeto.md)                                             |
| 6    | Apresentação e defesa técnica                                         | 1,0    | Apresentação presencial                                                                                   |

**Escopo mínimo do item 4.** O enunciado exige navegação estruturada, autenticação e ao menos um módulo funcional integrado à persistência. Traduzido em histórias:

| História | Papel no item 4                                              |
| -------- | ------------------------------------------------------------ |
| US01     | Cadastro de usuário                                          |
| US02     | Autenticação — exigência explícita do enunciado              |
| US05     | Cadastro de produto — o módulo funcional                     |
| US06     | Listagem de produtos com busca                               |
| US07     | Detalhes do produto                                          |
| US10     | Registro de entrada                                          |
| US11     | Registro de saída, com a regra RN06                          |
| US24     | Persistência local — é o que integra o módulo à persistência |

A navegação estruturada é atendida pela estrutura de rotas que conecta essas telas, não por uma história isolada.

### Para o Checkpoint 2 (06/11) — Ciclos 2 e 3

A exigência é versão beta funcional com persistência local e remota e integração de pelo menos um serviço externo. Histórias: US03, US04, US08, US09, US12, US13, US15, US16, US17, US18, US19, US30 no Ciclo 2; US14, US21, US22, US23, US25 no Ciclo 3.

### Para a N2 (07 a 11/12) — aplicação completa

Todas as histórias de prioridade ALTA e MÉDIA concluídas, mais US28 e US29 na Semana 15 e o Ciclo 4 de correção e empacotamento. As três histórias de prioridade BAIXA — US20 (exportar relatório), US26 (configurações) e US27 (modo escuro) — entram conforme a capacidade restante. Nenhuma delas é condição para requisito obrigatório: exportação e modo escuro constam da Seção 5.1 como desejáveis, e as configurações podem operar com valores padrão.

---

## Mapeamento de Histórias para Requisitos Obrigatórios (R1-R14)

| Requisito                                  | Histórias                                                                        | Ciclo em que fecha |
| ------------------------------------------ | -------------------------------------------------------------------------------- | ------------------ |
| R1 — Mínimo de 6 telas com navegação       | US01, US02, US05, US06, US07, US10, US11 já cobrem o mínimo no Ciclo 1           | 1                  |
| R2 — Autenticação com 2 perfis             | US01, US02, US03, US04                                                           | 2                  |
| R3 — Manutenção de 2+ entidades            | Produto: US05, US06, US07, US08, US09 · Fornecedor: US15, US16 · Categoria: US30 | 2                  |
| R4 — Mínimo de 3 regras não triviais       | Ver detalhamento abaixo                                                          | 2                  |
| R5 — Persistência local                    | US24                                                                             | 1                  |
| R6 — Persistência remota com sincronização | US25                                                                             | 3                  |
| R7 — Serviço externo                       | US23                                                                             | 3                  |
| R8 — Recurso nativo                        | US21 (câmera), US22 (notificações)                                               | 3                  |
| R9 — Filtro, busca e visão consolidada     | US06, US12, US17, US18, US19                                                     | 2                  |
| R10 — Erros e estados de interface         | Critérios de aceite de todas as histórias                                        | 4                  |
| R11 — Usabilidade e acessibilidade         | Protótipo e memorial · US29 valida com usuários                                  | Semana 15          |
| R12 — Organização do código em camadas     | Transversal — ver memorial de arquitetura                                        | 1                  |
| R13 — Versionamento distribuído            | Transversal — ver documento de gestão                                            | Contínuo           |
| R14 — Pacote instalável                    | Ciclo 4, antes do congelamento de 27/11                                          | 4                  |

### Detalhamento de R4 — regras triviais e não triviais

O requisito exige três regras de negócio **não triviais**. A versão 1.0 listava sete regras sem distinguir a natureza delas, incluindo restrições de unicidade que não sustentariam o requisito sozinhas.

| Regra | Natureza      | Histórias        | Por quê                                                                       |
| ----- | ------------- | ---------------- | ----------------------------------------------------------------------------- |
| RN01  | Não trivial   | US04, US07, US17 | Aplicada em duas camadas; altera a composição da resposta do serviço          |
| RN06  | Não trivial   | US11             | Validação transacional, considerando registros concorrentes vindos de offline |
| RN07  | Não trivial   | US13             | Classificação em faixas, criação condicional e baixa automática do alerta     |
| RN12  | Não trivial   | US09, US16, US30 | Define a política de integridade referencial de todo o modelo                 |
| RN13  | Não trivial   | US16             | Bloqueia operação que quebraria a integridade, com orientação ao usuário      |
| RN08  | Intermediária | US17             | Agregação com restrição por perfil                                            |
| RN10  | Intermediária | US07             | Cálculo derivado com restrição por perfil                                     |
| RN02  | Trivial       | US01             | Restrição de unicidade                                                        |
| RN04  | Trivial       | US05             | Restrição de unicidade                                                        |

Cinco regras não triviais contra o mínimo de três exigido. Três delas — RN06, RN07 e RN13 — já são demonstráveis clicando no protótipo.

---

## Observações Finais

### Distribuição por integrante

Cada história tem responsável nomeado no seu detalhamento. O resumo abaixo consolida a carga. O acompanhamento por ciclo está em [`06-gestao-do-projeto.md`](06-gestao-do-projeto.md).

**Matheus Oliveira Mitter — retaguarda e dados**
Modelagem e migrações do PostgreSQL · DAO com JDBC · API REST em Spring Boot · autenticação e autorização com JWT e RN01 · consultas de agregação
Histórias: US04, US13, US14, US17, US18, US19, US20

**Vitor Leal dos Santos — aplicação móvel**
Telas, navegação e componentes · formulários e validações de entrada · estados de carregamento, vazio e erro · consumo da API
Histórias: US01, US02, US03, US05, US06, US07, US08, US09, US15, US16, US26, US27, US30

**Felipe Milhomem Rocha — integração e recursos nativos**
Persistência local em SQLite · sincronização idempotente · serviço externo · câmera e notificações · testes
Histórias: US10, US11, US12, US21, US22, US23, US24, US25, US28, US29

As frentes se sustentam mutuamente: a modelagem e a API viabilizam as telas, e a camada de persistência local viabiliza a operação offline de todas elas. O acompanhamento por ciclo está em [`06-gestao-do-projeto.md`](06-gestao-do-projeto.md).

### Versionamento

Cada integrante versiona o próprio trabalho, com commits em seu nome e mensagens descritivas da alteração realizada. O trabalho é integrado ao ramo principal por ramos de funcionalidade, com revisão por outro integrante, conforme a política registrada em [`06-gestao-do-projeto.md`](06-gestao-do-projeto.md).

### Ferramentas:

- **Backlog:** GitHub Projects — colar este conteúdo como issues
- **Comunicação:** WhatsApp ou Discord
- **Reuniões de ciclo:** semanais, com dia e horário a fixar pela equipe na primeira reunião do Ciclo 2
- **Registro de ciclo:** atualizar a ficha do Apêndice B ao término de cada ciclo, conforme a Seção 6.1

---

## Resumo do backlog

| Indicador                        | Valor                                      |
| -------------------------------- | ------------------------------------------ |
| Histórias                        | 30                                         |
| Épicos                           | 10                                         |
| Prioridade ALTA                  | 17                                         |
| Prioridade MÉDIA                 | 10                                         |
| Prioridade BAIXA                 | 3 — US20, US26 e US27                      |
| Histórias no Ciclo 1 (N1)        | 8                                          |
| Regras de negócio não triviais   | 5, contra o mínimo de 3 exigido por R4     |
| Requisitos obrigatórios cobertos | 14 de 14, com ciclo de fechamento definido |

---

## Controle de versões

| Versão | Data       | Alterações                                                                                                                                                          | Responsável      |
| ------ | ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------- |
| 1.0    | 11/09/2026 | Versão inicial com 29 histórias, entregue no Checkpoint 1                                                                                                           | Equipe StockEasy |
| 2.0    | 28/09/2026 | Ciclos alinhados ao cronograma oficial, persistência local movida para o Ciclo 1, US09 reescrita, US30 incluída, dependências entre ciclos corrigidas, R4 detalhado | Equipe StockEasy |
