# Retaguarda do StockEasy (`api/`)

Serviço em Spring Boot que recebe os lotes dos aparelhos e devolve o que mudou na loja. O aplicativo funciona sem ele: a retaguarda só entra quando há rede (`docs/03-arquitetura.md`, seções 5 e 7).

## O que faz

| Rota | Quem acessa | Para quê |
|---|---|---|
| `POST /auth/registrar` | pública | cria a loja e o proprietário; devolve o token |
| `POST /auth/login` | pública | devolve o token; `401` neutro em qualquer falha |
| `POST /sync/enviar` | com token | aplica um lote (categorias, fornecedores, produtos, movimentações) numa transação só |
| `GET /sync/baixar?desde=` | com token | devolve tudo da loja alterado depois de `desde` (sem `desde`, tudo) |

Regras aplicadas no lote (`SincronizacaoService`):

- **DA09**: saída além do estoque não é recusada; o saldo fica negativo e nasce um alerta `DIVERGENCIA`.
- **DA10**: a ordem válida é a de chegada ao servidor; `atualizadoEm` do aparelho é só informativo.
- **RN09**: cadastro com `uuid` já existente é sobrescrito; movimentação com `uuid` já existente é ignorada (reenviar o mesmo lote não duplica nada).
- Escopo de loja: toda consulta filtra pela `loja_id` do token. Referência a algo de outra loja ou inexistente, ou `uuid` que já pertence a outra loja, responde `422` e nada é gravado.
- Falha inesperada: `500 { mensagem }` e rollback total; o aparelho reenvia.

Limite conhecido: o corte de download é `instanteServidor` do último envio. Dois aparelhos sincronizando no mesmo segundo podem precisar de uma segunda sincronização para se verem.

## Rodar no computador

Pré-requisitos: Java 21 e PostgreSQL 16 locais. O Maven vem com o projeto (`./mvnw`).

```bash
psql -U postgres -h localhost -c "CREATE DATABASE stockeasy_db;"
cp .env.example .env             # preencha DB_PASSWORD e JWT_SECRET
set -a; source .env; set +a
./mvnw spring-boot:run           # sobe em http://localhost:8080 e aplica as migrações
```

Sem `JWT_SECRET` o servidor não sobe, de propósito. Um segredo padrão escrito no código ficaria público no repositório e permitiria forjar o token de qualquer loja.

Para o emulador Android enxergar o servidor local: `adb reverse tcp:8080 tcp:8080` e `URL_API=http://localhost:8080` no aplicativo.

## Testar os 4 endpoints com `curl`

Os comandos rodam em sequência no terminal (no Windows, pelo Git Bash). Troque `API` pelo endereço do Render para testar a hospedagem. Os `uuid` do exemplo são fixos: num servidor já usado por outra pessoa, troque o e-mail e os `uuid` (o comando `uuidgen` gera um novo).

```bash
API=http://localhost:8080

# 1. Registrar: cria a loja e o proprietário (201). O mesmo e-mail de novo dá 409.
curl -s -w '\n%{http_code}\n' $API/auth/registrar -H 'Content-Type: application/json' \
  -d '{"nomeLoja":"Mercadinho Teste","nome":"Dona Teste","email":"teste@exemplo.com","senha":"segredo1"}'

# 2. Login (200), guardando o token para os próximos comandos. Senha errada dá 401.
TOKEN=$(curl -s $API/auth/login -H 'Content-Type: application/json' \
  -d '{"email":"teste@exemplo.com","senha":"segredo1"}' | sed -E 's/.*"token":"([^"]+)".*/\1/')

# 3. Enviar um lote: uma categoria, um produto, 3 entradas e 5 saídas. O saldo
#    fica -2 e a resposta traz a divergência (DA09). Reenviar não duplica nada.
curl -s -w '\n%{http_code}\n' $API/sync/enviar -H "Authorization: Bearer $TOKEN" \
  -H 'Content-Type: application/json' -d '{
  "categorias": [{"uuid":"11111111-1111-1111-1111-111111111111","nome":"Bebidas","ativo":true}],
  "produtos": [{"uuid":"22222222-2222-2222-2222-222222222222","nome":"Refrigerante 2L",
    "codigoBarras":"7894900011517","categoriaUuid":"11111111-1111-1111-1111-111111111111",
    "precoCusto":5.5,"precoVenda":9.9,"estoqueMinimo":2,"ativo":true}],
  "movimentacoes": [
    {"uuid":"33333333-3333-3333-3333-333333333331","produtoUuid":"22222222-2222-2222-2222-222222222222",
     "tipo":"COMPRA","quantidade":3,"dataHora":"2026-11-04T20:00:00Z"},
    {"uuid":"33333333-3333-3333-3333-333333333332","produtoUuid":"22222222-2222-2222-2222-222222222222",
     "tipo":"VENDA","quantidade":5,"dataHora":"2026-11-04T20:01:00Z"}]}'

# 4. Baixar tudo da loja do token (200). Com desde, só o que mudou depois do instante.
curl -s -w '\n%{http_code}\n' "$API/sync/baixar" -H "Authorization: Bearer $TOKEN"
curl -s -w '\n%{http_code}\n' "$API/sync/baixar?desde=2030-01-01T00:00:00Z" -H "Authorization: Bearer $TOKEN"

# Sem token, qualquer rota de dados dá 401.
curl -s -o /dev/null -w '%{http_code}\n' "$API/sync/baixar"
```

Respostas de erro, todas no formato `{ "mensagem": "..." }`:

| Código | Quando |
|---|---|
| 400 | corpo com campo faltando ou em formato errado |
| 401 | sem token, token vencido ou credencial errada |
| 409 | e-mail já cadastrado, ou lote que repete código de barras de produto ativo ou nome de categoria |
| 422 | lote que cita item de outra loja ou que não existe; nada do lote é gravado |
| 500 | falha inesperada; nada do lote é gravado e o aparelho reenvia depois |

## Testes

```bash
psql -U postgres -h localhost -c "CREATE DATABASE stockeasy_test;"
./mvnw test
```

Os testes (`SincronizacaoTest`) recriam o banco `stockeasy_test` pelo Flyway a cada caso e cobrem registro, login, token ausente ou inválido, lote com divergência, reenvio idempotente, rollback de lote inválido, código de barras repetido entre ativos e isolamento entre lojas, inclusive o reaproveitamento de `uuid` de outra loja.

## Banco de dados

As migrações ficam em `src/main/resources/db/migration/`:

- `V1__esquema.sql`: cópia de `banco/01-esquema.sql` sem `CREATE DATABASE` e `\c`. **Ao alterar um, alterar o outro** (regra de `banco/README.md`).
- `V2__sincronizacao.sql`: ajustes da sincronização (DA09, alerta `DIVERGENCIA`, `recebido_em` em movimentação, índices de corte).

## Hospedagem de homologação (Render + Neon)

Os dois no plano gratuito, sem cartão. O Render não tem Java nativo, então roda o `Dockerfile` desta pasta: a primeira etapa compila com o `./mvnw`, a segunda leva só o Java de execução e o `.jar`.

1. **Neon (banco):** criar o projeto com PostgreSQL 16, igual ao local, numa região dos Estados Unidos. Em "Connect", desligar o "Connection pooling": o Flyway precisa da conexão direta, cujo endereço não tem `-pooler`. Anotar endereço, banco, usuário e senha.
2. **Render (servidor):** "New Web Service" a partir do repositório no GitHub, no ramo em uso. Root Directory `api`, Language `Docker`, Instance Type `Free`, região próxima à do Neon. Variáveis de ambiente:

   | Variável | Valor |
   |---|---|
   | `DB_URL` | `jdbc:postgresql://<endereço do Neon>/<banco>?sslmode=require` |
   | `DB_USER` | usuário do Neon |
   | `DB_PASSWORD` | senha do Neon |
   | `JWT_SECRET` | saída de `openssl rand -base64 48` |

   A `PORT` é definida pelo próprio Render. Senha e segredo ficam só no painel do Render, nunca no repositório.
3. **Conferir:** no primeiro deploy o Flyway cria as tabelas no Neon. Rodar os comandos `curl` acima com `API=https://<serviço>.onrender.com`.

O plano gratuito hiberna depois de 15 minutos sem acesso e leva cerca de 1 minuto para acordar: abrir o endereço uns 10 minutos antes da demonstração. Se a hospedagem falhar no dia, a reserva é o servidor local com `adb reverse`.

## Estrutura

```
src/main/java/br/pucgoias/stockeasy/
├── StockEasyApplication.java
├── config/      SegurancaConfig (filtro do token), JwtService, TratamentoErros
├── controller/  AutenticacaoController, SincronizacaoController
├── service/     AutenticacaoService, SincronizacaoService
├── dao/         UsuarioDao, SincronizacaoDao (JdbcTemplate, SQL explícito)
└── dto/         AutenticacaoDTO, LoteDTO, RetornoLoteDTO, AlteracoesDTO

Dockerfile        imagem para o Render (compila com ./mvnw, roda só com o JRE)
```
