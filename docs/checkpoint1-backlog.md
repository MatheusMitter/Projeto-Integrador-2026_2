# Backlog do Produto — StockEasy

**Projeto:** StockEasy — Controle de Estoque Inteligente  
**Checkpoint 1:** 11/09/2026  
**Formato:** Histórias de usuário priorizadas  
**Ferramenta:** GitHub Projects (https://github.com/MatheusMitter/Projeto-Integrador-2026_2/projects)

---

## Estrutura do Backlog

Cada item segue o formato:

```
ID | História de Usuário | Prioridade | Estimativa | Critérios de Aceite
```

**Prioridades:**
- **ALTA:** Obrigatório para a primeira versão (N1)
- **MÉDIA:** Importante, mas pode ser postergado para a N2
- **BAIXA:** Desejável, pode ficar para versões futuras

**Estimativa:**
- P (Pequena): 1-2 dias
- M (Média): 3-5 dias
- G (Grande): 6-10 dias
- XG (Extra Grande): 10+ dias

---

## ÉPICO 1: Autenticação e Gestão de Usuários

### US01 | Cadastro de Usuário
**Como** proprietário de um pequeno comércio  
**Quero** criar uma conta no aplicativo  
**Para** começar a usar o sistema de controle de estoque

**Prioridade:** ALTA  
**Estimativa:** M  
**Sprint:** 1

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
**Sprint:** 1

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
**Sprint:** 2

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
**Sprint:** 3

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
**Sprint:** 1

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

**Dependências:** US02, US15 (Fornecedores), US21 (Scanner)

---

### US06 | Listar Produtos
**Como** usuário  
**Quero** ver uma lista de todos os produtos cadastrados  
**Para** consultar rapidamente informações de estoque

**Prioridade:** ALTA  
**Estimativa:** M  
**Sprint:** 1

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
**Sprint:** 1

**Critérios de Aceite:**
- [ ] Exibe: foto, nome, código de barras, categoria, fornecedor, estoque atual, estoque mínimo, preços (custo só para proprietário, venda), margem de lucro, data de validade
- [ ] Status visual destacado (crítico/baixo/normal/excesso)
- [ ] Histórico das últimas 10 movimentações deste produto (data, tipo, quantidade, saldo, usuário)
- [ ] Botões de ação: "Registrar Entrada", "Registrar Saída", "Editar", "Excluir"
- [ ] Confirmação ao excluir: "Tem certeza? Esta ação não pode ser desfeita"
- [ ] Exclusão remove produto e seu histórico

**Dependências:** US05, US06

---

### US08 | Editar Produto
**Como** usuário  
**Quero** alterar informações de um produto cadastrado  
**Para** corrigir erros ou atualizar preços

**Prioridade:** ALTA  
**Estimativa:** M  
**Sprint:** 2

**Critérios de Aceite:**
- [ ] Formulário idêntico ao de cadastro, pré-preenchido com dados atuais
- [ ] Todas as validações do cadastro aplicam-se
- [ ] Alteração de quantidade não é permitida por aqui (deve usar movimentação)
- [ ] Salvamento atualiza no banco local e sincroniza com servidor
- [ ] Mensagem de confirmação após salvamento

**Dependências:** US05, US07

---

### US09 | Excluir Produto
**Como** proprietário  
**Quero** excluir produtos que não trabalho mais  
**Para** manter o catálogo organizado

**Prioridade:** BAIXA  
**Estimativa:** P  
**Sprint:** 3

**Critérios de Aceite:**
- [ ] Apenas perfil "Proprietário" pode excluir
- [ ] Modal de confirmação com texto "Tem certeza? Esta ação excluirá o produto e todo o histórico de movimentações associado"
- [ ] Opção alternativa: "Desativar produto" (fica oculto nas listagens, mas mantém histórico)
- [ ] Exclusão é permanente (soft delete no backend)
- [ ] Toast de confirmação: "Produto excluído com sucesso"

**Dependências:** US07

---

## ÉPICO 3: Controle de Estoque (Movimentações)

### US10 | Registrar Entrada de Mercadoria
**Como** usuário  
**Quero** registrar a entrada de produtos no estoque  
**Para** atualizar a quantidade disponível após uma compra

**Prioridade:** ALTA  
**Estimativa:** G  
**Sprint:** 2

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

**Dependências:** US05, US21 (Scanner)

---

### US11 | Registrar Saída de Mercadoria
**Como** usuário  
**Quero** registrar a saída de produtos do estoque  
**Para** atualizar a quantidade após vendas, perdas ou vencimentos

**Prioridade:** ALTA  
**Estimativa:** G  
**Sprint:** 2

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

**Dependências:** US05, US21 (Scanner)

---

### US12 | Visualizar Histórico de Movimentações
**Como** usuário  
**Quero** consultar o histórico completo de movimentações  
**Para** auditar entradas e saídas e identificar padrões

**Prioridade:** MÉDIA  
**Estimativa:** M  
**Sprint:** 3

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
**Sprint:** 2

**Critérios de Aceite:**
- [ ] Quando estoque ≤ estoque mínimo, produto entra na lista de "críticos"
- [ ] Dashboard exibe card "Produtos Críticos" com contador e botão "Ver produtos"
- [ ] Notificação push: "Atenção: [nome do produto] está em falta!" (se notificações ativadas)
- [ ] Ícone de notificações no dashboard com badge numérico
- [ ] Lista de produtos críticos acessível em um toque
- [ ] Alerta persiste até que o estoque seja reposto acima do mínimo

**Regras de Negócio:**
- RN07: Produto com estoque ≤ estoque mínimo é classificado como "crítico" e gera alerta

**Dependências:** US06, US10, US11, US22 (Notificações)

---

### US14 | Alerta de Produto Próximo ao Vencimento
**Como** proprietário  
**Quero** receber alertas de produtos próximos ao vencimento  
**Para** promovê-los ou descartar antes da validade

**Prioridade:** MÉDIA  
**Estimativa:** M  
**Sprint:** 3

**Critérios de Aceite:**
- [ ] Produtos com data de validade dentro de X dias (configurável, padrão 15) entram na lista de "próximos ao vencimento"
- [ ] Dashboard exibe card com contador e botão "Ver produtos"
- [ ] Notificação push diária (às 9h): "Você tem [N] produtos próximos ao vencimento"
- [ ] Lista de produtos com data de vencimento destacada
- [ ] Configuração em "Configurações": intervalo de alerta (7, 15, 30 dias)

**Dependências:** US05, US22 (Notificações)

---

## ÉPICO 5: Gestão de Fornecedores

### US15 | Cadastrar Fornecedor
**Como** proprietário  
**Quero** cadastrar fornecedores  
**Para** associá-los aos produtos e facilitar reposições

**Prioridade:** MÉDIA  
**Estimativa:** P  
**Sprint:** 2

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

**Prioridade:** BAIXA  
**Estimativa:** P  
**Sprint:** 3

**Critérios de Aceite:**
- [ ] Lista de fornecedores com nome e telefone
- [ ] Toque abre modal de detalhes/edição
- [ ] Edição salva e sincroniza
- [ ] Exclusão de fornecedor só permitida se não houver produtos vinculados

**Dependências:** US15

---

## ÉPICO 6: Relatórios e Visões Consolidadas

### US17 | Visão Geral do Estoque (Dashboard)
**Como** usuário  
**Quero** ver um resumo visual do estado do estoque  
**Para** tomar decisões rápidas

**Prioridade:** ALTA  
**Estimativa:** M  
**Sprint:** 2

**Critérios de Aceite:**
- [ ] Cards com: total de produtos cadastrados, valor total em estoque (proprietário), produtos críticos (com link direto), produtos próximos ao vencimento (com link)
- [ ] Gráfico de barras: top 5 produtos mais vendidos no último mês
- [ ] Botão de atualização manual (pull to refresh)
- [ ] Dados atualizados automaticamente ao abrir o app

**Regras de Negócio:**
- RN08: Valor total do estoque = Σ(quantidade * preço de custo) de todos os produtos

**Dependências:** US06, US10, US11, US13

---

### US18 | Relatório de Produtos Mais Vendidos
**Como** proprietário  
**Quero** ver quais produtos têm maior saída  
**Para** priorizar reposição e negociar melhores preços

**Prioridade:** ALTA  
**Estimativa:** M  
**Sprint:** 3

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
**Sprint:** 3

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
**Sprint:** 4

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
**Sprint:** 2

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
**Sprint:** 3

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
**Sprint:** 2

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
**Sprint:** 3

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
**Sprint:** 3

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

**Dependências:** US24, Backend (API REST)

---

## ÉPICO 9: Configurações e Usabilidade

### US26 | Configurações do Aplicativo
**Como** usuário  
**Quero** personalizar configurações do app  
**Para** ajustar alertas e preferências

**Prioridade:** BAIXA  
**Estimativa:** P  
**Sprint:** 4

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
**Sprint:** 4

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
**Sprint:** 4

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
**Sprint:** 4 (semana 09-13/11)

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

### Para a N1 (28-29/09) — Aplicação Parcial Funcionando:
**Obrigatórias (6 itens de pontuação):**
1. Documento de projeto ✅
2. Modelagem e arquitetura (DER) ✅
3. Protótipo navegável ✅
4. **Aplicação parcial em execução** → Mínimo:
   - US01, US02 (Autenticação)
   - US05, US06, US07 (Produtos: cadastro, listagem, detalhes)
   - US10 ou US11 (Movimentação básica)
   - US24 (Persistência local)
5. Gestão do projeto (backlog no GitHub Projects)
6. Apresentação e defesa técnica

### Para a N2 (07-08/12) — Aplicação Completa:
**Todas as histórias de prioridade ALTA devem estar concluídas:**
- ÉPICO 1: US01, US02
- ÉPICO 2: US05, US06, US07, US08
- ÉPICO 3: US10, US11
- ÉPICO 4: US13
- ÉPICO 6: US17, US18
- ÉPICO 7: US21
- ÉPICO 8: US24, US25
- ÉPICO 10: US28, US29

**Histórias de prioridade MÉDIA e BAIXA:** implementar conforme capacidade da equipe.

---

## Mapeamento de Histórias para Requisitos Obrigatórios (R1-R14)

| Requisito | Histórias Relacionadas |
|-----------|------------------------|
| R1 — Telas e navegação (6+) | Todas as US de interface (01-27) |
| R2 — Autenticação e perfis | US01, US02, US03, US04 |
| R3 — CRUD em 2+ entidades | US05-09 (Produtos), US15-16 (Fornecedores) |
| R4 — 3+ regras de negócio | RN01, RN03, RN05, RN06, RN07, RN08, RN09 |
| R5 — Persistência local | US24 |
| R6 — Persistência remota | US25 |
| R7 — API externa | US23 (API de produtos) |
| R8 — Recurso nativo | US21 (Scanner/câmera), US22 (Notificações) |
| R9 — Consulta/filtro + visão consolidada | US06 (filtros), US17 (dashboard), US18 (ranking) |
| R10 — Tratamento de erros e estados | Critérios de aceite de todas as US |
| R11 — Usabilidade e acessibilidade | US29 (testes), design do protótipo |
| R12 — Organização do código | Arquitetura em camadas (ver documento de projeto) |
| R13 — Versionamento | Processo já em andamento |
| R14 — Distribuição (APK/AAB) | Sprint final antes da N2 |

---

## Observações Finais

### Distribuição Sugerida por Integrante:

**Matheus Oliveira Mitter (Backend):**
- API REST em Spring Boot (todas as entidades e endpoints)
- Modelagem do banco de dados PostgreSQL
- DAO e JDBC
- Autenticação e autorização (JWT)
- Sincronização (US25)

**Vitor Leal dos Santos (Frontend Móvel):**
- Telas em React Native (US01-09, US17-20, US26-27)
- Navegação e estados de interface
- Integração com API backend
- Formulários e validações

**Felipe Milhomem Rocha (Integração e Recursos Nativos):**
- Scanner de código de barras (US21)
- Integração com API externa (US23)
- Notificações push (US22)
- Persistência local SQLite (US24)
- Testes funcionais e de usabilidade (US28, US29)

### Ferramentas:

- **Backlog:** GitHub Projects — colar este conteúdo como issues
- **Comunicação:** WhatsApp ou Discord
- **Reuniões de sprint:** Semanais, às [definir dia e hora]
- **Registro de ciclo:** Atualizar ficha de responsabilidades (Apêndice B) a cada checkpoint
