# StockEasy — Identidade Visual

> **Situação:** definida em 19/10/2026 e **em aplicação**. O aplicativo e o protótipo ainda mostram a identidade anterior (logotipo "SE" e azul `#2450D6`) até a troca ser feita nas telas.

## Visão geral

O StockEasy é o controle de estoque do pequeno comércio de qualquer ramo, inclusive de quem está começando. O visual deve comunicar:

- **Organização**: tudo no lugar, sem poluição.
- **Controle**: o comerciante sabe o que tem e o que falta.
- **Facilidade**: quem nunca usou um sistema entende na primeira vez.

O azul é a identidade da marca, mas aparece **em detalhes e nas ações principais**, nunca em excesso. A base da interface é clara e neutra; o azul muda de tom conforme a função.

---

## Logo

![Logo horizontal](identidade-visual/logo-horizontal.svg)

O símbolo é um quadrado dividido por uma linha em S: `#2450D6` em cima, `#0E1E4A` embaixo. O nome é "StockEasy" em Sora 700, já convertido em desenho: "Stock" em `#0E1E4A` e "Easy" em `#2450D6`.

Sobre fundo escuro, o símbolo continua igual e só a palavra muda: "Stock" em `#F7F9FB` e "Easy" em `#6B8CF0`, um tom mais claro do mesmo azul.

As cores do logo são fixas e não seguem a paleta da interface.

| Arquivo | Quando usar |
|---|---|
| [`logo-horizontal.svg`](identidade-visual/logo-horizontal.svg) | Versão padrão, sobre fundo claro |
| [`logo-empilhado.svg`](identidade-visual/logo-empilhado.svg) | Espaço quadrado: capa, tela de abertura |
| [`logo-horizontal-fundo-escuro.svg`](identidade-visual/logo-horizontal-fundo-escuro.svg) e [`logo-empilhado-fundo-escuro.svg`](identidade-visual/logo-empilhado-fundo-escuro.svg) | Sobre o Fundo escuro `#080E1B`. Não usar sobre Azul-noite: a metade de baixo do símbolo some |
| [`icone-arredondado.svg`](identidade-visual/icone-arredondado.svg) | Símbolo sozinho: login, documentos, apresentações |
| [`icone.svg`](identidade-visual/icone.svg) e [`icone-android-adaptativo.svg`](identidade-visual/icone-android-adaptativo.svg) | Ícone do aplicativo (o sistema recorta os cantos) |

- **Tamanho mínimo:** símbolo com 16 px; logo horizontal com 120 px de largura.
- **Área livre:** pelo menos 1/4 da altura do símbolo em volta do logo.
- **Não fazer:** trocar as cores, girar, esticar, contornar, aplicar sombra ou degradê, reescrever o nome com outra fonte.

---

## Paleta de cores

### Azuis — a identidade

Cada tom tem uma função fixa. Variar o tom dá estilo; variar sem regra deixa o app desorganizado.

| Nome | HEX | RGB | Uso |
|---|---|---|---|
| **Azul-noite** | `#002242` | 0, 34, 66 | Cabeçalho escuro, cartão de resumo |
| **Azul-profundo** | `#144774` | 20, 71, 116 | Botões de acesso: Entrar, Criar conta, Recuperar senha |
| **Azul-aço** | `#336FA5` | 51, 111, 165 | Links, aba ativa, ícones ativos, selo Excesso |
| **Azul-médio** | `#4E8BB8` | 78, 139, 184 | Contorno de foco, ícones grandes |
| **Azul-ciano** | `#37A5C8` | 55, 165, 200 | Registrar entrada e saída, botão flutuante (+) |
| **Azul-lagoa** | `#4EB1D1` | 78, 177, 209 | Gráficos, destaque sobre fundo escuro |
| **Azul-céu** | `#61BBD8` | 97, 187, 216 | Gráficos |
| **Azul-névoa** | `#6FADD2` | 111, 173, 210 | Gráficos |
| **Azul-gelo** | `#8BC9DD` | 139, 201, 221 | Selos suaves, gráficos |
| **Azul-bruma** | `#9ECAE3` | 158, 202, 227 | Legenda sobre Azul-noite |
| **Azul-claro** | `#ADD8E6` | 173, 216, 230 | Chip ativo, linha selecionada |

### Neutros — a base

| Nome | HEX | RGB | Uso |
|---|---|---|---|
| **White Lilac** | `#F7F9FB` | 247, 249, 251 | Fundo das telas, campos, texto sobre botão escuro |
| **Card** | `#EAF1F7` | 234, 241, 247 | Cards, itens de lista, barra de abas |
| **Borda** | `#D3DEE9` | 211, 222, 233 | Contorno dos cards (decorativo) |
| **Borda de campo** | `#7D8AA3` | 125, 138, 163 | Contorno de campo de texto e busca |
| **Preto suave** | `#111A2E` | 17, 26, 46 | Texto principal, botões comuns |
| **Texto suave** | `#5E6B85` | 94, 107, 133 | Legendas, placeholder, aba inativa |
| **Fundo escuro** | `#080E1B` | 8, 14, 27 | Reservado para um futuro modo escuro |

Branco puro (`#FFFFFF`) e preto puro (`#000000`) não são usados na interface.

### Situação do estoque e movimentação

| Nome | HEX | Uso |
|---|---|---|
| **Crítico** | `#CF3A3A` | Selo Crítico |
| **Baixo** | `#9F6500` | Selos Baixo e Vence |
| **OK** | `#12804F` | Selo OK |
| **Excesso** | `#336FA5` | Selo Excesso (Azul-aço) |
| **Entrada** | `#0D6B41` | Texto de entrada sobre card |
| **Saída / perigo** | `#A12A2A` | Texto de saída, erro, botões de excluir, desativar e sair |

Situação e movimentação sempre levam a palavra ou a seta junto da cor.

---

## Hierarquia

```text
Tela: White Lilac (#F7F9FB)
└── Card: #EAF1F7, contorno #D3DEE9
    ├── Texto: Preto suave (#111A2E) · legenda: Texto suave (#5E6B85)
    ├── Link e ícone ativo: Azul-aço (#336FA5)
    └── Campo: White Lilac, contorno #7D8AA3 (foco: Azul-médio)
Cabeçalho ou resumo em destaque: Azul-noite (#002242), texto White Lilac
```

O card nunca tem a mesma cor do fundo.

---

## Botões

| Tipo | Fundo | Texto | Onde |
|---|---|---|---|
| **Comum** | Preto suave `#111A2E` | White Lilac | Salvar, Compartilhar relatório, Ir para produtos |
| **Secundário** | Transparente, contorno `#7D8AA3` | Preto suave | Cancelar, Voltar, Trocar |
| **Acesso** | Azul-profundo `#144774` | White Lilac | Entrar, Criar conta, Recuperar senha |
| **Destaque** | Azul-ciano `#37A5C8` | Preto suave | Registrar entrada, Registrar saída, botão flutuante (+) de cadastro |
| **Texto** | Transparente | Azul-aço | Esqueci a senha, Já tenho conta, Editar produto |
| **Perigo** | Transparente, contorno `#A12A2A` | `#A12A2A` | Excluir fornecedor, Desativar produto, Sair |

Uma ação principal por tela. Altura mínima de 48 px, cantos de 8 px.

---

## Contraste (WCAG 2.1 AA)

### Aprovadas

| Texto | Fundo | Contraste | Uso |
|---|---|---|---|
| Preto suave | White Lilac | 16,4:1 | Texto principal |
| Preto suave | Card | 15,2:1 | Texto em cards |
| Texto suave | Card | 4,7:1 | Legendas |
| White Lilac | Preto suave | 16,4:1 | Botão comum |
| White Lilac | Azul-profundo | 9,1:1 | Botão de acesso |
| Preto suave | Azul-ciano | 6,1:1 | Botão de destaque |
| Azul-aço | White Lilac | 5,0:1 | Links, aba ativa |
| Azul-noite | Azul-claro | 10,6:1 | Chip ativo |
| White Lilac | Azul-noite | 15,2:1 | Cabeçalho escuro |

### Com restrição (só ícone, contorno ou texto de 24 px ou mais)

| Cor | Fundo | Contraste |
|---|---|---|
| Azul-médio | White Lilac | 3,5:1 |
| Borda de campo | Card | 3,1:1 |

### Proibidas

| Texto | Fundo | Contraste | Motivo |
|---|---|---|---|
| White Lilac | Azul-ciano, Azul-lagoa, Azul-céu, Azul-névoa, Azul-gelo, Azul-bruma, Azul-claro | 1,4 a 2,7:1 | Texto claro sobre azul claro não se lê; use Preto suave |
| Qualquer azul claro | White Lilac ou Card | abaixo de 3:1 | Azul claro não vira texto sobre fundo claro |

---

## Letras

A interface usa a fonte do sistema (Roboto no Android). A Sora aparece só no logo.

| Estilo | Tamanho | Peso |
|---|---|---|
| Destaque | 28 px | 800 |
| Número de resumo (KPI) | 24 px | 800 |
| Título da tela | 22 px | 800 |
| Título com voltar | 18 px | 800 |
| Corpo e botão | 15 px | 400 / 800 |
| Rótulo e legenda | 13 px | 700 / 400 |
| Selo e aba | 11 px | 700 |

Nada abaixo de 11 px.

---

## Cantos, espaço e ícones

- **Cantos:** 6 px na miniatura do produto; 8 px em botões, campos e cards; 12 px no botão flutuante e no ícone do login; arredondado total em chips e selos.
- **Espaço:** 4, 8, 14, 20 e 28 px. Margem lateral das telas: 14 px.
- **Toque:** tudo que se toca tem pelo menos 48 px de altura.
- **Sombra:** só no botão flutuante. Cards se separam pela cor e pelo contorno.
- **Ícones:** Ionicons, de 18 a 24 px, na cor do texto ao lado.
- **Barra de abas:** a aba ativa ganha ícone em Azul-noite sobre pílula Azul-claro e rótulo em Azul-aço negrito, para a diferença não ficar só na cor.
