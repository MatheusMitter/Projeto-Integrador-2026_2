# StockEasy — Controle de Estoque Inteligente

Aplicação móvel de controle de estoque para pequenos comércios, desenvolvida como Projeto Integrador do Curso Superior de Tecnologia em Análise e Desenvolvimento de Sistemas da PUC Goiás, semestre 2026/2.

**Disciplina:** ADS1253 — Programação Orientada a Objeto com Banco de Dados
**Equipe:** StockEasy
**Repositório:** https://github.com/MatheusMitter/Projeto-Integrador-2026_2

---

## O problema

Pequenos comerciantes — mercearias, minimercados, padarias, lojas de conveniência — controlam estoque em cadernos ou planilhas desatualizadas, quando controlam. O resultado são perdas por ruptura de produtos de alto giro, capital imobilizado em itens de baixa saída e desperdício por vencimento.

O StockEasy resolve isso com registro de movimentações no celular, alerta automático de estoque mínimo e de vencimento, e visões consolidadas que mostram para onde o dinheiro do estoque está indo.

---

## Equipe e atribuições

| Integrante              | Matrícula          | Atribuição técnica                                            |
| ----------------------- | ------------------ | ------------------------------------------------------------- |
| Matheus Oliveira Mitter | 2025.1.0120.0128-3 | Retaguarda: API REST, modelagem, JDBC/DAO, autenticação       |
| Vitor Leal dos Santos   | 2025.1.0120.0071-6 | Aplicação móvel: telas, navegação, formulários e validações   |
| Felipe Milhomem Rocha   | 2025.1.0120.0024-4 | Integração: API externa, recursos nativos, persistência local |

A distribuição de responsabilidades por ciclo está em [`docs/06-gestao-do-projeto.md`](docs/06-gestao-do-projeto.md).

---

## Pilha tecnológica

| Camada             | Tecnologia                         | Justificativa resumida                                                       |
| ------------------ | ---------------------------------- | ---------------------------------------------------------------------------- |
| Aplicação móvel    | React Native com Expo (TypeScript) | Admitida pela Seção 4 do documento norteador; ciclo de desenvolvimento curto |
| Persistência local | SQLite (`expo-sqlite`)             | Operação offline com o mesmo modelo relacional do servidor                   |
| Retaguarda         | Spring Boot (Java) com API REST    | Exercita JDBC, DAO e transações, conteúdo central da ADS1253                 |
| Banco remoto       | PostgreSQL                         | Integridade referencial, _constraints_ e _triggers_                          |
| Integração externa | Open Food Facts                    | Consulta de produto por código de barras, sem chave de acesso                |
| Recurso nativo     | Câmera e notificações locais       | Leitura de código de barras e alerta de estoque crítico                      |

A justificativa completa, com as alternativas avaliadas e descartadas, está em [`docs/03-arquitetura.md`](docs/03-arquitetura.md).

---

## Estrutura do repositório

```
.
├── app/                                    # Aplicação móvel (React Native com Expo)
│   ├── src/
│   │   ├── screens/                         # Apresentação: telas
│   │   ├── components/                      # Apresentação: componentes
│   │   ├── navigation/                      # Apresentação: abas e pilha
│   │   ├── services/                        # Negócio: regras e transações
│   │   ├── repositories/                    # Persistência: SQL sobre SQLite
│   │   ├── database/                        # Persistência: esquema e conexão
│   │   ├── domain/                          # Domínio: tipos das entidades
│   │   └── theme/                           # Design system
│   ├── tests/                               # Testes das regras de negócio
│   └── README.md
├── banco/                                  # Scripts SQL do banco remoto (PostgreSQL)
│   ├── 01-esquema.sql                       # Tabelas, índices, funções e gatilhos
│   ├── 02-carga-exemplo.sql                 # Dados de exemplo
│   ├── 03-consultas.sql                     # Consultas dos indicadores e relatórios
│   └── README.md
├── docs/                                   # Documentação do projeto
│   ├── 00-LEIA-PRIMEIRO.md                  # Índice: o que é cada documento
│   ├── 01-documento-de-projeto.md           # Problema, requisitos, personas, regras de negócio
│   ├── 02-modelagem-de-dados.md             # Diagrama do banco, scripts SQL, consultas
│   ├── 03-arquitetura.md                    # Camadas, decisões técnicas, pilha justificada
│   ├── 04-prototipo.md                      # Telas, usabilidade e acessibilidade
│   ├── 05-backlog.md                        # Histórias de usuário priorizadas
│   ├── 06-gestao-do-projeto.md              # Cronograma, ciclos, responsabilidades
│   └── 99-historico-de-revisao.md           # O que foi corrigido e por quê
└── prototipo/                              # Protótipo navegável HTML/CSS (11 telas)
    ├── index.html                           # Ponto de entrada
    ├── styles.css
    └── README.md
```

Quatro pastas, uma pergunta cada: `app/` é o que roda no celular, `banco/` é o que roda no servidor, `prototipo/` é o desenho das telas, `docs/` é a explicação de tudo.

---

## Como executar

### Protótipo navegável

Não requer instalação. Abra `prototipo/index.html` em qualquer navegador:

```bash
git clone https://github.com/MatheusMitter/Projeto-Integrador-2026_2.git
cd Projeto-Integrador-2026_2/prototipo
open index.html        # macOS
# xdg-open index.html  # Linux
# start index.html     # Windows
```

Versão publicada: [matheusmitter.github.io/Projeto-Integrador-2026_2/prototipo/](https://matheusmitter.github.io/Projeto-Integrador-2026_2/prototipo/)

### Banco de dados

Os scripts executáveis estão em [`banco/`](banco/). Com PostgreSQL 14 ou superior disponível:

```bash
psql -U postgres -f banco/01-esquema.sql
psql -U postgres -d stockeasy_db -f banco/02-carga-exemplo.sql
```

A carga resulta em 5 produtos, 11 movimentações e 2 alertas, com dois produtos em situação crítica. Os alertas não são inseridos: nascem do gatilho `trigger_estoque_critico`, e é assim que se verifica que ele funciona. O detalhamento está em [`banco/README.md`](banco/README.md).

O diagrama, a justificativa de cada decisão e a análise de normalização ficam em [`docs/02-modelagem-de-dados.md`](docs/02-modelagem-de-dados.md).

O aplicativo não depende desse banco: ele cria o próprio esquema em SQLite na primeira execução, a partir de [`app/src/database/esquema.ts`](app/src/database/esquema.ts). O PostgreSQL entra no Ciclo 3, com a retaguarda.

### Aplicação móvel

Requer Node 18 ou superior. Os testes exigem Node 22.18 ou superior, porque importam TypeScript diretamente.

```bash
cd app
npm install
npx expo start     # abra o projeto pelo terminal, não pelo Expo Go da loja
npm run android    # alternativa: emulador Android
```

A aplicação exige celular ou emulador: o módulo de banco local não tem implementação para navegador.

O projeto está no Expo SDK 51, e o Expo Go publicado nas lojas suporta apenas o SDK mais recente. Abrir o projeto pelo terminal faz o Expo CLI instalar a versão compatível no aparelho Android ou no emulador. Em iPhone físico, use um _development build_.

Credenciais de teste, criadas pela carga inicial:

| Perfil       | E-mail                     | Senha    | Acesso                                        |
| ------------ | -------------------------- | -------- | --------------------------------------------- |
| Proprietário | proprietario@stockeasy.com | admin123 | Completo                                      |
| Operador     | operador@stockeasy.com     | admin123 | Sem custo, margem nem valor do estoque (RN01) |

Verificação:

```bash
cd app
npm run verificar          # tipos e testes, em sequência
npm run verificar-tipos    # compilação TypeScript em modo estrito
npm test                   # 38 testes das regras de negócio
```

Os testes importam `app/src/services/regras.ts` diretamente, e não uma cópia das funções: uma mudança de regra sem ajuste de teste quebra a suíte.

Detalhes de organização, camadas e limitações em [`app/README.md`](app/README.md).

---

## Configuração e credenciais

Nenhuma credencial é versionada. O `.gitignore` cobre `.env`, chaves `*.pem`/`*.key`, `google-services.json`, arquivos de assinatura e artefatos de build.

As contas de acesso da carga inicial são de exemplo e valem apenas no banco local criado no aparelho. Não são exibidas na interface nem pré-preenchidas no formulário de acesso. O arquivo de modelo `.env` entra no Ciclo 3, junto com a retaguarda, que é quando passam a existir variáveis de ambiente de fato.

---

## Requisitos mínimos de complexidade técnica

Situação em 28/09/2026, conforme a Seção 5 do documento norteador. A verificação de conformidade completa será anexada à entrega da N2 (Apêndice C).

| Req | Descrição                                  | Situação     | Onde é verificável                                         |
| --- | ------------------------------------------ | ------------ | ---------------------------------------------------------- |
| R1  | Mínimo de 6 telas com navegação            | Implementado | `app/` — 8 telas em abas e pilha; protótipo com 11         |
| R2  | Autenticação com 2 perfis                  | Implementado | `app/src/services/authService.ts`, com logout no cabeçalho |
| R3  | Manutenção completa de 2+ entidades        | Implementado | Produto e Fornecedor no aplicativo                         |
| R4  | Mínimo de 3 regras de negócio não triviais | Implementado | 5 regras em `app/src/services/regras.ts`, com 38 testes    |
| R5  | Persistência local                         | Implementado | SQLite em `app/src/database/`                              |
| R6  | Persistência remota com sincronização      | Ciclo 3      | Spring Boot e PostgreSQL                                   |
| R7  | Consumo de serviço externo                 | Ciclo 3      | Open Food Facts                                            |
| R8  | Recurso nativo do dispositivo              | Ciclo 3      | Câmera e notificações                                      |
| R9  | Filtro, busca e visão consolidada          | Parcial      | Busca e painel prontos; relatórios no Ciclo 2              |
| R10 | Tratamento de erros e estados              | Implementado | Erro explicado, lista vazia com ação, carregamento         |
| R11 | Usabilidade e acessibilidade               | Implementado | Contraste AA, alvo de 44px, rótulos acessíveis             |
| R12 | Organização do código em camadas           | Implementado | Três camadas em `app/src/`                                 |
| R13 | Versionamento com histórico distribuído    | Em andamento | Histórico do repositório                                   |
| R14 | Pacote instalável em dispositivo físico    | Ciclo 4      | Até 27/11                                                  |

---

## Cronograma das entregas

| Marco                     | Data               | Situação      |
| ------------------------- | ------------------ | ------------- |
| Checkpoint 1              | 11/09/2026         | Entregue      |
| Entrega e apresentação N1 | 29/09 a 02/10/2026 | Em preparação |
| Checkpoint 2              | 06/11/2026         | Planejado     |
| Testes com usuários       | 09 a 13/11/2026    | Planejado     |
| Congelamento de escopo    | 27/11/2026         | Planejado     |
| Documentação final        | 04/12/2026         | Planejado     |
| Entrega e apresentação N2 | 07 a 11/12/2026    | Planejado     |

---

## Uso de ferramentas de inteligência artificial

Conforme a Seção 9.1 do documento norteador, a equipe declara o uso de assistentes de IA como apoio à redação da documentação e à revisão de código. As decisões técnicas, a modelagem e a implementação são de autoria da equipe, que responde integralmente pelo conteúdo entregue. A declaração detalhada, com as finalidades de uso, será consolidada no relatório técnico final.

---

## Licença e uso acadêmico

Projeto acadêmico sem fins comerciais, produzido para a disciplina ADS1253 da PUC Goiás. Os documentos normativos da disciplina não são redistribuídos neste repositório.
