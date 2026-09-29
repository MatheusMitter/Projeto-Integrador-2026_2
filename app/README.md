# StockEasy — Aplicação móvel

Aplicação em React Native com Expo. Esta é a entrega parcial da N1: navegação estruturada, autenticação com dois perfis e o módulo de produtos e movimentação integrado à persistência local.

---

## Como executar

Requer Node 18 ou superior.

```bash
cd app
npm install
```

**No celular (recomendado).** Instale o Expo Go pela loja do aparelho, rode `npm start` e leia o código apresentado no terminal com a câmera. O aparelho e o computador precisam estar na mesma rede.

**No navegador.** `npm run web` e abra o endereço indicado. Serve para inspeção rápida; a experiência real é no aparelho.

**No emulador Android.** `npm run android`, com o Android Studio configurado.

---

## Credenciais de teste

A carga inicial cria dois usuários, um de cada perfil, para demonstrar a regra RN01.

| Perfil       | E-mail                       | Senha    | Acesso                                                          |
| ------------ | ---------------------------- | -------- | --------------------------------------------------------------- |
| Proprietário | proprietario@stockeasy.com   | admin123 | Completo                                                        |
| Operador     | operador@stockeasy.com       | admin123 | Sem preço de custo, margem nem valor do estoque                 |

Entrar com um perfil e depois com o outro é a forma mais direta de verificar a segregação de acesso: a tela de detalhes do produto e o painel mudam de conteúdo.

---

## Verificação

```bash
npm run verificar-tipos    # compilação TypeScript em modo estrito
npm run testar-regras      # 21 testes das regras de negócio
```

Os testes rodam em Node puro, sem emulador e sem banco. Isso é possível porque a camada de negócio não depende de tela nem de persistência — é o efeito prático da separação em camadas.

---

## Organização em camadas

```
src/
├── screens/        Apresentação — telas e estados de interface
├── components/     Apresentação — componentes reaproveitados
├── navigation/     Apresentação — abas e pilha
├── services/       Negócio — regras, validações, transação
├── repositories/   Persistência — SQL sobre o SQLite
├── database/       Persistência — esquema e conexão
├── domain/         Domínio — tipos das entidades
└── theme/          Design system
```

A dependência aponta sempre para dentro: a tela chama o serviço, o serviço chama o repositório. O contrário nunca acontece. É o que o requisito R12 pede e o que permite testar a regra isoladamente.

| Arquivo                          | Papel                                                        |
| -------------------------------- | ------------------------------------------------------------ |
| `services/regras.ts`             | As regras em funções puras: entram números, sai decisão      |
| `services/estoqueService.ts`     | A transação da movimentação                                  |
| `services/authService.ts`        | Autenticação e sessão                                        |
| `repositories/produtoRepository.ts` | Consultas de produto, sempre parametrizadas               |
| `database/esquema.ts`            | Esquema do SQLite, espelhando o PostgreSQL                   |

---

## O ponto central: a transação da movimentação

Está em `services/estoqueService.ts`. Atualizar o saldo e gravar o histórico precisam ser indivisíveis: se a primeira escrita acontece e a segunda falha, o saldo passa a divergir do histórico e a auditoria exigida por RN05 se perde.

A sequência dentro da transação:

1. lê o saldo atual do produto
2. valida RN06 contra o saldo lido
3. calcula o saldo resultante
4. atualiza o produto
5. grava a movimentação com o saldo resultante
6. confirma, ou desfaz tudo em caso de erro

No servidor, o passo 1 usará `SELECT ... FOR UPDATE` para bloquear a linha, impedindo que duas movimentações simultâneas leiam o mesmo saldo. O SQLite serializa escritas por natureza, então aqui a transação já produz o mesmo efeito.

---

## Regras implementadas

| Regra | Onde está                        | Como verificar na aplicação                                        |
| ----- | -------------------------------- | ------------------------------------------------------------------ |
| RN01  | `regras.ts`, aplicada nas telas  | Entrar como operador: custo, margem e valor do estoque desaparecem |
| RN02  | `authService.ts`                 | Cadastrar conta com e-mail já usado                               |
| RN03  | `regras.ts`                      | Preço de venda abaixo do custo: avisa, mas deixa salvar            |
| RN04  | Restrição `UNIQUE` no esquema    | Cadastrar produto com código de barras repetido                    |
| RN05  | `estoqueService.ts`              | Histórico mostra usuário, tipo, quantidade e saldo de cada registro |
| RN06  | `regras.ts` + `CHECK` no esquema | Informar saída maior que o estoque: bloqueia e explica              |
| RN07  | `regras.ts`                      | Saída que derruba o saldo ao mínimo: avisa antes de confirmar       |
| RN08  | `produtoRepository.ts`           | Valor do estoque no painel, somando quantidade vezes custo          |
| RN10  | `regras.ts`                      | Margem calculada no cadastro e nos detalhes                        |
| RN12  | `produtoRepository.desativar`    | Desativar produto: sai da lista, histórico permanece               |
| RN13  | `cadastroRepository.ts`          | Excluir fornecedor com produtos vinculados: bloqueia                |

---

## Requisitos cobertos nesta entrega

| Req | Situação        | Onde                                                          |
| --- | --------------- | ------------------------------------------------------------- |
| R1  | Atendido        | Abas e pilha, com 7 telas navegáveis                          |
| R2  | Atendido        | Login, cadastro e dois perfis com permissões distintas        |
| R3  | Parcial         | Produto completo; fornecedor completo; falta categoria        |
| R4  | Atendido        | RN01, RN06, RN07, RN12 e RN13 implementadas e verificáveis    |
| R5  | Atendido        | SQLite, com marcação de pendência de sincronização            |
| R9  | Parcial         | Busca e painel com indicadores; relatórios no Ciclo 2         |
| R10 | Atendido        | Erro explicado, lista vazia com ação, estado de carregamento   |
| R11 | Atendido        | Contraste AA, alvo de 44px, rótulos acessíveis                |
| R12 | Atendido        | Três camadas com dependência em sentido único                  |

Ainda não implementados, previstos para os Ciclos 3 e 4: persistência remota e sincronização (R6), serviço externo (R7), câmera e notificações (R8), pacote instalável (R14).

---

## Limitações declaradas

**A senha é comparada em texto puro.** O requisito RNF11 exige resumo criptográfico com BCrypt. A verificação de senha passa a acontecer no servidor no Ciclo 3, e é lá que o resumo será aplicado. Está sinalizado no próprio `authService.ts`.

**Não há sincronização.** Os dados existem apenas no aparelho. As colunas de controle já existem no esquema desde agora, porque acrescentá-las depois exigiria migração do banco de quem já estivesse usando.

**A loja é fixa.** Todo registro pertence à loja de identificador 1, criada na carga inicial. O cadastro de loja entra junto com a autenticação no servidor.

**O relatório de mais vendidos usa o preço atual.** Se o preço mudou no período, o valor fica distorcido. A correção prevista é gravar o preço praticado em cada movimentação.
