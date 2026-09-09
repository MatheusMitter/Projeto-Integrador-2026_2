---
inclusion: always
---

# Projeto Integrador ADS 2026/2 — Contexto Permanente

> Este arquivo é carregado automaticamente em toda sessão. Leia antes de iniciar
> qualquer codificação, alteração ou continuidade de desenvolvimento.
> Fonte normativa: `Documento Norteador Projeto Integrador ADS 2026-2 (1).pdf`
> (PUC Goiás, Escola Politécnica e de Artes, versão 2.0).

---

## 1. Repositório

- **URL:** https://github.com/MatheusMitter/Projeto-Integrador-2026_2
- **Branch principal:** `main`
- **Visibilidade:** público (atende à Seção 9 do norteador)
- **Conta GitHub:** MatheusMitter (`gh` autenticado)

O endereço do repositório é informado na primeira entrega e **não pode mudar** até
o encerramento do semestre. Não recriar, não renomear, não tornar privado.

---

## 2. Disciplina de versionamento — obrigatória

O histórico de commits é a principal evidência de participação individual e afeta
diretamente a nota. Regras que valem para toda alteração:

- **Commit ao final de cada alteração significativa.** Nunca acumular trabalho
  sem versionar. A Seção 6.2 veda expressamente submissão concentrada de código
  em datas próximas às entregas.
- **Mensagens descritivas.** Mensagens genéricas ("update", "ajustes", "wip") são
  vedadas pelo norteador. Descrever o que mudou e por quê.
- **Histórico distribuído entre os integrantes.** Commits concentrados em uma só
  pessoa reduzem o Fator de Participação Individual dos demais (ver seção 6).
  Atenção: commits gerados nesta sessão entram sob a identidade de MatheusMitter.
  Os outros integrantes precisam de commits próprios e reais.
- **Estratégia de branches.** Mínimo exigido: `main` separada de branches de
  funcionalidade, com integração via Pull Request revisado por outro integrante.
- **README sempre atualizado** com instruções de instalação e execução (R13).

Formato de mensagem adotado:

```
<tipo>: <descrição no imperativo>

tipo ∈ docs | feat | fix | refactor | chore | test
```

Exemplo: `docs: adiciona requisitos funcionais e regras de negócio ao escopo`

---

## 3. Regras de código não negociáveis

- **Nenhuma credencial, chave ou senha versionada.** Usar variáveis de ambiente
  com arquivo `.env` no `.gitignore` e um `.env.example` versionado (Seção 6.2 e R12).
- **Separação em camadas:** apresentação, negócio e persistência distintas e com
  comunicação explícita entre elas (R12).
- **Nomenclatura consistente** e ausência de trechos comentados sem uso (R12).
- **Tratamento explícito de falhas** — o app não pode quebrar com entrada inválida
  ou falha de rede (R10).
- Não reproduzir tutoriais, repositórios públicos ou projetos de semestres
  anteriores. Isso caracteriza plágio e zera a etapa (Seção 9.1).
- Uso de IA é permitido, mas **deve ser declarado no relatório final** com
  indicação das finalidades (Seção 9.1). Manter registro do que foi gerado com
  auxílio de IA ao longo do semestre.

---

## 4. Requisitos obrigatórios (R1–R14) — a especificação do produto

Todos são obrigatórios. Descumprir qualquer um reduz a pontuação técnica.

| Nº | Requisito | Mínimo exigido |
|---|---|---|
| R1 | Telas e navegação | 6+ telas funcionais distintas, navegação estruturada e coerente |
| R2 | Autenticação e perfis | Cadastro e login, com 2+ perfis de permissões distintas |
| R3 | CRUD | Inclusão, consulta, alteração e exclusão em 2+ entidades, com validação de entrada |
| R4 | Regras de negócio | 3+ regras não triviais, documentadas e verificáveis na aplicação |
| R5 | Persistência local | Armazenamento local estruturado, com comportamento definido sem conectividade |
| R6 | Persistência remota | Serviço de retaguarda com sincronização (API própria ou BaaS) |
| R7 | Integração externa | 1+ serviço ou API externa pertinente ao domínio |
| R8 | Recurso nativo | 1+ recurso do aparelho: câmera, geolocalização, notificações, arquivos, biometria ou sensores |
| R9 | Consulta e apresentação | Listagens com filtro, ordenação ou busca **e** 1+ visão consolidada (resumo, indicador ou gráfico) |
| R10 | Erros e estados | Tratamento de falhas, mensagens ao usuário, estados de carregamento e de lista vazia |
| R11 | Usabilidade e acessibilidade | Heurísticas de usabilidade, contraste adequado, áreas de toque conforme a plataforma, rótulos para leitores de tela |
| R12 | Organização do código | Camadas, nomenclatura consistente, sem credenciais no código, sem código morto |
| R13 | Versionamento | Git com histórico distribuído, commits descritivos, README de instalação e execução |
| R14 | Distribuição | Pacote APK ou AAB gerado e execução comprovada em dispositivo físico |

**R9 é o requisito mais esquecido.** Filtro/busca e a visão consolidada precisam
existir explicitamente.

Tecnologias admitidas (Seção 4): Android nativo (Kotlin/Java), Flutter ou
React Native (Expo permitido). Retaguarda: API própria (Spring Boot, Node.js,
FastAPI) ou BaaS (Firebase, Supabase). A escolha **deve ser justificada** no
documento de projeto quanto a custo, curva de aprendizado, adequação ao domínio e
implicações arquiteturais. Vedado: web responsiva sem empacotamento móvel e
no-code/low-code sem código autoral.

---

## 5. Calendário

| Marco | Data | Entregáveis |
|---|---|---|
| **Checkpoint 1** | **11/09/2026** | Escopo, protótipo navegável, backlog priorizado |
| Entrega e apresentação N1 | 28/09 a 02/10/2026 | 6 itens pontuados (ver seção 6) |
| Checkpoint 2 | 06/11/2026 | Versão beta com persistência local + remota e API externa |
| Testes com usuários | 09 a 13/11/2026 | Testes funcionais + usabilidade com **5+ usuários externos** |
| Congelamento de escopo | 27/11/2026 | Fim do desenvolvimento de novas funcionalidades |
| Documentação final | 04/12/2026 | Relatório técnico, pacote instalável, repositório |
| Entrega e apresentação N2 | 07 a 11/12/2026 | Mostra final com banca e arguição individual |

Normas de entrega (Seção 9): submissão via AVA até 23h59 da data limite; PDFs
nomeados `PI2026-2_NomeDaEquipe_Etapa.pdf`; atraso custa 20% por dia, no máximo
3 dias, depois zera. Na N2, o APK vai acompanhado de credenciais de teste para
cada perfil de usuário.

Apresentações: 20 minutos + até 10 minutos de arguição, com todos os integrantes
apresentando. Blocos: contextualização (3 min), especificação (4 min), decisões
técnicas (5 min), demonstração (6 min), encerramento (2 min).

---

## 6. Avaliação

**N1 — 10,0 pontos:** documento de projeto 2,5 · modelagem e arquitetura 1,5 ·
protótipo navegável 2,0 · aplicação parcial em execução 2,0 · gestão do projeto
(backlog e versionamento) 1,0 · apresentação e defesa técnica 1,0.

**N2 — 10,0 pontos:** aplicação concluída (R1–R14) 3,5 · qualidade técnica 2,0 ·
verificação e testes 1,5 · relatório técnico e README 1,5 · apresentação final 1,5.

**Fator de Participação Individual (FPI):** a nota individual é a nota da equipe
**multiplicada** por um fator de 0,00 a 1,00, atribuído com base no histórico de
contribuições no repositório, na distribuição de responsabilidades, no desempenho
nos checkpoints e na arguição individual. É o maior risco individual do projeto —
por isso a seção 2 deste documento não é opcional.

A impossibilidade de explicar decisões de implementação na arguição caracteriza
ausência de autoria e reduz a pontuação dos itens correspondentes. Todo código
gerado precisa ser compreendido pelos integrantes.

---

## 7. Estado atual do projeto

Atualizar esta seção conforme as decisões forem tomadas.

| Item | Situação |
|---|---|
| Repositório | ✅ criado e público |
| Composição da equipe | ⏳ a definir (norteador pede 3 a 4 integrantes) |
| Nome da equipe | ⏳ a definir (necessário para nomear os PDFs) |
| Coordenador da equipe | ⏳ a definir |
| Responsável técnico pelo repositório | ⏳ a definir |
| Domínio do problema / tema | ⏳ a definir — **bloqueia todos os artefatos** |
| Pilha tecnológica | ⏳ a definir |
| Ferramenta de backlog | ⏳ a definir |
| Ferramenta de protótipo | ⏳ a definir |
| Escopo do projeto | ⏳ a produzir |
| Protótipo navegável | ⏳ a produzir |
| Backlog priorizado | ⏳ a produzir |
| Modelagem de dados (DER) | ⏳ a produzir |

Observação de cronograma: a equipe informou que o cronograma está sendo adaptado
pelo docente e que os itens previstos para as semanas anteriores podem ser
entregues em 11/09.

---

## 8. Conteúdo do documento de projeto (Apêndice A.1 do norteador)

Estrutura exigida na entrega da N1:

1. Capa e identificação da equipe, com atribuição técnica de cada integrante
2. Contexto e caracterização do domínio do problema
3. Descrição do problema e justificativa da solução
4. Objetivo geral e objetivos específicos da aplicação
5. Público-alvo e personas
6. Requisitos funcionais e não funcionais, identificados e priorizados
7. Regras de negócio, com identificação e comportamento esperado
8. Modelagem de dados e diagramas pertinentes
9. Definição arquitetural e justificativa da pilha tecnológica
10. Cronograma interno da equipe, com distribuição de responsabilidades por ciclo
11. Referências utilizadas

Codificar os itens como `RF01`, `RNF01`, `RN01`. O Apêndice C exige, na N2, mapear
cada requisito R1–R14 para o local onde ele é verificável na aplicação ou no
repositório — a codificação desde o início evita retrabalho.
