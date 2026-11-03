# Relatório de Revisão dos Artefatos

**Projeto Integrador · ADS 2026/2 · PUC Goiás**
**Equipe:** StockEasy · **Data:** 28/09/2026

Registro da revisão interna realizada sobre os artefatos produzidos até o Checkpoint 1, em preparação para a entrega da N1. Documenta o que foi encontrado, o que foi corrigido e o que permanece em aberto.

O objetivo é que as correções sejam rastreáveis: cada alteração nos documentos tem aqui o motivo que a originou.

---

## 1. Escopo da revisão

| Artefato revisado                             | Situação após a revisão                             |
| --------------------------------------------- | --------------------------------------------------- |
| `README.md`                                   | Reescrito                                           |
| `docs/00-LEIA-PRIMEIRO.md`                  | Reescrito                                           |
| `docs/05-backlog.md`                 | Revisado para a versão 2.0                          |
| `docs/02-modelagem-de-dados.md`           | Revisado para a versão 2.0 e validado em PostgreSQL |
| `docs/04-prototipo.md` | Revisado para a versão 2.0                          |
| `prototipo/` (8 telas)                        | Corrigido e ampliado para 11 telas                  |
| `prototipo/README.md`                         | Reescrito                                           |

Documentos criados na revisão, por serem exigidos pelo Apêndice A.1 e não existirem:

| Documento                    | Item da N1 que atende |
| ---------------------------- | --------------------- |
| `01-documento-de-projeto.md` | Item 1 — 2,5 pontos   |
| `03-arquitetura.md`          | Item 2 — 1,5 pontos   |
| `04-prototipo.md`   | Item 3 — 2,0 pontos   |
| `06-gestao-do-projeto.md`       | Item 5 — 1,0 ponto    |

---

## 2. Achados na modelagem de dados

Os problemas desta seção foram identificados executando o script em PostgreSQL 16, não apenas por leitura.

### 2.1 Defeitos que impediriam a execução ou produziriam resultado errado

| Achado                                                               | Consequência                                                          | Correção                                                 |
| -------------------------------------------------------------------- | --------------------------------------------------------------------- | -------------------------------------------------------- |
| Junção invertida na consulta de baixo giro: `ON p.produto_id = m.id` | Par de colunas inexistente; a consulta retornaria resultado incorreto | Condição corrigida para `ON m.produto_id = p.id`         |
| `CREATE DATABASE` com `LC_COLLATE 'pt_BR.UTF-8'`                     | Falha em qualquer ambiente sem esse idioma instalado                  | Definição de idioma removida                             |
| `OR` sem parênteses na cláusula `HAVING`                             | Precedência alterada ao combinar com outras condições                 | Condição parentetizada                                   |
| Assinatura de função incompatível com `NOW()`                        | Chamadas da função falhavam por incompatibilidade de tipo             | Colunas de data e hora passaram a registrar fuso horário |

### 2.2 Contradições internas

| Achado                                                                                                                           | Correção                                                                                    |
| -------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| A tabela de atributos declarava `movimentacao.usuario_id` como obrigatório, mas o script permitia anulá-lo na remoção do usuário | Campo obrigatório com chave estrangeira restritiva; usuários são desativados, não removidos |
| A política de remoção entre produto e movimentação estava anotada como "definir com a equipe"                                    | Decisão tomada e justificada: chave restritiva, preservando o histórico                     |
| Chave estrangeira do histórico em cascata, apesar de a regra RN05 exigir auditoria                                               | Alterada para restritiva; a cascata apagaria o histórico junto com o produto                |

### 2.3 Lacunas do modelo

| Achado                                                                                       | Correção                                                            |
| -------------------------------------------------------------------------------------------- | ------------------------------------------------------------------- |
| O backlog previa operadores vinculados a uma loja, mas não havia entidade nem coluna de loja | Entidade `loja` incluída, com vínculo nas demais                    |
| Categoria era texto com lista fixa, enquanto a interface permitia criar categorias novas     | Entidade `categoria` incluída                                       |
| Código de barras era único globalmente                                                       | Passou a ser único por loja: lojas distintas vendem o mesmo produto |
| Não havia mecanismo para evitar duplicação em reenvio após falha de rede                     | Identificador universal por registro                                |

### 2.4 Problemas na carga de exemplo e no gatilho

| Achado                                                                                               | Correção                                                                 |
| ---------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------ |
| Produtos inseridos já com o saldo final, e movimentações registradas depois "simulando" chegar a ele | Produtos entram com saldo zero; o saldo é construído pelas movimentações |
| Gatilho de alerta disparava apenas na alteração                                                      | Passou a cobrir também a inclusão                                        |
| Após a correção acima, todo cadastro de produto com saldo zero gerava alerta falso                   | Condição acrescentada: saldo zero no cadastro significa não abastecido   |
| Índices criados sobre colunas que já tinham restrição de unicidade                                   | Índices redundantes removidos                                            |

Os dois últimos itens de 2.1 e o terceiro de 2.4 foram introduzidos pelas próprias correções e detectados no teste. Ficam registrados porque mostram que a validação por execução encontrou o que a leitura não encontraria.

### 2.5 Limitação assumida

O relatório de produtos mais vendidos calcula o valor gerado usando o preço de venda atual do produto. Se o preço mudou durante o período, o valor fica distorcido.

A precisão exigiria gravar o preço praticado em cada movimentação. A equipe optou por não fazer isso na N1, para manter o modelo enxuto, e assume a limitação: o indicador serve para ordenar o ranking, não para apuração contábil. A inclusão do preço unitário na movimentação está prevista como evolução para a N2.

### 2.6 Validação executada

| Verificação                                                    | Resultado |
| -------------------------------------------------------------- | --------- |
| Script executa do início ao fim sem erro                       | Aprovado  |
| Sete tabelas criadas                                           | Aprovado  |
| Saldo de cada produto coincide com o último saldo do histórico | Aprovado  |
| Alertas gerados correspondem aos produtos em situação crítica  | Aprovado  |
| Saída superior ao estoque é rejeitada                          | Aprovado  |
| Reposição acima do mínimo baixa o alerta pendente              | Aprovado  |
| Nova queda abaixo do mínimo gera alerta novamente              | Aprovado  |
| Cadastro com saldo zero não gera alerta                        | Aprovado  |
| Remoção de produto com histórico é impedida                    | Aprovado  |
| Remoção de fornecedor com produtos vinculados é impedida       | Aprovado  |
| Remoção de fornecedor sem vínculos é permitida                 | Aprovado  |
| Saldo negativo é rejeitado                                     | Aprovado  |
| E-mail e código de barras duplicados são rejeitados            | Aprovado  |

O registro detalhado está na seção de validação de [`02-modelagem-de-dados.md`](02-modelagem-de-dados.md).

---

## 3. Achados no backlog

### 3.1 Planejamento desalinhado do cronograma

As histórias estavam organizadas em "Sprint 1 a 4", sem datas e sem correspondência com os quatro ciclos definidos na Seção 6 do documento norteador.

A consequência mais grave: a persistência local estava na terceira sprint. A Semana 8 do cronograma exige "conclusão do primeiro módulo funcional integrado à persistência local", e o item 4 da N1 repete a exigência. O planejamento colocava para outubro algo que a entrega de setembro cobra.

Correção: sprints substituídas pelos quatro ciclos com datas explícitas, e a persistência local remanejada para o Ciclo 1.

### 3.2 Dependências temporalmente impossíveis

Três histórias do Ciclo 1 dependiam de histórias do Ciclo 3.

| História                            | Dependia de                                          | Correção                                                     |
| ----------------------------------- | ---------------------------------------------------- | ------------------------------------------------------------ |
| Cadastrar produto                   | Leitura de código de barras e cadastro de fornecedor | No Ciclo 1, código digitado e fornecedor como texto opcional |
| Registrar entrada                   | Leitura de código de barras                          | No Ciclo 1, produto selecionado por busca textual            |
| Registrar saída                     | Leitura de código de barras                          | Idem                                                         |
| Alerta de estoque crítico (Ciclo 2) | Notificações (Ciclo 3)                               | No Ciclo 2, alerta no painel e na listagem, sem notificação  |

### 3.3 Contradições nos critérios de aceite

A história de detalhes do produto afirmava que "exclusão remove produto e seu histórico". A história de exclusão oferecia desativação como alternativa e, no critério seguinte, declarava que "exclusão é permanente (soft delete no backend)" — três comportamentos incompatíveis para a mesma operação, sendo o último uma contradição em si.

Correção: política única registrada como RN12. Existe apenas desativação. As duas histórias foram reescritas, e a de exclusão passou a se chamar "Desativar Produto".

### 3.4 Prioridade que colocava requisito obrigatório em risco

A história de listar e editar fornecedores estava com prioridade BAIXA. O requisito R3 exige operações **completas** de inclusão, consulta, alteração e exclusão sobre no mínimo duas entidades. Sem essa história, Fornecedor teria apenas cadastro, e o projeto ficaria com uma única entidade completa.

Correção: prioridade elevada para ALTA, com o motivo registrado na própria história.

### 3.5 Mapeamento de requisito impreciso

O mapeamento do R4 listava sete regras sem distinguir a natureza delas, incluindo unicidade de e-mail e de código de barras. O requisito exige três regras **não triviais**, e restrição de unicidade não sustenta isso.

Correção: as regras foram classificadas em não triviais, intermediárias e triviais. Cinco atendem ao critério de não trivialidade, contra o mínimo de três.

### 3.6 Outras correções

| Achado                                                               | Correção                                           |
| -------------------------------------------------------------------- | -------------------------------------------------- |
| Estimativas P, M, G e XG sem definição de esforço                    | Legenda acrescentada, com referência de cada faixa |
| Histórias sem responsável nomeado                                    | Responsável definido nas 30 histórias              |
| Categoria virou entidade, mas nenhuma história cobria sua manutenção | História de manutenção de categorias acrescentada  |

---

## 4. Achados no protótipo

### 4.1 Conformidade de acessibilidade declarada e não atendida

A especificação afirmava atender ao contraste mínimo de 4,5:1 da WCAG 2.1 nível AA. A medição mostrou que as cinco cores principais reprovavam, duas delas por mais do que o dobro da margem.

| Cor       | Contraste medido | Exigido |
| --------- | ---------------- | ------- |
| `#4CAF50` | 2,78:1           | 4,5:1   |
| `#2196F3` | 3,13:1           | 4,5:1   |
| `#F44336` | 3,58:1           | 4,5:1   |
| `#FF9800` | 2,16:1           | 4,5:1   |
| `#8BC34A` | 1,87:1           | 4,5:1   |

Além disso, `#9E9E9E` era usado como cor de texto para preços e códigos, com 2,8:1.

Correção: paleta substituída por tons mais escuros da mesma família, todos verificados. Detalhamento em [`04-prototipo.md`](04-prototipo.md).

### 4.2 Ausência de suporte a leitores de tela

| Achado                                          | Medição no estado anterior |
| ----------------------------------------------- | -------------------------- |
| Campos de formulário sem rótulo associado       | 24 de 25                   |
| Atributos de acessibilidade em todo o protótipo | 0                          |
| Indicação visual de foco de teclado             | Ausente                    |
| Alternativa textual para gráficos               | Ausente                    |

Formulário sem rótulo associado é inutilizável por leitor de tela: o usuário ouve "campo de edição" sem saber o que preencher. Ícones em emoji sem rótulo produzem leitura absurda — o ícone ao lado de "produtos cadastrados" seria anunciado como "caixa de papelão".

Correção: rótulos associados nos 35 campos, atributos de acessibilidade aplicados, foco de teclado visível, legendas descritivas nos gráficos e agrupamento semântico de campos relacionados.

### 4.3 Afirmações incorretas na documentação do protótipo

| Afirmação                                                   | Realidade                                                |
| ----------------------------------------------------------- | -------------------------------------------------------- |
| O requisito R3 estava coberto por "Produtos e Fornecedores" | Não existia nenhuma tela de fornecedor                   |
| Configurações constava como tela completa                   | O arquivo não existia; o item de menu apontava para nada |
| Recuperação de senha constava na especificação              | A tela não existia; o link apontava para nada            |
| Contagem de telas                                           | Aparecia como 8 num documento e 9 em outro               |

Havia sete links apontando para destino inexistente.

Correção: criadas as telas de recuperação de senha, configurações e fornecedores. A de fornecedores é o que efetivamente sustenta o R3. Nenhum link aponta para destino inexistente.

### 4.4 Informação transmitida apenas por cor

A situação do produto era comunicada só por bolinha colorida, e o tipo de movimentação só pela cor do texto. Quem não distingue as cores não obtém a informação.

Correção: situação e tipo passaram a trazer texto explícito além da cor.

### 4.5 Registro de data desfavorável

O arquivo de documentação do protótipo registrava data de criação posterior à data do Checkpoint 1, o que expunha, no próprio artefato avaliado, uma informação desnecessária ao seu conteúdo.

Correção: substituída por data de última atualização.

---

## 5. Achados nos documentos de escopo

### 5.1 Referências a arquivos inexistentes

O resumo do Checkpoint 1 remetia a dois arquivos que não existem no repositório. Um avaliador que seguisse as referências encontraria links quebrados.

Correção: documento reescrito, com referências apontando apenas para artefatos existentes.

### 5.2 Escolha técnica apresentada como pendência

O resumo declarava que a pilha tecnológica estava indefinida e aguardava esclarecimento externo.

O problema é de posicionamento: o item 2 da N1 avalia justamente a "justificativa da pilha tecnológica adotada", e a Seção 4 do documento norteador admite explicitamente a combinação escolhida. Apresentar uma decisão própria como dúvida em aberto enfraquece exatamente o que está sendo avaliado.

Correção: reescrito como decisão fundamentada, com as alternativas avaliadas, os motivos do descarte e o custo assumido. O conteúdo está em [`03-arquitetura.md`](03-arquitetura.md).

### 5.3 Ferramenta de prototipação divergente do entregue

A especificação previa Figma e o checklist de validação pedia configurar permissão de compartilhamento e testar o link em navegador anônimo. O protótipo entregue é HTML e CSS publicado em GitHub Pages.

Correção: especificação atualizada, com a decisão justificada no memorial do protótipo, e checklist substituído por verificação aplicável ao que existe.

### 5.4 Datas inconsistentes

A entrega da N1 aparecia como "28-29/09" nos documentos internos, enquanto os normativos indicam a janela de 29/09 a 02/10.

Correção: data padronizada em todos os documentos.

### 5.5 README sem conteúdo mínimo

O README do repositório tinha três linhas. O requisito R13 exige arquivo documentando instalação e execução.

Correção: reescrito com identificação da equipe, domínio, pilha, estrutura do repositório, instruções de execução, situação dos requisitos obrigatórios, cronograma e declaração de uso de ferramentas de inteligência artificial, conforme a Seção 9.1.

---

## 6. Artefatos ausentes que foram produzidos

O Apêndice A.1 define o conteúdo do documento de projeto exigido na N1. A revisão constatou que o material existente cobria escopo e funcionalidades, mas não continha personas, requisitos funcionais e não funcionais identificados e priorizados, nem memorial arquitetural.

| Lacuna                                            | Onde foi suprida                                |
| ------------------------------------------------- | ----------------------------------------------- |
| Personas                                          | Três personas no documento de projeto           |
| Requisitos funcionais identificados e priorizados | 43 requisitos, priorizados por MoSCoW           |
| Requisitos não funcionais                         | 15 requisitos, em cinco categorias              |
| Regras de negócio com comportamento esperado      | 13 regras, com ponto de verificação de cada uma |
| Definição arquitetural e justificativa da pilha   | Memorial de arquitetura                         |
| Justificativa de usabilidade e acessibilidade     | Memorial do protótipo                           |
| Cronograma interno com distribuição por ciclo     | Documento de gestão do projeto                  |
| Referências                                       | Seção de referências no documento de projeto    |
| Roteiro de apresentação                           | Documento de roteiro, conforme o Apêndice D     |

---

## 7. Situação após a revisão

| Item da N1 | Descrição                                  | Pontos | Situação                                       |
| ---------- | ------------------------------------------ | ------ | ---------------------------------------------- |
| 1          | Documento de projeto                       | 2,5    | Concluído                                      |
| 2          | Modelagem e definição arquitetural         | 1,5    | Concluído, com modelagem validada por execução |
| 3          | Protótipo com justificativa de usabilidade | 2,0    | Concluído                                      |
| 4          | Aplicação parcial em execução              | 2,0    | Em implementação                               |
| 5          | Gestão do projeto                          | 1,0    | Concluído                                      |
| 6          | Apresentação e defesa técnica              | 1,0    | Roteiro concluído; apresentação a ensaiar      |

---

## 8. Pendências

| Pendência                                               | Observação                                                                                                                       |
| ------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| Aplicação parcial                                       | Escopo definido no planejamento do Ciclo 1: navegação, autenticação e módulo de produtos e movimentação sobre persistência local |
| Transcrição do backlog para issues no quadro de tarefas | As 30 histórias estão documentadas; falta refletir no GitHub Projects                                                            |
| Ensaio da apresentação                                  | Especialmente o roteiro de demonstração, com o bloqueio de saída                                                                 |
| Exportação dos documentos em PDF                        | Conforme o padrão de nomeação da Seção 9 do documento norteador                                                                  |
| Verificação de concorrência com transações simultâneas  | Prevista para o Ciclo 3, quando a retaguarda entrar em operação                                                                  |
| Validação de acessibilidade com usuários reais          | Prevista para a Semana 15; o que existe hoje é conformidade estrutural verificada                                                |

---

## 9. Observação sobre o método

A maior parte dos defeitos da modelagem não seria encontrada por revisão de texto. A junção invertida, a incompatibilidade de tipo na função, o alerta falso gerado no cadastro e a definição de idioma que impede a execução apareceram ao instalar o esquema num servidor real e exercitar as regras.

Pelo mesmo motivo, a conformidade de acessibilidade do protótipo foi medida, e não presumida: a declaração anterior de atendimento à WCAG era incorreta, e só a medição do contraste evidenciou isso.

Essa prática fica adotada para os próximos ciclos: artefato que pode ser executado é verificado por execução antes de ser considerado pronto.

---

## 10. Revisão de 12/10/2026

Revisão do código, do banco e da documentação antes do Checkpoint 2. Cada item abaixo corrige uma divergência entre o que os documentos afirmam e o que estava implementado.

| Achado | Correção |
| --- | --- |
| Sete telas acessavam os repositórios direto, contra a regra "a tela chama o serviço" (`03-arquitetura.md`, seções 1.2 e 4) | Serviços de produto, cadastro, relatório e sincronização; nenhuma tela importa repositório ou banco |
| A RN01 só escondia o custo na tela; o dado chegava à interface do operador (RN01 e RNF13 dizem que a camada de negócio filtra) | O serviço entrega ao operador o produto sem custo e o resumo sem valor do estoque |
| "Excluir fornecedor" removia o registro, contra a RN12 | O fornecedor sem vínculo passa a ser desativado |
| Preço vazio era gravado como zero; os preços não eram obrigatórios (US05) | Validação no serviço: preço de venda obrigatório e maior que zero; custo obrigatório para o proprietário |
| Produto e entrada inicial eram gravados em transações separadas | Os dois na mesma transação |
| Coluna `estoque_min` no PostgreSQL e `estoque_minimo` no SQLite | Nome único, `estoque_minimo`, nos dois bancos e na documentação; scripts validados de novo em PostgreSQL 16 |
| Datas fixas na carga de exemplo: o produto "vencendo" já estava vencido e as consultas de período ficavam vazias | Datas relativas ao dia da carga, no aplicativo e no script PostgreSQL |
| Tabelas de atributos do `02-modelagem-de-dados.md` em versão anterior ao esquema (sem `loja`, `categoria`, `uuid`) | Tabelas refeitas a partir do script executável |
| Personas citavam requisitos com número errado; o backlog citava RN04, RN08 e RN09 de forma diferente do documento de projeto | Referências corrigidas |
| `tsconfig.json` herdava `moduleResolution: node`, recusado pelo TypeScript 6 usado pelo editor | `moduleResolution: bundler`, como o Metro resolve; projeto compila no TypeScript 5.3 e no 6.0 |
| `@expo/vector-icons` sem a dependência `expo-font` declarada (apontado pelo `expo-doctor`) | Dependência declarada na versão do SDK 51 |
| Login do protótipo com e-mail e senha de teste pré-preenchidos, enviados na barra de endereço | Campos vazios, como no aplicativo |

Verificação: tipos sem erro, 70 testes das regras passando, fluxos principais testados em emulador Android e scripts SQL executados com as regras conferidas.

## 11. Revisão de 14/10/2026

Revisão das decisões técnicas antes do Ciclo 3. Os pontos abaixo causariam erro na implementação da sincronização ou deixariam os documentos afirmando o que não está certo.

| Achado | Correção |
| --- | --- |
| `03-arquitetura.md` dizia que o controle transacional é "exigido pelos eixos do Apêndice D" do norteador. O Apêndice D só lista o que pode ser perguntado na arguição | A justificativa passou a citar a fonte certa: a disciplina ADS1253, que trata JDBC, DAO e transações |
| A consolidação recusaria o lote inteiro quando uma saída passasse do estoque. A venda offline já aconteceu e não pode ser editada (RN05): o aparelho reenviaria o mesmo lote para sempre | O servidor registra as movimentações, recalcula o saldo e gera alerta de divergência para ajuste (RN06 e RN09 no `01`; seções 3, 5.1, 6 e 7 e DA09 no `03`) |
| "Prevalece a alteração mais recente" não dizia de qual relógio. Relógio de aparelho erra | Vale a hora em que o servidor recebe a alteração, e o servidor recalcula o saldo (RN09; DA10; `02` e `05` alinhados) |
| Sem regra para a senha e o token no aparelho; a senha local ainda é texto puro | Senha só como resumo com sal, token no armazenamento seguro e sessão local sem rede, a implementar no Ciclo 3 (seção 9 e DA11 do `03`) |
| Ambientes previam Expo Go e PostgreSQL em contêiner; versões da retaguarda não definidas | Build de desenvolvimento, PostgreSQL direto na máquina, Java 21, Spring Boot 4.1 e migrações com Flyway (seções 8.2, 8.3 e 11 e DA12 do `03`) |
| Cabeçalhos de versão do `01` e do `05` não acompanhavam as tabelas de controle de versões | Alinhados |
| Os testes cobriam só as regras; serviços e repositórios eram verificados apenas no emulador | 23 testes de serviço e repositório num banco em memória, com o esquema e a carga inicial do aplicativo; contagem atualizada nos READMEs e no `03` |
| `README.md` e `app/README.md` citavam o Expo SDK 51, Node 18, o Expo Go da loja e a assinatura editada à mão na pasta `android/` | Atualizados para o SDK 57: Node 22.18, build de desenvolvimento (`npm run android`), `ANDROID_HOME` e `JAVA_HOME` para gerar o APK pela linha de comando, e assinatura reaplicada pelo plugin `plugins/assinatura-release.js` |
| `03-arquitetura.md` dizia que o pacote Android sai do EAS Build | Sai do Gradle local, assinado pelo plugin do projeto; o EAS fica como alternativa (seções 8.1 e 12) |

Verificação: tipos sem erro no TypeScript 6.0.3, 95 testes passando, `expo-doctor` sem pendências, APK de release assinado e alinhado a páginas de 16 KB, e fluxos principais conferidos em emulador Android 17.

## 12. Correções de 14/10/2026, segunda rodada

Correção de tudo o que estava pendente ou apareceu depois da revisão anterior, antes de seguir para o Checkpoint 2.

| Achado | Correção |
| --- | --- |
| O `npm audit` acusava 23 alertas. Eram 3 falhas, todas em ferramentas de desenvolvimento; nenhuma entra no APK, o que foi conferido pelo mapa de fontes do pacote | O `uuid` 11.1.1 passou a ser forçado só para o `xcode`, pelo campo `overrides` do `app/package.json`. Restam 15 alertas do `braces` e do `node-forge`, que ainda não têm versão corrigida publicada pelos autores. O `app/README.md` explica isso e alerta contra o `npm audit fix --force`, que voltaria o Expo para a versão 44 |
| `typescript` e `@types/react` estavam declarados duas vezes, com versões diferentes, em `dependencies` e `devDependencies` | Ficaram só em `devDependencies`, como no modelo do Expo |
| Os botões das janelas de confirmação e o cursor de texto usavam o verde-azulado padrão do tema Android, fora da identidade visual | A cor primária foi para o `app.json` (`primaryColor`), e a cor de destaque é gravada pelo plugin `plugins/cor-de-destaque.js` |
| `userInterfaceStyle: "light"` não tinha efeito no Android. Com o aparelho no modo escuro, as janelas do sistema ficariam escuras sobre o app claro | `expo-system-ui` instalado, na versão esperada pelo SDK 57 |
| O Voltar do Android, com o formulário de fornecedor aberto, saía da tela | Agora fecha o formulário, como faria se ele fosse uma tela própria |
| Os dois bancos aplicavam a RN04 também aos produtos desativados. Como o app não reativa produto, o código de barras ficava preso a um produto que não aparece em lugar nenhum | Índice único parcial, só de produtos ativos, nos dois bancos. O banco do aparelho ganhou versão de esquema e migração (`app/src/database/migracoes.ts`), que refaz a tabela de produto preservando os dados e o contador de id |
| A `categoria` não tinha `atualizado_em`, e loja, usuário e fornecedor não tinham o gatilho que mantém essa data. A regra de conflito da sincronização depende dela | Coluna e gatilhos no PostgreSQL; `02` na versão 2.3 |
| O RF01 previa escolher o perfil no cadastro, o que o app não faz para que ninguém contorne a RN01 | RF01 alinhado e registrado como alteração de escopo (`01` na versão 1.3) |
| O build de release pela linha de comando avisava que `NODE_ENV` não estava definido | Comando documentado com `NODE_ENV=production` |

Verificação:
- TypeScript 6.0.3 sem erros de tipo.
- 100 testes passando, 5 deles novos: a migração num banco do formato antigo e o reuso do código de um produto desativado.
- `expo-doctor` 21/21, com as dependências na versão do SDK 57.
- Scripts SQL executados em PostgreSQL 16.14, com a RN04 e os gatilhos conferidos.
- APK de release assinado e alinhado a 16 KB.
- No emulador Android 17, o app foi instalado por cima da versão anterior, e a migração preservou os dados.
- RN04, Voltar no fornecedor e janela de confirmação clara no modo escuro conferidos no emulador, sem erro nem travamento.
