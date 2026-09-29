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
