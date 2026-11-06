# StockEasy — Aplicação móvel

Aplicação em React Native com Expo: navegação em abas e pilhas, autenticação com dois perfis, produtos, fornecedores, movimentação de estoque e relatórios, tudo sobre a persistência local em SQLite.

---

## Como executar

Requer Node 22.18 ou superior (o React Native aceita a partir do 20.19.4; os testes precisam do 22.18). O projeto está no Expo SDK 57, com React Native 0.86, React 19 e React Navigation 7.

```bash
cd app
npm install
```

**No emulador ou no celular Android (recomendado).** `npm run android` (o mesmo que `npx expo run:android`) gera a build de desenvolvimento do próprio StockEasy, instala no emulador aberto ou no celular conectado e sobe o servidor do JavaScript. É o caminho que não depende da versão do Expo Go.

**Pelo Expo Go.** `npx expo start` e leia o QR code. Só funciona enquanto o SDK 57 for o mais recente: o Expo Go das lojas acompanha apenas a última versão do Expo, e o projeto deixa de abrir nele quando sair a próxima.

**No Android Studio (forma usada na apresentação).** A pasta `android/` é o projeto nativo gerado pelo `npx expo prebuild --platform android` e abre direto no Android Studio.

1. No Android Studio: **File → Open** e escolha `app/android` (não a pasta `app`). Espere o Gradle sincronizar. Use o JDK 17 ou 21: em **Settings → Build, Execution, Deployment → Build Tools → Gradle → Gradle JDK**, selecione um deles. O React Native não recomenda versões mais novas.
2. Num terminal, dentro de `app/`, suba o servidor do JavaScript: `npx expo start`. A variante _debug_ busca o código nele, por isso ele precisa ficar aberto.
3. Escolha o emulador (ou o celular com depuração USB) na barra superior e clique em **Run ▶**. Na primeira execução, se o app abrir com tela vermelha de conexão, rode `adb reverse tcp:8081 tcp:8081` e reabra.

Para gerar o pacote instalável sem depender do servidor (R14): **Build → Generate Signed App Bundle / APK**, ou `./gradlew assembleRelease` dentro de `app/android`. Pela linha de comando, o Gradle precisa saber onde estão o SDK do Android e o JDK, porque a pasta recriada não traz o `local.properties` que o Android Studio gera: no macOS, `export ANDROID_HOME=~/Library/Android/sdk` e `JAVA_HOME` apontando para um JDK 17 ou 21. Exporte também `NODE_ENV=production`; sem ele, o empacotamento do JavaScript avisa que não sabe para qual ambiente é a versão. O APK sai em `android/app/build/outputs/apk/release/`. Para testar só no emulador, `./gradlew assembleRelease -PreactNativeArchitectures=arm64-v8a` compila uma arquitetura só e termina bem mais rápido; para a entrega, gere sem o filtro.

A pasta `android/` não é versionada: ela é recriada a partir do `app.json` com `npx expo prebuild --platform android`, que a apaga e gera de novo. Ícone, cores, barra de status e tela de abertura saem do `app.json` e de `assets/`. As permissões também. O modelo do Expo declara a de aparecer sobre outros apps (`SYSTEM_ALERT_WINDOW`), que serve às ferramentas de depuração. Ela fica só na versão de desenvolvimento, porque o `app.json` a bloqueia na de entrega (`android.blockedPermissions`). A assinatura de release é reaplicada a cada geração pelo plugin `plugins/assinatura-release.js`, que lê as senhas do arquivo do Gradle do seu usuário, `~/.gradle/gradle.properties`, fora do projeto e do Git:

```properties
STOCKEASY_RELEASE_STORE_FILE=/caminho/completo/para/app/stockeasy-release.keystore
STOCKEASY_RELEASE_KEY_ALIAS=stockeasy
STOCKEASY_RELEASE_STORE_PASSWORD=...
STOCKEASY_RELEASE_KEY_PASSWORD=...
```

Sem essas propriedades, o APK de release sai assinado com a chave de debug. A chave `stockeasy-release.keystore`, em `app/`, também fica fora do Git; guarde uma cópia em lugar seguro, porque sem ela não há como atualizar o aplicativo instalado mantendo a mesma assinatura.

**No navegador não funciona.** O `expo-sqlite` não tem implementação para web: o módulo lança `Unimplemented`. Como toda a persistência depende dele, a aplicação exige celular ou emulador. Abrindo no navegador, aparece uma tela explicando isso em vez de um erro de banco.

---

## Credenciais de teste

A carga inicial cria dois usuários, um de cada perfil, para demonstrar a regra RN01.

| Perfil       | E-mail                     | Senha    | Acesso                                          |
| ------------ | -------------------------- | -------- | ----------------------------------------------- |
| Proprietário | proprietario@stockeasy.com | admin123 | Completo                                        |
| Operador     | operador@stockeasy.com     | admin123 | Sem preço de custo, margem nem valor do estoque |

Entrar com um perfil, usar **Ajustes → Sair** e entrar com o outro é a forma mais direta de verificar a segregação de acesso: a tela de detalhes do produto e o painel mudam de conteúdo.

As credenciais não são exibidas na interface nem pré-preenchidas no formulário de acesso. Ficam documentadas aqui porque são de uma carga de exemplo, sem valor fora do ambiente local.

---

## Verificação

```bash
npm run verificar          # tipos e testes, em sequência
npm run verificar-tipos    # compilação TypeScript em modo estrito
npm test                   # 151 testes: 81 das regras, 31 do banco, 33 da sincronização e do serviço externo, 6 das notificações
```

Os testes rodam em Node 22.18 ou superior, sem emulador.

- **Regras** (`tests/regras.test.mjs`): importam `src/services/regras.ts` diretamente, e não uma cópia das funções. Rodam sem banco, porque a camada de negócio não depende de tela nem de persistência — é o efeito prático da separação em camadas.
- **Banco** (`tests/estoque`, `produto`, `cadastro`, `relatorio` e `migracao.test.mjs`): rodam os serviços e repositórios de verdade, com o mesmo esquema e a mesma carga inicial do aplicativo, num SQLite em memória. O `expo-sqlite` só existe no aparelho; nos testes, ele é trocado por um adaptador sobre o SQLite que vem no Node (`tests/apoio/expo-sqlite-node.mjs`). Cada arquivo começa com um banco novo. O de migração monta um banco no formato antigo e confere que a migração preserva os dados.
- **Sincronização e serviço externo** (`tests/sincronizacao`, `autenticacao-remota` e `produto-externo.test.mjs`): uma retaguarda simulada ocupa o lugar do `fetch` (`tests/apoio/servidor-falso.mjs`). Conferem o lote em ordem, o que o servidor devolve, a alteração local que não pode ser sobrescrita, as falhas de rede e o login remoto.
- **Notificações** (`tests/notificacoes.test.mjs`): um substituto do `expo-notifications` guarda o que o aplicativo agendou, para conferir o aviso de estoque crítico, o resumo das 9h e o efeito do interruptor.

O hook em `tests/resolucao-ts.mjs` faz as duas coisas: completa a extensão `.ts` dos imports, que o aplicativo omite como o Metro espera, e aponta os módulos nativos (`expo-sqlite`, `expo-crypto`, `expo-secure-store`, `expo-network` e `expo-notifications`) para os substitutos em `tests/apoio/`. Como o Node apaga os tipos sem consultar o compilador, import só de tipo precisa da palavra `type`; o `verbatimModuleSyntax` do `tsconfig.json` cobra isso.

---

## Telas e identidade visual

| Grupo                | Telas                                                                     |
| -------------------- | ------------------------------------------------------------------------- |
| Acesso               | Login, Criar conta, Recuperar senha                                       |
| Abas                 | Início, Produtos, Movimentar, Relatórios, Ajustes                         |
| Pilha de Produtos    | Novo/Editar produto, Detalhes do produto                                  |
| Pilha de Ajustes     | Fornecedores                                                              |

O fluxo e as funções vêm do protótipo navegável (`prototipo/`). A identidade visual (paleta, raios, espaçamentos e desenho dos componentes) segue o Figma da equipe e está concentrada em `src/theme/tema.ts`. Três desvios do Figma, todos por acessibilidade: a escala de fonte foi ampliada (o corpo do Figma tem 12px); verde, âmbar e vermelho ganharam um tom escuro para texto e badge, porque os originais não chegam a 4,5:1; e a borda dos campos de texto é mais escura que a dos cards, para atingir 3:1.

Recuperar senha valida o e-mail e responde de forma neutra, mas o envio do link ainda não existe, porque a retaguarda não envia e-mail. A tela diz isso em vez de simular um envio.

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

| Arquivo                            | Papel                                                                 |
| ---------------------------------- | --------------------------------------------------------------------- |
| `services/regras.ts`               | As regras em funções puras: entram dados, sai decisão                 |
| `services/produtoService.ts`       | Produto: RN01 na leitura, validação e cadastro com a entrada inicial  |
| `services/cadastroService.ts`      | Categorias e fornecedores: permissão, RN13 e desativação (RN12)       |
| `services/estoqueService.ts`       | A transação da movimentação                                           |
| `services/relatorioService.ts`     | Relatórios e ranking, com o valor em reais só para o proprietário     |
| `services/authService.ts`          | Autenticação e sessão, pela retaguarda quando há internet             |
| `services/sincronizacaoService.ts` | Fila de envio, download do que mudou e estado para as telas (R6)      |
| `services/apiClient.ts`, `rede.ts`, `sessaoRemota.ts` | Chamada à retaguarda com limite de tempo, conferência de internet e token no armazenamento seguro |
| `services/produtoExternoService.ts` | Consulta ao Open Food Facts pelo código de barras (R7)               |
| `services/notificacoesService.ts`  | Notificações locais: estoque crítico e resumo de vencimento (R8)      |
| `services/preferenciaService.ts`   | Preferências do aparelho: notificações e prazo do vencimento          |
| `repositories/`                    | SQL parametrizado, um repositório por assunto; nenhum decide regra    |
| `database/esquema.ts`              | Esquema do SQLite, espelhando o PostgreSQL                            |
| `database/migracoes.ts`            | Versão do banco do aparelho e migração de tabela que já existe        |
| `database/cripto.ts`               | Identificador no formato padrão e resumo da senha com sal             |

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

As escritas passam pelos repositórios (`produtoRepository.gravarSaldo` e `movimentacaoRepository.inserir`), dentro da transação aberta por `emTransacao`, em `database/conexao.ts`. O cadastro de produto usa a mesma sequência: o produto e a entrada da quantidade inicial são gravados na mesma transação.

No servidor (`api/`, `SincronizacaoService`), o passo 1 usa `SELECT ... FOR UPDATE` para bloquear a linha, impedindo que duas movimentações simultâneas leiam o mesmo saldo. O SQLite serializa escritas por natureza, então aqui a transação já produz o mesmo efeito.

---

## Regras implementadas

| Regra | Onde está                        | Como verificar na aplicação                                         |
| ----- | -------------------------------- | ------------------------------------------------------------------- |
| RN01  | `regras.ts`, aplicada nos serviços e nas telas | Entrar como operador: custo, margem e valor do estoque desaparecem |
| RN02  | `authService.ts`                 | Cadastrar conta com e-mail já usado                                 |
| RN03  | `regras.ts`                      | Preço de venda abaixo do custo: avisa, mas deixa salvar             |
| RN04  | Índice único parcial no esquema  | Cadastrar produto com o código de barras de um produto ativo        |
| RN05  | `estoqueService.ts`              | Histórico mostra usuário, tipo, quantidade e saldo de cada registro |
| RN06  | `regras.ts` + `CHECK` no esquema | Informar saída maior que o estoque: bloqueia e explica              |
| RN07  | `regras.ts`                      | Saída que derruba o saldo ao mínimo: avisa antes de confirmar       |
| RN08  | `regras.ts` (`resumirEstoque`)   | Valor do estoque no painel, somando quantidade vezes custo          |
| RN10  | `regras.ts`                      | Margem calculada no cadastro e nos detalhes                         |
| RN12  | `produtoService` e `cadastroService` | Desativar produto ou excluir fornecedor: sai da lista, o registro permanece |
| RN13  | `cadastroService.ts`             | Excluir fornecedor com produtos vinculados: bloqueia                |

---

## Requisitos cobertos nesta entrega

| Req | Situação | Onde                                                           |
| --- | -------- | -------------------------------------------------------------- |
| R1  | Atendido | 11 telas: 3 de acesso, 5 abas, 2 na pilha de produtos e Fornecedores em Ajustes |
| R2  | Atendido | Login, cadastro, logout e dois perfis com permissões distintas |
| R3  | Atendido | Produto e fornecedor completos; manutenção de categoria (RF17, desejável) pendente |
| R4  | Atendido | RN01, RN06, RN07, RN12 e RN13 implementadas e verificáveis     |
| R5  | Atendido | SQLite, com fila de pendentes da sincronização                 |
| R6  | Atendido | Login e cadastro pela retaguarda, fila, envio e download automáticos e botão "Sincronizar agora" |
| R7  | Atendido | Open Food Facts preenche o cadastro pelo código de barras      |
| R8  | Atendido | Câmera no código de barras; notificações de estoque crítico e de vencimento |
| R9  | Atendido | Busca, filtro por situação, painel e relatórios por período    |
| R10 | Atendido | Erro explicado, lista vazia com ação, estado de carregamento   |
| R11 | Atendido | Contraste AA, alvo de 48dp, rótulos acessíveis                 |
| R12 | Atendido | Três camadas com dependência em sentido único                  |

Ainda não comprovado: o pacote instalável em aparelho físico (R14), previsto para o Ciclo 4. Até aqui, o APK de release foi conferido no emulador.

---

## Limitações declaradas

**Não roda no navegador.** O `expo-sqlite` não implementa a interface de banco para web. A aplicação precisa de celular ou emulador. É consequência direta da escolha de banco local, que por sua vez é exigência do ambiente de uso: o depósito da loja é onde o sinal falha.

**No aparelho, a senha é um resumo SHA-256 com sal, não BCrypt.** O BCrypt do RNF11 fica na retaguarda, onde a conta é criada e conferida com internet. No aparelho, o resumo com sal serve ao login sem rede (DA11); a migração 2 do banco converteu as senhas que estavam em texto.

**A RN01 vale até a camada de negócio, não até o arquivo.** Para o operador, os serviços entregam o produto sem o custo e o resumo sem o valor do estoque, e as telas omitem esses campos. Mas o arquivo do banco está no aparelho de quem usa, com todos os dados: num banco local isso é inevitável. A retaguarda também envia o custo no download, porque o token do aparelho é o da conta que o ligou; filtrar por perfil no servidor fica para quando houver contas de operador lá.

**Produto cadastrado pelo operador fica com custo zero.** O operador não vê nem informa o custo (RN01). Até o proprietário editar o produto e informar o custo, a margem e o valor do estoque consideram custo zero. Quando o operador edita um produto, o custo gravado é mantido.

**Um aparelho guarda uma loja só.** A loja do aparelho se liga à do servidor na primeira conta criada ou confirmada com internet, e conta de outra loja é recusada. Uma conta criada depois, num aparelho já ligado, fica só nele, como operador, até a administração de usuários na retaguarda. Por isso, no servidor, a movimentação feita por uma conta que só existe no aparelho fica no nome da conta que ligou o aparelho.

**Recuperar os dados num celular novo ainda não é automático.** O que foi sincronizado fica guardado no servidor. Mas um celular recém-instalado já vem com a carga de exemplo, pendente de envio. Ao entrar com uma conta cuja loja já tem dados no servidor, esses exemplos colidem com os cadastros da loja (mesmo nome de categoria e mesmo código de barras), o servidor recusa o envio e a sincronização para antes de baixar os dados da loja. A correção prevista para o Ciclo 4: quando um aparelho novo se liga a uma loja que já tem dados no servidor, os dados do aparelho dão lugar aos da loja.

**As contas da carga inicial não sincronizam.** Elas só existem no aparelho: entram sem rede, mas sincronizar pede uma conta criada com internet.

**Saldo negativo do servidor vira 0 no aparelho.** Se vendas de aparelhos diferentes passarem do estoque, o servidor registra a divergência (DA09). No aparelho, onde a RN06 vale, o saldo fica 0, e o Painel mostra o valor do servidor até a sincronização seguinte.

**A hospedagem gratuita dorme.** Depois de 15 minutos sem uso, a primeira chamada leva cerca de 1 minuto. O login não espera mais de 8 segundos e segue pelo aparelho; a sincronização tenta de novo depois. Criar conta com internet espera até 30 segundos e, sem resposta, pede nova tentativa, em vez de criar a conta só no aparelho: o servidor pode ter criado a conta mesmo sem responder a tempo.

**O resumo das 9h usa a contagem da última atualização.** Ele é refeito ao abrir o aplicativo, ao salvar produto, ao sincronizar e ao trocar o prazo. Com o aplicativo fechado por dias, um produto que entrou no prazo nesse meio tempo só aparece no resumo depois da próxima abertura.

**O perfil não é escolhido no cadastro.** O primeiro usuário de uma loja é o proprietário; as contas criadas depois entram como operador. Sem isso, qualquer operador contornaria a RN01 criando uma segunda conta. Promover alguém a proprietário é operação de administração de usuários, prevista para o servidor. Como a carga de exemplo já cria um proprietário, toda conta nova entra como operador. O RF01 foi alinhado a essa regra na versão 1.3 do documento de projeto, como alteração de escopo. Com a retaguarda, criar conta com internet num aparelho ainda sem loja no servidor segue o `docs/03-arquitetura.md` (seção 5.1): cria a loja lá, e a conta é a proprietária dela.

**A carga de exemplo só roda com o banco vazio.** Um aparelho que já tinha o banco de uma versão anterior mantém os dados antigos, como o nome "Marlene Proprietária" no lugar de "Proprietário". Para ver a carga atual é preciso reinstalar o aplicativo.

**O `npm install` mostra 14 alertas de segurança, 2 deles altos.** Todos vêm de bibliotecas usadas só pelas ferramentas de desenvolvimento do Expo, e nenhuma entra no APK:
- `zod`, na ferramenta de linha de comando: a correção só existe na versão 4, e o Expo 57 exige a 3;
- `glob` e `minimatch`, em várias ferramentas: a correção só existe nas versões 14 e 11, que o Expo 57 ainda não aceita;
- `deepmerge`, na leitura da configuração: não há versão corrigida.

Forçar essas versões quebraria as ferramentas do Expo. Quando o Expo publicar versões com as correções, rode `npx expo install --fix` e depois `npm audit fix`. **Não rodar `npm audit fix --force`**: ele troca o Expo de versão maior e quebra o projeto.

**A loja do aparelho é a de identificador 1.** Todo registro pertence a ela, criada na carga inicial; quando o aparelho é ligado ao servidor, ela passa a ter o identificador da loja de lá.

**O relatório de mais vendidos usa o preço atual.** Se o preço mudou no período, o valor fica distorcido. A correção prevista é gravar o preço praticado em cada movimentação.
