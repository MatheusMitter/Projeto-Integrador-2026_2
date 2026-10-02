# StockEasy

Controle de estoque para o pequeno comércio, no celular que o comerciante já usa.

---

## O que é

O StockEasy é um aplicativo de celular para controle de estoque em comércio de pequeno porte. O comerciante cadastra os produtos que vende, registra o que entra quando chega mercadoria e o que sai quando vende, e o aplicativo mantém o saldo de cada item atualizado a cada registro.

A partir desse registro o aplicativo responde às perguntas que hoje ficam sem resposta na loja: o que está acabando, o que está perto de vencer, quanto dinheiro está parado na prateleira e quais produtos realmente saem. Não é preciso computador, nem servidor, nem treinamento. E não é preciso internet para registrar: o aplicativo funciona com o celular sem conexão, que é a situação normal no depósito da loja.

---

## Para quem é

Mercearia, minimercado, padaria, loja de conveniência, pequeno comércio de bairro. O porte típico é de até cinco pessoas trabalhando e um catálogo que vai de algumas dezenas a alguns milhares de itens.

Quem opera o aplicativo é o dono que também fica no caixa e o funcionário que recebe a mercadoria no balcão. É gente que usa WhatsApp e faz Pix todos os dias, mas nunca usou um sistema de gestão e não tem paciência para um que exija aprendizado. Por isso o aplicativo usa o vocabulário da loja, não o do software: entrada, saída, estoque mínimo, fornecedor.

O StockEasy também separa o que cada um vê. O funcionário registra movimentação e consulta produto. Preço de custo, margem de lucro e valor total do estoque ficam só com o proprietário.

Vale dizer para quem ele não é. O StockEasy não é um sistema de gestão para rede com dezenas de lojas, não emite documento fiscal e não substitui a frente de caixa de quem já tem uma. É controle de estoque, feito para o porte de negócio em que o controle hoje simplesmente não existe.

---

## O problema

Pequeno comerciante controla estoque de cabeça, no caderno ou numa planilha que ninguém atualiza há três semanas. Não é descuido: é que todo método disponível dá mais trabalho do que o dia permite.

O resultado aparece em quatro lugares. O produto de alto giro acaba sem ninguém perceber, e a falta só é descoberta quando o cliente pede e vai embora sem comprar. O capital fica parado em item que não sai, comprado por hábito ou por promoção do fornecedor. O perecível vence no fundo da prateleira, porque não há quem acompanhe validade de centenas de itens. E a decisão de compra é tomada no escuro, sem saber quais produtos sustentam o faturamento e quais só ocupam espaço.

As quatro perdas têm a mesma origem: não existe registro confiável do que entra e do que sai.

---

## Como funciona no dia a dia

No primeiro uso, o dono cria a conta e cadastra os produtos. Para cada item informa nome, categoria, preço de custo, preço de venda, quantas unidades tem hoje e o estoque mínimo, que é a quantidade abaixo da qual ele quer ser avisado. Código de barras, fornecedor e data de validade são opcionais. A margem de lucro é calculada na hora, a partir dos preços informados. Em seguida cadastra os fornecedores com quem trabalha.

Feito isso, a rotina é curta. Chegou mercadoria do fornecedor: o funcionário abre o aplicativo, escolhe o produto, marca Entrada, indica o motivo (compra, devolução de cliente, ajuste de inventário), digita a quantidade e confirma. Vendeu: mesma tela, aba Saída, motivo Venda. Perdeu uma caixa ou descartou um lote vencido: também é saída, com o motivo correspondente, e fica registrado como perda em vez de desaparecer da conta.

Antes de confirmar, a tela mostra a previsão: o estoque atual e o saldo que vai resultar da operação. Quem erra a quantidade descobre ali, e não depois. Se a saída for maior que o estoque disponível, o aplicativo recusa e explica o porquê, informando quanto há de fato. Se a operação for deixar o produto no limite, o aviso aparece antes da confirmação, para dar tempo de incluir o item na próxima compra.

Com a rotina alimentada, o painel passa a valer como primeira tela da manhã: quantos produtos estão cadastrados, quanto dinheiro está em estoque pelo preço de custo, quantos itens estão em situação crítica, quantos estão a menos de quinze dias do vencimento e quais são os cinco que mais saem. Tocando em um produto, aparecem as últimas movimentações com data, tipo, quantidade, saldo que ficou e nome de quem registrou. É o que permite descobrir se uma divergência foi erro de lançamento ou perda real.

---

## O que o aplicativo faz

- **Cadastro de produtos** com nome, categoria, preços de custo e de venda, quantidade em estoque, estoque mínimo e, se o comerciante quiser, código de barras, fornecedor e data de validade.
- **Cadastro de fornecedores**, com telefone, e-mail e a quantidade de produtos ligados a cada um. Fornecedor com produto vinculado não é excluído por engano: o aplicativo informa quantos itens dependem dele.
- **Registro de entradas e saídas** com motivo, quantidade e observação, em poucos toques. A tela de movimentação fica fixa na barra inferior, a um toque de qualquer outra.
- **Previsão do saldo antes de confirmar**, com bloqueio de saída maior que o estoque disponível.
- **Situação de estoque por produto**, em quatro faixas (crítico, baixo, normal e excesso), sempre comparada com o mínimo que o dono definiu para aquele item.
- **Aviso de vencimento**: produtos a quinze dias ou menos da validade entram na contagem do painel.
- **Busca por nome ou código de barras** na lista de produtos, com o resultado filtrando conforme se digita.
- **Painel consolidado** com total de produtos, valor em estoque, itens críticos, itens vencendo e ranking dos mais vendidos.
- **Dois níveis de acesso**: o funcionário registra movimentação sem ver custo, margem e valor do estoque; essa informação fica com o proprietário.
- **Histórico que não se apaga.** Movimentação registrada não é editada nem removida. Erro se corrige com um lançamento de ajuste no sentido contrário, e a trilha fica inteira para auditoria. Produto que sai de linha é desativado, e sai das listagens sem levar o histórico embora.
- **Funcionamento sem internet.** O registro é gravado no próprio aparelho. O sinal cair no depósito não trava a operação.

---

## Por que não um caderno, uma planilha ou um sistema de PDV

O caderno não avisa. Ele guarda o que foi escrito e nada mais. A planilha avisa, mas cobra caro: exige alguém digitando fora do horário de atendimento, e é esse custo que faz o controle ser abandonado em duas semanas.

Os sistemas de frente de caixa resolvem outra coisa. Foram desenhados para operação de venda com integração fiscal, custam por mês, pressupõem computador no balcão e dependem de conexão. Para a loja de bairro é tamanho errado, e quase sempre fica a licença paga sem o módulo de estoque alimentado.

O StockEasy aposta em três escolhas diferentes. O registro acontece no ponto de uso, no celular, durante o atendimento, em segundos. O alerta é relativo ao produto, não um número único para a loja inteira: oito unidades é excesso para um item que sai uma vez por mês e é falta para o que sai todo dia, e a comparação é sempre com o mínimo que o próprio dono definiu. E nada depende de conexão para funcionar.

---

## Em que ponto o produto está

O StockEasy está em desenvolvimento, e vale ser preciso sobre o que já roda.

Hoje funciona em celular Android: criação de conta, acesso com os dois perfis, cadastro e edição de produtos, cadastro e manutenção de fornecedores, registro de entradas e saídas com todas as validações descritas acima, histórico por produto, busca na lista, situação de estoque por item e o painel com os indicadores e o ranking de mais vendidos. Tudo isso opera com os dados guardados no próprio aparelho, sem internet.

Está previsto para as próximas etapas, até o fim de 2026:

- **Cópia dos dados em servidor**, para que a troca ou a perda do celular não leve o estoque junto. Hoje os dados existem apenas no aparelho.
- **Leitura de código de barras pela câmera**, com preenchimento automático do cadastro a partir de uma base pública de produtos. Hoje o código é digitado.
- **Notificação no celular** para estoque crítico e vencimento próximo, sem precisar abrir o aplicativo.
- **Filtros e ordenação** na lista de produtos, por categoria, fornecedor e situação.
- **Relatórios por período**, com os produtos de maior saída e os de baixo giro, e o histórico geral de movimentações com filtro por produto, data e responsável.
- **Ajuste do prazo do aviso de vencimento**, hoje fixo em quinze dias.
- **Versão instalável**, para o comerciante usar sem o ambiente de desenvolvimento.

---

## Quem desenvolve

O aplicativo é desenvolvido pela equipe StockEasy como projeto integrador do Curso Superior de Tecnologia em Análise e Desenvolvimento de Sistemas da PUC Goiás, no semestre 2026/2. A equipe é formada por Matheus Oliveira Mitter, Vitor Leal dos Santos e Felipe Milhomem Rocha.
