# Memorial do Protótipo — Usabilidade e Acessibilidade

**Projeto Integrador · ADS 2026/2 · PUC Goiás**
**Equipe:** StockEasy · **Entrega:** N1 — 29/09 a 02/10/2026
**Versão:** 1.0 — 28/09/2026

Atende ao item 3 da composição da N1: protótipo navegável das interfaces, com justificativa das decisões de usabilidade e acessibilidade.

**Protótipo:** [`../prototipo/`](../prototipo/) · https://matheusmitter.github.io/Projeto-Integrador-2026_2/prototipo/

---

## 1. Por que HTML e CSS em vez de ferramenta de prototipação

A especificação inicial previa Figma. O protótipo foi construído em HTML e CSS. As razões:

**Navegação real, sem intermediários.** O avaliador abre um endereço no navegador e usa o protótipo. Não há conta, permissão de compartilhamento nem link que expira — três pontos de falha comuns em protótipos hospedados em ferramenta de terceiros.

**Regras de negócio verificáveis, não apenas descritas.** Esta é a razão principal. Uma ferramenta de prototipação liga tela a tela, mas não calcula. Com poucas linhas de JavaScript, o protótipo bloqueia uma saída maior que o estoque disponível e avisa quando o saldo vai cair abaixo do mínimo. O avaliador não precisa acreditar que a regra existe: ele tenta, e a regra responde.

**Reaproveitamento na implementação.** O sistema de design está em `styles.css` como variáveis. Os mesmos valores de cor, espaçamento e área de toque vão para os componentes em React Native. O trabalho de prototipação não é descartado.

**Custo de mudança menor.** Ajustar a paleta inteira para atender ao contraste exigido foi uma alteração em um bloco de variáveis, propagada a todas as telas.

O que se perde: transições animadas entre telas e recursos de colaboração visual. Nenhum dos dois é exigido pelo item 3, e nenhum afeta a validação da navegação ou dos fluxos.

### 1.1 Avaliação em dispositivo móvel

O protótipo é de um aplicativo móvel, e por isso precisa ser avaliado em tela de celular, não em monitor. A implementação em HTML atende a isso diretamente: o endereço publicado abre no navegador do aparelho, e a interface ocupa a tela real, com os toques reais.

Para aproximar ainda mais da experiência de aplicativo, o protótipo declara um manifesto de aplicação web. Adicionado à tela inicial do aparelho, ele abre em tela cheia, sem barra de endereço, com ícone e nome próprios.

| Configuração     | Valor                                 | Efeito                                   |
| ---------------- | ------------------------------------- | ---------------------------------------- |
| Modo de exibição | Autônomo                              | Abre sem a interface do navegador        |
| Orientação       | Retrato                               | Trava na orientação de uso do aplicativo |
| Cor de tema      | `#2E7D32`                             | Barra de status assume a cor primária    |
| Ícones           | 192px e 512px, mais versão recortável | Aparece entre os aplicativos do aparelho |

Isso resolve uma limitação real das ferramentas de prototipação: nelas, a visualização no aparelho exige um aplicativo intermediário e a tela aparece dentro de uma moldura, com a interface da ferramenta em volta. Aqui o protótipo é a tela.

No computador o conteúdo permanece centralizado numa largura de 428px, que corresponde à de um aparelho grande, preservando a proporção correta para inspeção.

**Distinção importante quanto aos requisitos.** A exigência de comprovação de execução em dispositivo físico é do requisito R14 e recai sobre o pacote instalável da aplicação, verificado na entrega da N2. O item 3 da N1 avalia o protótipo das interfaces, para o qual não há exigência de execução em aparelho. A equipe optou por atender aos dois de todo modo: o protótipo é usável no aparelho desde já, e a aplicação será empacotada e testada em dispositivo físico no Ciclo 4.

---

## 2. Decisões de usabilidade

### 2.1 A operação mais frequente é o caminho mais curto

Quem usa o aplicativo registra saídas várias vezes ao dia, frequentemente durante o atendimento. Por isso a movimentação está na navegação inferior, acessível de qualquer tela em um toque, e o painel tem um botão de ação flutuante que leva direto a registrar venda.

O requisito não funcional RNF01 fixa isso: entrada e saída alcançáveis em no máximo dois toques a partir do painel.

### 2.2 Navegação inferior fixa, com cinco destinos

Painel, Produtos, Movimentação, Relatórios e Configurações. Cinco é o limite antes de os rótulos ficarem ilegíveis em telas de 375 pixels. O item ativo é destacado por cor e peso de fonte, e marcado com `aria-current="page"` para quem usa leitor de tela.

### 2.3 Previsão antes da confirmação

Na movimentação, o painel de previsão mostra o saldo atual e o saldo que resultará da operação, atualizando conforme a quantidade é digitada. O usuário vê a consequência antes de confirmar.

Isso atende à heurística de visibilidade do estado do sistema e resolve um problema concreto: sem a previsão, o comerciante só descobre que errou a quantidade depois de gravar — e movimentações são imutáveis por decisão de projeto, então o conserto exige um lançamento de ajuste.

### 2.4 Erro explicado, não apenas recusado

Quando a saída excede o estoque, a mensagem informa a quantidade pedida, o saldo disponível e a regra aplicada. Uma recusa genérica deixaria o usuário sem saber o que fazer.

O mesmo vale para a exclusão de fornecedor: a mensagem diz quantos produtos estão vinculados e orienta a reatribuição.

### 2.5 Confirmação descreve a consequência real

O diálogo de desativação de produto não pergunta "tem certeza". Ele explica: o produto sai das listagens e o histórico é preservado. O usuário decide sabendo o que vai acontecer.

A versão anterior do protótipo dizia "esta ação excluirá o produto e todo o histórico", o que contradizia a política de dados do projeto. Corrigido.

### 2.6 Status de estoque em quatro faixas

Crítico, baixo, normal e excesso, calculados contra o estoque mínimo que o próprio usuário definiu. Um número isolado como "8 unidades" não informa nada; oito unidades pode ser excesso para um item de baixo giro e falta para um de alto giro. A faixa é relativa ao mínimo, e é isso que a torna útil.

### 2.7 Estados de lista vazia com próxima ação

Nenhuma tela mostra área em branco. A lista sem produtos traz mensagem e botão para cadastrar o primeiro. A busca sem resultado diz que nada foi encontrado.

### 2.8 Rótulos em linguagem do domínio

A interface usa "entrada", "saída", "estoque mínimo", "fornecedor" — vocabulário de quem trabalha em comércio. Não aparecem termos técnicos como "registro", "transação" ou "sincronização de entidades". Onde um conceito técnico é inevitável, como a operação offline, o texto explica em termos práticos: os dados serão enviados quando houver conexão.

---

## 3. Heurísticas de usabilidade aplicadas

Avaliação contra as dez heurísticas de [Nielsen](https://www.nngroup.com/articles/ten-usability-heuristics/).

| Heurística                               | Como o protótipo atende                                                                                                 |
| ---------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| Visibilidade do estado do sistema        | Previsão de saldo na movimentação; indicador de conectividade; item ativo destacado na navegação                        |
| Correspondência com o mundo real         | Vocabulário de comércio; entrada em verde e saída em vermelho, com texto além da cor                                    |
| Controle e liberdade do usuário          | Botão de voltar em todas as telas internas; ação de cancelar em todos os formulários                                    |
| Consistência e padrões                   | Mesma estrutura de cabeçalho, conteúdo e navegação em todas as telas; componentes reutilizados                          |
| Prevenção de erro                        | Campos numéricos com mínimo definido; incrementadores que não descem abaixo de 1; previsão de saldo antes de confirmar  |
| Reconhecer em vez de lembrar             | Seletores com as opções cadastradas em vez de digitação livre; produto selecionado permanece visível durante o registro |
| Flexibilidade e eficiência               | Botão de ação flutuante para atalhos; filtros por chip; leitura de código de barras substituindo digitação              |
| Estética e design minimalista            | Uma informação principal por cartão; tipografia em quatro tamanhos; paleta restrita                                     |
| Ajudar a reconhecer e recuperar de erros | Mensagens que informam o valor pedido, o disponível e a regra aplicada                                                  |
| Ajuda e documentação                     | Textos de apoio sob os campos, explicando o efeito do estoque mínimo e do alerta de vencimento                          |

A heurística de prevenção de erro é a mais explorada, por uma razão de domínio: registro de estoque errado não é apenas incômodo, ele corrompe o dado que sustenta todos os alertas e relatórios. Por isso a previsão de saldo, a validação antes da gravação e a imutabilidade do histórico.

---

## 4. Acessibilidade

### 4.1 Contraste — o que estava errado e o que foi feito

A especificação inicial afirmava atender ao contraste mínimo de 4,5:1 da WCAG 2.1 nível AA. A paleta implementada não atendia. As medições:

| Token     | Cor original | Contraste com branco | Situação  | Cor adotada | Novo contraste |
| --------- | ------------ | -------------------- | --------- | ----------- | -------------- |
| primary   | `#4CAF50`    | 2,78:1               | Reprovado | `#2E7D32`   | 5,13:1         |
| secondary | `#2196F3`    | 3,13:1               | Reprovado | `#1565C0`   | 5,40:1         |
| danger    | `#F44336`    | 3,58:1               | Reprovado | `#C62828`   | 5,90:1         |
| warning   | `#FF9800`    | 2,16:1               | Reprovado | `#E65100`   | 4,80:1         |
| success   | `#8BC34A`    | 1,87:1               | Reprovado | `#2E7D32`   | 5,13:1         |

Cinco de cinco cores principais reprovavam. O laranja e o verde claro reprovavam por margem larga — acima de duas vezes o valor exigido.

O problema não era a escolha das cores em si, e sim o uso: todas apareciam como fundo de botão com texto branco ou como texto colorido sobre fundo branco. Nessa combinação, tons médios do Material Design não alcançam 4,5:1. A correção foi descer na mesma família de cor até um tom que alcança o mínimo, preservando a identidade visual.

Na escala de cinzas, `#9E9E9E` estava sendo usado como cor de texto para preços e códigos, com 2,8:1. Substituído por `#757575`, que dá 4,60:1. Os tons mais claros ficaram restritos a bordas e divisores, onde não há texto.

Para fundos suaves foram criadas variações claras — `#E8F5E9`, `#E3F2FD`, `#FFEBEE`, `#FFF3E0` — sempre combinadas com texto no tom escuro correspondente da mesma família.

### 4.2 Não depender apenas de cor

A WCAG exige que a informação não seja transmitida somente por cor, o que atinge diretamente um aplicativo de estoque, onde o estado do produto é naturalmente representado por semáforo.

| Onde                    | Antes             | Agora                                                        |
| ----------------------- | ----------------- | ------------------------------------------------------------ |
| Situação do produto     | Bolinha colorida  | Bolinha com rótulo acessível descrevendo a situação          |
| Chip de status          | Cor de fundo      | Cor com texto explícito: "Estoque normal", "Estoque crítico" |
| Tipo de movimentação    | Verde ou vermelho | Etiqueta com texto: "ENTRADA · COMPRA", "SAÍDA · VENDA"      |
| Aba ativa entrada/saída | Cor de fundo      | Cor, borda, peso de fonte e atributo `aria-pressed`          |

### 4.3 Rótulos e leitores de tela

Os 35 campos de formulário do protótipo têm `id` e `<label for>` correspondente, ou rótulo acessível quando o rótulo visual seria redundante. Antes da revisão, praticamente nenhum campo tinha associação, o que torna o formulário inutilizável por leitor de tela: o usuário ouve "campo de edição" sem saber o que preencher.

Os ícones receberam tratamento em duas categorias. Emojis decorativos são ocultos ao leitor de tela, para não produzir leitura absurda — o ícone de caixa ao lado de "produtos cadastrados" seria anunciado como "caixa de papelão". Ícones que carregam significado sozinhos, como o sino de notificações e a lixeira, viraram botões com rótulo descritivo.

Campos relacionados foram agrupados em `fieldset` com `legend`, o que faz o leitor de tela anunciar o contexto ao entrar no grupo.

### 4.4 Áreas de toque

O token `--touch-target: 44px` é aplicado a botões, links de ação, itens da navegação inferior, chips de filtro, botões de ícone e ao botão de ação flutuante. O valor segue as diretrizes de plataforma para alvo mínimo de toque.

A razão de domínio: o operador registra saída durante o atendimento, frequentemente com uma mão ocupada. Alvo pequeno gera toque errado, e toque errado em movimentação de estoque gera dado incorreto.

### 4.5 Navegação por teclado

Antes da revisão não havia nenhuma indicação visual de foco. Foi adicionada regra de `:focus-visible` com contorno de 3 pixels e deslocamento, aplicada a links, botões, campos e seletores. Sem isso, quem navega por teclado não sabe onde está.

### 4.6 Alternativa textual para gráficos

Os gráficos são construídos com elementos de layout, sem texto que um leitor de tela possa extrair. Cada um foi envolvido em `figure` com `figcaption` que descreve os dados em números: os produtos e as quantidades vendidas, ou a tendência do período com o valor final.

A legenda é visível a todos, não apenas a leitores de tela. Ela também ajuda quem enxerga o gráfico mas quer o valor exato.

### 4.7 Regiões dinâmicas

O painel de previsão de saldo e a confirmação de envio de link de recuperação mudam de conteúdo sem recarregar a página. Ambos foram marcados como região de status com anúncio educado, para que a mudança seja comunicada sem interromper o que o usuário está fazendo.

### 4.8 Movimento reduzido

O protótipo usa transições e transformações em botões e cartões. Foi adicionada regra que desativa animações quando o sistema operacional sinaliza preferência por movimento reduzido, atendendo usuários sensíveis a movimento.

---

## 5. Verificação executada

Inspeção automatizada dos arquivos em 28/09/2026. Os valores da coluna "antes" foram medidos no estado anterior do protótipo, recuperado do histórico do repositório, e não estimados.

| Verificação                                      | Antes da revisão | Depois     |
| ------------------------------------------------ | ---------------- | ---------- |
| Telas navegáveis                                 | 8                | 11         |
| Links apontando para destino inexistente         | 7                | 0          |
| Destinos de navegação sem arquivo correspondente | 3                | 0          |
| Campos de formulário                             | 25               | 35         |
| Campos sem rótulo associado                      | 24 de 25         | 0 de 35    |
| Atributos de acessibilidade                      | 0                | 179        |
| Cores reprovadas no contraste, fixas no código   | 34 ocorrências   | 0          |
| Indicação visual de foco de teclado              | Ausente          | Presente   |
| Alternativa textual para gráficos                | Ausente          | 3 gráficos |
| Regras de negócio verificáveis por interação     | 0                | 3          |

### Limites desta verificação

A inspeção é automatizada e cobre estrutura, associação de rótulos e contraste calculado. Conformidade plena com a WCAG exige teste manual com leitores de tela reais e revisão por especialista em acessibilidade — nenhum dos dois foi feito.

As sessões de teste de usabilidade com usuários do perfil-alvo estão previstas para a Semana 15, de 09 a 13/11, e é lá que a validação com pessoas acontece. O que existe hoje é conformidade estrutural verificada, não validada com usuários.

---

## 6. Regras de negócio demonstráveis no protótipo

O protótipo não se limita a exibir telas. Três regras respondem à interação:

| Regra | Como verificar                                                                                                                                   |
| ----- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| RN06  | Em `movimentacao.html`, selecionar Saída e informar quantidade acima de 50 — o registro é bloqueado com a quantidade pedida e o saldo disponível |
| RN07  | Em `movimentacao.html`, informar saída que deixe o saldo em 10 ou menos — aparece aviso de que o produto ficará crítico                          |
| RN13  | Em `fornecedores.html`, tentar excluir a Distribuidora ABC Ltda, que tem 12 produtos vinculados                                                  |

Isso sustenta o item 3 e antecipa o R4, ao tornar as regras verificáveis antes da implementação.

---

## 7. O que muda na implementação em React Native

O protótipo é referência de interface, não código de produção. Na implementação:

| Aspecto           | No protótipo           | Na aplicação                                           |
| ----------------- | ---------------------- | ------------------------------------------------------ |
| Dados             | Estáticos no HTML      | Consultados do SQLite local                            |
| Regras de negócio | JavaScript na página   | Camada de negócio, com a mesma validação na retaguarda |
| Câmera e scanner  | Simulados com mensagem | `expo-camera` lendo código de barras real              |
| Rótulos de campo  | `label` com `for`      | Propriedade de acessibilidade dos componentes nativos  |
| Sistema de design | Variáveis CSS          | Mesmos valores em objeto de tema                       |
| Navegação         | Links entre arquivos   | Navegador de pilha e de abas                           |

Os valores de cor, espaçamento e área de toque são transportados sem alteração. O contraste já verificado permanece válido.

---

## Controle de versões

| Versão | Data       | Alterações                          | Responsável      |
| ------ | ---------- | ----------------------------------- | ---------------- |
| 1.0    | 28/09/2026 | Versão inicial para a entrega da N1 | Equipe StockEasy |
