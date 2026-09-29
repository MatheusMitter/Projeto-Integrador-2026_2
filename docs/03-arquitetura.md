# Memorial de Arquitetura — StockEasy

**Projeto Integrador · ADS 2026/2 · PUC Goiás**
Disciplina ADS1253 — Programação Orientada a Objeto com Banco de Dados
**Equipe:** StockEasy · **Entrega:** N1 — 29/09 a 02/10/2026
**Versão:** 1.0 — 28/09/2026

Atende ao item 2 da composição da N1: modelagem de dados e definição arquitetural, com justificativa da pilha tecnológica adotada.

---

## 1. Visão geral

O StockEasy é uma aplicação móvel com retaguarda própria, organizada em três camadas lógicas replicadas nos dois lados da fronteira de rede. O aplicativo mantém uma base local completa e opera de forma autônoma; o servidor é a fonte consolidada e o ponto de convergência entre dispositivos.

```
┌─────────────────────────────────────────────────┐
│  DISPOSITIVO MÓVEL — React Native / Expo        │
│                                                 │
│  Apresentação    telas, navegação, componentes  │
│        ↓                                        │
│  Negócio         serviços, validações, regras   │
│        ↓                                        │
│  Persistência    repositórios, SQLite, fila     │
└──────────────────────┬──────────────────────────┘
                       │  HTTPS / JSON
                       │  (assíncrono, tolerante a falha)
┌──────────────────────┴──────────────────────────┐
│  RETAGUARDA — Spring Boot / Java                │
│                                                 │
│  Apresentação    controladores REST             │
│        ↓                                        │
│  Negócio         serviços, transações, regras   │
│        ↓                                        │
│  Persistência    DAO com JDBC                   │
└──────────────────────┬──────────────────────────┘
                       │
              ┌────────┴────────┐
              │   PostgreSQL    │
              └─────────────────┘

        Serviço externo: Open Food Facts
        Recursos nativos: câmera, notificações
```

A separação em camadas atende ao requisito R12 e reproduz o princípio arquitetural tratado na disciplina. A regra de negócio reside na camada de negócio, nunca na tela nem no acesso a dados.

---

## 2. Onde cada regra é aplicada

Validações como RN06, que impede saída superior ao estoque disponível, existem no aplicativo e no servidor. Não é redundância acidental, mas também não é a lógica inteira duplicada.

No aplicativo, a validação dá resposta imediata e permite operar sem rede. No servidor, ela é a única garantia real: dois aparelhos podem registrar saídas do mesmo produto enquanto estão offline e, somadas, exceder o saldo. O conflito só se manifesta na consolidação.

A divisão é esta:

| Responsabilidade                       | Aplicativo | Servidor |
| -------------------------------------- | ---------- | -------- |
| Orquestrar a operação e a interface    | Sim        | Não      |
| Validar a regra no momento da ação     | Sim        | Não      |
| Revalidar a regra ao consolidar o lote | Não        | Sim      |
| Resolver conflito entre aparelhos      | Não        | Sim      |
| Ser a fonte consolidada do dado        | Não        | Sim      |

A validação no aplicativo é conveniência de interface: responde rápido e evita registro errado. A do servidor é a que preserva a integridade quando dois aparelhos divergem. Tratá-las como equivalentes seria erro de projeto, e duplicar toda a orquestração seria desperdício.

---

## 3. Camadas da aplicação móvel

| Camada       | Responsabilidade                                                          | Não faz                                        |
| ------------ | ------------------------------------------------------------------------- | ---------------------------------------------- |
| Apresentação | Telas, navegação, estados de carregamento, vazio e erro, formatação       | Não contém regra de negócio nem acessa o banco |
| Negócio      | Validações, cálculo de situação de estoque, orquestração de sincronização | Não conhece componentes visuais nem SQL        |
| Persistência | Repositórios sobre SQLite, fila de pendências, cliente HTTP               | Não decide o que é válido                      |

Estrutura de diretórios prevista:

```
src/
├── screens/        # telas por domínio
├── components/     # componentes reutilizáveis
├── navigation/     # rotas e navegadores
├── services/       # camada de negócio
├── repositories/   # acesso ao SQLite
├── api/            # cliente HTTP e serviço externo
├── database/       # esquema e migrações locais
├── domain/         # tipos e entidades
└── utils/          # formatação e validadores
```

---

## 4. Camadas da retaguarda

| Camada       | Componente             | Responsabilidade                                                          |
| ------------ | ---------------------- | ------------------------------------------------------------------------- |
| Apresentação | `@RestController`      | Recebe requisição, valida formato, devolve código de situação adequado    |
| Negócio      | `@Service`             | Aplica regras, controla o limite transacional, autoriza conforme o perfil |
| Persistência | DAO com `JdbcTemplate` | Executa SQL parametrizado e converte resultado em objeto de domínio       |

```
com.stockeasy
├── controller/     # endpoints REST
├── service/        # regras e transações
├── dao/            # interfaces de acesso a dados
│   └── impl/       # implementações JDBC
├── domain/         # entidades
├── dto/            # objetos de transporte
├── config/         # segurança e fonte de dados
└── exception/      # tratamento centralizado de erro
```

O acesso a dados usa JDBC com DAO em vez de mapeamento objeto-relacional. A escolha é deliberada: é o mecanismo estudado na ADS1253, mantém o SQL visível e sob controle da equipe, e permite demonstrar na arguição o controle transacional explícito, exigido pelos eixos do Apêndice D do documento norteador.

Consultas são sempre parametrizadas. Concatenação de valor em SQL fica vedada, tanto por segurança quanto por reaproveitamento de plano de execução.

---

## 4.1 Escopo da retaguarda: serviço de sincronização, não API de CRUD

A retaguarda **não** expõe um conjunto de endpoints de manutenção por entidade. Ela expõe autenticação e sincronização. São quatro endpoints:

| Método | Endpoint          | Função                                                               |
| ------ | ----------------- | -------------------------------------------------------------------- |
| POST   | `/auth/registrar` | Cria loja e usuário proprietário                                     |
| POST   | `/auth/login`     | Autentica e devolve token                                            |
| POST   | `/sync/enviar`    | Recebe o lote de alterações pendentes do aparelho                    |
| GET    | `/sync/baixar`    | Devolve o que mudou no servidor desde o último instante sincronizado |

### Por que não CRUD REST

O primeiro desenho desta arquitetura previa endpoints de manutenção para cada entidade. Revisando, a escolha não combinava com o problema, por três razões.

**A aplicação nunca chama o servidor para operar.** Ela grava no SQLite e segue. Um endpoint de criação de produto não teria quem o chamasse no momento da ação, porque a ação precisa concluir sem rede. O servidor só entra depois, na consolidação.

**Duplicaria a lógica inteira.** Cada regra teria implementação no aplicativo e no servidor, com o dobro de manutenção e o dobro de chance de divergir. Com sincronização, o aplicativo aplica as regras ao operar e o servidor as revalida ao consolidar o lote — a duplicação fica restrita à validação, não à orquestração.

**Não caberia no ciclo.** O Ciclo 3 tem duas semanas para retaguarda, sincronização, serviço externo e recurso nativo. Uma API de manutenção completa sobre sete entidades consome esse tempo sozinha.

### Por que isso continua exercitando o conteúdo da disciplina

A redução de escopo não enfraquece o lado técnico. Ao contrário: concentra no ponto mais interessante.

O endpoint de sincronização recebe um lote com várias movimentações e precisa processá-lo **em uma transação**. Se a terceira movimentação do lote violar o estoque disponível, as duas anteriores precisam ser desfeitas, sob pena de o aparelho e o servidor ficarem com saldos diferentes. É processamento transacional de lote com validação de regra e rollback — exatamente transações, isolamento e concorrência.

Um CRUD REST, em comparação, teria uma escrita por requisição e quase nenhuma transação interessante para explicar na arguição.

A camada DAO com JDBC permanece: é ela que persiste o lote. O que desaparece é a camada de controladores repetitivos, que não acrescentava nada ao aprendizado.

### Efeito no cronograma

| Abordagem                  | Estimativa para o Ciclo 3 | Cabe nas duas semanas                                    |
| -------------------------- | ------------------------- | -------------------------------------------------------- |
| API de manutenção completa | 3 semanas                 | Não                                                      |
| Serviço de sincronização   | 1 semana                  | Sim, com folga para o serviço externo e o recurso nativo |

---

## 5. Transação da movimentação de estoque

É a operação mais sensível do sistema. Atualizar o saldo e gravar o histórico são duas escritas que precisam ser indivisíveis: se a primeira ocorrer e a segunda falhar, o saldo passa a divergir do histórico e a auditoria exigida por RN05 se perde.

Sequência dentro de uma única transação:

1. Bloqueia a linha do produto para leitura consistente do saldo.
2. Valida RN06 — se for saída, a quantidade não pode exceder o saldo.
3. Calcula o saldo resultante.
4. Atualiza o saldo do produto.
5. Grava a movimentação com o saldo resultante.
6. Aplica RN07 — reclassifica a situação e cria ou baixa o alerta.
7. Confirma a transação.

Qualquer falha entre os passos desfaz tudo. O bloqueio da linha no passo 1 é o que impede que duas movimentações simultâneas leiam o mesmo saldo e produzam resultado incorreto.

Este é o cenário de transações, isolamento e concorrência tratado na disciplina, e é o principal argumento técnico da escolha de retaguarda própria.

---

## 6. Sincronização entre dispositivo e servidor

A base local não é cache: é uma réplica funcional com o mesmo modelo relacional. O aplicativo lê e escreve sempre localmente, e a sincronização acontece em segundo plano.

**Escrita.** Toda operação grava no SQLite e entra numa fila de pendências. Com conexão, a fila é enviada em ordem cronológica. Sem conexão, permanece enfileirada e a interface sinaliza a situação.

**Leitura.** Ao abrir o aplicativo e ao sincronizar manualmente, o servidor é consultado pelas alterações posteriores ao último instante sincronizado.

**Conflito.** Produtos, fornecedores e categorias resolvem por alteração mais recente. Movimentações não conflitam: são imutáveis por RN05, apenas acrescentadas, e o saldo é recomposto pela sequência consolidada.

**Idempotência.** Cada registro criado no dispositivo recebe um identificador universal gerado localmente. O servidor usa esse identificador para reconhecer reenvio, o que evita duplicação quando a resposta se perde após a gravação. Sem isso, uma falha de rede no momento errado duplicaria a movimentação.

---

## 7. Justificativa da pilha tecnológica

### 7.1 Aplicação móvel — React Native com Expo

Admitida explicitamente pela Seção 4 do documento norteador.

| Critério              | Avaliação                                                                            |
| --------------------- | ------------------------------------------------------------------------------------ |
| Curva de aprendizado  | A equipe já domina JavaScript e TypeScript; não há custo de nova linguagem           |
| Velocidade de entrega | Recarga imediata e teste no aparelho pessoal sem cabo, relevante no prazo disponível |
| Recursos nativos      | `expo-camera` e `expo-notifications` cobrem R8 sem escrever código nativo            |
| Persistência local    | `expo-sqlite` mantém o mesmo modelo relacional do servidor                           |
| Distribuição          | EAS Build gera o pacote Android exigido por R14                                      |

**Alternativas descartadas**

_Android nativo com Kotlin._ Melhor desempenho e acesso direto à plataforma, mas exigiria que a equipe aprendesse Kotlin e Jetpack Compose simultaneamente ao Java da disciplina. O ganho não compensa o risco de prazo.

_Flutter._ Tecnicamente adequado e com bom ferramental, mas exigiria aprender Dart. Sem vantagem decisiva sobre React Native para este domínio.

### 7.2 Retaguarda — Spring Boot com Java

| Critério                   | Avaliação                                                                 |
| -------------------------- | ------------------------------------------------------------------------- |
| Alinhamento com a ADS1253  | Exercita diretamente POO, JDBC, DAO e transações                          |
| Controle transacional      | `@Transactional` com nível de isolamento explícito, essencial na seção 5  |
| Preparação para a arguição | Permite explicar o fluxo de dados e o tratamento de exceção linha a linha |
| Autorização por perfil     | Spring Security aplica RN01 na camada de serviço, não apenas na tela      |

**Alternativas descartadas**

_Firebase ou Supabase._ Também admitidas pelo norteador e substancialmente mais rápidas de colocar em pé. Descartadas porque a persistência ficaria delegada a um serviço gerenciado, sem código de acesso a dados próprio. Isso removeria justamente o que a disciplina avalia — JDBC, DAO, transações — e enfraqueceria a arguição individual, em que se espera explicar o fluxo de dados até o banco.

_Node.js._ Permitiria uma única linguagem no projeto. Descartada pelo mesmo motivo: não exercita o conteúdo da disciplina.

Registra-se que o documento norteador não impõe Java. A Seção 4 admite Spring Boot, Node.js, FastAPI ou plataforma gerenciada, desde que a escolha seja justificada. A opção por Java é decisão da equipe, motivada pela aderência ao conteúdo avaliado e pelo ganho na arguição — não uma obrigação normativa.

### 7.3 Banco de dados

**PostgreSQL** no servidor: restrições de verificação, gatilhos e integridade referencial permitem que parte das regras seja garantida no próprio banco, e não apenas na aplicação. Também é o banco usado nas aulas.

**SQLite** no dispositivo: embarcado, sem servidor, com o mesmo modelo relacional. Mantém a linguagem de consulta consistente entre os dois lados.

### 7.4 Serviço externo — Open Food Facts

Requisito R7 pede pelo menos um serviço externo pertinente ao domínio.

Escolhido por três razões: base colaborativa com ampla cobertura de produtos de mercearia comercializados no Brasil, consulta por código de barras sem necessidade de chave de acesso, e pertinência direta ao domínio — reduz o tempo de cadastro ao preencher nome e categoria a partir da leitura.

Tratamento de indisponibilidade: tempo limite de cinco segundos e retorno ao cadastro manual sem interromper o fluxo, conforme RF42 e RNF08. A alternativa avaliada, a API Cosmos, foi descartada por exigir chave com cota restrita.

### 7.5 Recursos nativos

| Recurso             | Uso                                       | Por que agrega                                               |
| ------------------- | ----------------------------------------- | ------------------------------------------------------------ |
| Câmera              | Leitura de código de barras               | Elimina digitação de 13 dígitos durante o atendimento        |
| Notificações locais | Alerta de estoque crítico e de vencimento | Entrega o aviso sem depender de o usuário abrir o aplicativo |

Ambos respondem a necessidades das personas, não a demonstração técnica isolada.

---

## 8. Segurança

| Aspecto        | Decisão                                                                                              |
| -------------- | ---------------------------------------------------------------------------------------------------- |
| Senha          | Armazenada apenas como resumo criptográfico com BCrypt e fator de custo 10                           |
| Sessão         | Token JWT com validade limitada, transmitido no cabeçalho de autorização                             |
| Autorização    | Verificada na camada de serviço; RN01 filtra campos financeiros antes da resposta                    |
| Transporte     | HTTPS obrigatório                                                                                    |
| Injeção de SQL | Consultas exclusivamente parametrizadas                                                              |
| Credenciais    | Lidas de variáveis de ambiente; `.env` fora do controle de versão, com `.env.example` no repositório |

Ponto de atenção que a equipe assume explicitamente: a API de retaguarda precisa exigir autenticação em todos os endpoints de dados. Um endpoint de produtos ou movimentações exposto sem verificação de token permitiria leitura e escrita por qualquer cliente. A configuração de segurança será revisada como critério de aceite do Ciclo 3, quando a retaguarda entrar em operação.

---

## 9. Tratamento de erros e estados

Requisitos R10, RF38 e RNF02.

| Situação                     | Comportamento                                                         |
| ---------------------------- | --------------------------------------------------------------------- |
| Sem conectividade            | Indicador visível no cabeçalho; operações seguem enfileiradas         |
| Falha na sincronização       | Registro permanece pendente, com nova tentativa e recuo progressivo   |
| Serviço externo indisponível | Tempo limite de cinco segundos e retorno ao cadastro manual           |
| Entrada inválida             | Mensagem junto ao campo, descrevendo a correção esperada              |
| Violação de regra de negócio | Mensagem explicando a regra, como no bloqueio de saída por RN06       |
| Lista vazia                  | Estado vazio com orientação da próxima ação, não tela em branco       |
| Carregamento                 | Estrutura de carregamento nas listagens; indicador nos botões de ação |
| Falha inesperada             | Mensagem genérica ao usuário; detalhe apenas no registro de log       |

Mensagem de autenticação inválida é sempre genérica, para não revelar se um e-mail existe na base.

---

## 10. Ambientes

| Ambiente        | Aplicativo                    | Retaguarda                     | Banco                         |
| --------------- | ----------------------------- | ------------------------------ | ----------------------------- |
| Desenvolvimento | Expo Go no aparelho da equipe | Local na porta 8080            | PostgreSQL local em contêiner |
| Homologação     | Build de desenvolvimento      | Serviço gratuito de hospedagem | PostgreSQL gerenciado         |
| Demonstração    | Pacote APK instalado          | Homologação                    | Homologação                   |

Para a N1, o aplicativo opera apenas com a base local. A retaguarda entra no Ciclo 3, conforme a Semana 13 do cronograma oficial.

---

## 11. Rastreabilidade entre requisitos e arquitetura

| Req | Onde é atendido na arquitetura                                                 |
| --- | ------------------------------------------------------------------------------ |
| R1  | Camada de apresentação com navegador de pilha e de abas                        |
| R2  | Spring Security com JWT; RN01 aplicada na camada de serviço                    |
| R3  | DAO e serviços de produto, fornecedor e categoria                              |
| R4  | Camada de negócio nos dois lados; restrições e gatilho no PostgreSQL           |
| R5  | SQLite com repositórios locais e fila de pendências                            |
| R6  | API REST sobre PostgreSQL com sincronização idempotente                        |
| R7  | Cliente do serviço externo isolado em `api/`, com tempo limite e alternativa   |
| R8  | `expo-camera` e `expo-notifications`                                           |
| R9  | Consultas de agregação no DAO, expostas por endpoints de resumo                |
| R10 | Tratador centralizado de exceção na retaguarda; estados definidos na interface |
| R11 | Sistema de design do protótipo, descrito no memorial correspondente            |
| R12 | Separação em camadas descrita nas seções 3 e 4                                 |
| R13 | Ramo principal com ramos de funcionalidade e incorporação revisada             |
| R14 | EAS Build para geração do pacote Android                                       |

---

## 12. Decisões arquiteturais registradas

Formato resumido de registro de decisão. Cada entrada indica a decisão, o motivo e o custo assumido.

**DA01 — Retaguarda própria em vez de plataforma gerenciada.**
Motivo: exercitar JDBC, DAO e transações, conteúdo avaliado na disciplina e na arguição individual.
Custo: mais trabalho de implementação e necessidade de hospedar o serviço.

**DA02 — JDBC com DAO em vez de mapeamento objeto-relacional.**
Motivo: SQL explícito e sob controle da equipe; aderência direta ao conteúdo.
Custo: mais código repetitivo de conversão de resultado.

**DA03 — Base local como réplica funcional, não cache.**
Motivo: o requisito é operar offline, não apenas acelerar leitura.
Custo: exige lógica de sincronização e resolução de conflito.

**DA04 — Movimentações imutáveis; correção por lançamento de ajuste.**
Motivo: preserva a trilha de auditoria exigida por RN05 e elimina conflito na sincronização.
Custo: o usuário não pode simplesmente editar um lançamento errado.

**DA05 — Desativação em vez de exclusão física.**
Motivo: excluir produto invalidaria o histórico associado.
Custo: as consultas precisam filtrar registros inativos consistentemente.

**DA06 — Saldo resultante gravado na movimentação.**
Motivo: permite auditar o histórico sem recalcular a sequência completa.
Custo: desnormalização deliberada, detalhada no documento de modelagem.

**DA07 — Identificador universal gerado no dispositivo.**
Motivo: garante idempotência no reenvio após falha de rede.
Custo: chave técnica adicional em cada tabela sincronizada.

**DA08 — Retaguarda como serviço de sincronização, não como API de manutenção.**
Motivo: a aplicação é offline-first e nunca chama o servidor no momento da ação. Um CRUD REST duplicaria a orquestração inteira, não caberia no Ciclo 3 e teria pouca transação relevante para defender. O endpoint de sincronização processa lote em transação única, que é o cenário de interesse da disciplina.
Custo: a sincronização exige controle de idempotência e de instante de corte, mais complexo que um endpoint de inclusão simples.
Revisão: decisão tomada na revisão de 29/09/2026, substituindo o desenho anterior de API de manutenção por entidade.

---

## 13. Diagramas e artefatos complementares

Modelagem de dados, diagrama entidade-relacionamento, scripts e consultas: [`02-modelagem-de-dados.md`](02-modelagem-de-dados.md).
Requisitos e regras de negócio: [`01-documento-de-projeto.md`](01-documento-de-projeto.md).
Decisões de interface: [`04-prototipo.md`](04-prototipo.md).

---

## Controle de versões

| Versão | Data       | Alterações                          | Responsável      |
| ------ | ---------- | ----------------------------------- | ---------------- |
| 1.0    | 28/09/2026 | Versão inicial para a entrega da N1 | Equipe StockEasy |
