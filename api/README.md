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
- Escopo de loja: toda consulta filtra pela `loja_id` do token. Referência a algo de outra loja ou inexistente responde `422` e nada é gravado.
- Falha inesperada: `500 { mensagem }` e rollback total; o aparelho reenvia.

Limite conhecido: o corte de download é `instanteServidor` do último envio. Dois aparelhos sincronizando no mesmo segundo podem precisar de uma segunda sincronização para se verem.

## Rodar no computador

Pré-requisitos: Java 21 e PostgreSQL 16 locais. O Maven vem com o projeto (`./mvnw`).

```bash
psql -U postgres -h localhost -c "CREATE DATABASE stockeasy_db;"
cp .env.example .env            # ajuste DB_PASSWORD e JWT_SECRET
set -a; source .env; set +a
./mvnw spring-boot:run           # sobe em http://localhost:8080 e aplica as migrações
```

Para o emulador Android enxergar o servidor local: `adb reverse tcp:8080 tcp:8080` e `URL_API=http://localhost:8080` no aplicativo.

## Testes

```bash
psql -U postgres -h localhost -c "CREATE DATABASE stockeasy_test;"
./mvnw test
```

Os testes (`SincronizacaoTest`) recriam o banco `stockeasy_test` pelo Flyway a cada caso e cobrem registro, login, token ausente ou inválido, lote com divergência, reenvio idempotente, rollback de lote inválido e isolamento entre lojas.

## Banco de dados

As migrações ficam em `src/main/resources/db/migration/`:

- `V1__esquema.sql`: cópia de `banco/01-esquema.sql` sem `CREATE DATABASE` e `\c`. **Ao alterar um, alterar o outro** (regra de `banco/README.md`).
- `V2__sincronizacao.sql`: ajustes da sincronização (DA09, alerta `DIVERGENCIA`, `recebido_em` em movimentação, índices de corte).

## Hospedagem de homologação

Render (serviço web) com PostgreSQL no Neon, ambos no plano gratuito. Variáveis de ambiente no Render: `DB_URL`, `DB_USER`, `DB_PASSWORD`, `JWT_SECRET`, `PORT` (o Render define). O endereço público fica registrado em `docs/06-plano-de-testes.md` quando publicado.

## Estrutura

```
src/main/java/br/pucgoias/stockeasy/
├── StockEasyApplication.java
├── config/      SegurancaConfig (filtro do token), JwtService, TratamentoErros
├── controller/  AutenticacaoController, SincronizacaoController
├── service/     AutenticacaoService, SincronizacaoService
├── dao/         UsuarioDao, SincronizacaoDao (JdbcTemplate, SQL explícito)
└── dto/         AutenticacaoDTO, LoteDTO, RetornoLoteDTO, AlteracoesDTO
```
