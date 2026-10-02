# Banco de dados

Scripts SQL executáveis do banco remoto, em PostgreSQL. Requer PostgreSQL 14 ou superior; a validação dos scripts foi feita em PostgreSQL 16.

## Execução

Na ordem, a partir da raiz do repositório:

```bash
psql -U postgres -f banco/01-esquema.sql
psql -U postgres -d stockeasy_db -f banco/02-carga-exemplo.sql
psql -U postgres -d stockeasy_db -f banco/03-consultas.sql
```

O primeiro script cria o banco `stockeasy_db` e conecta nele, então não precisa de `-d`. Os outros dois rodam dentro do banco já criado.

## Os arquivos

| Arquivo                                        | O que faz                                                             |
| ---------------------------------------------- | --------------------------------------------------------------------- |
| [`01-esquema.sql`](01-esquema.sql)             | Cria o banco, as 7 tabelas, os índices, as funções e os gatilhos      |
| [`02-carga-exemplo.sql`](02-carga-exemplo.sql) | Insere loja, usuários, categorias, fornecedores e produtos de exemplo |
| [`03-consultas.sql`](03-consultas.sql)         | As 6 consultas que sustentam os indicadores e relatórios              |

## Resultado esperado da carga

Depois de rodar `02-carga-exemplo.sql`:

| Produto                  | Saldo | Mínimo | Situação |
| ------------------------ | ----- | ------ | -------- |
| Arroz Tipo 1 5kg         | 67    | 10     | normal   |
| Feijão Preto 1kg         | 25    | 15     | normal   |
| Refrigerante Cola 2L     | 5     | 20     | crítico  |
| Detergente Líquido 500ml | 40    | 10     | normal   |
| Sabonete 90g             | 8     | 15     | crítico  |

Mais 11 movimentações e 2 alertas. Os alertas não são inseridos pela carga: são criados pelo gatilho `trigger_estoque_critico`, e é essa a forma de verificar que o gatilho funciona.

Os produtos entram com saldo zero e o estoque é construído pelas movimentações, como a aplicação opera. Inserir o saldo final direto produziria um histórico que não fecha com o saldo.

## Relação com os outros artefatos

Estes scripts são a versão executável do modelo descrito em [`../docs/02-modelagem-de-dados.md`](../docs/02-modelagem-de-dados.md), que traz o diagrama, a justificativa de cada decisão e a análise de normalização. **Ao alterar um, alterar o outro.**

O aplicativo móvel **não usa este banco.** Ele cria o próprio esquema em SQLite na primeira execução, definido em [`../app/src/database/esquema.ts`](../app/src/database/esquema.ts). O PostgreSQL entra no Ciclo 3, com a retaguarda em Spring Boot.

As diferenças entre os dois esquemas estão registradas na seção de persistência local do `docs/02`.

## Marcadores de parâmetro

As consultas 5 e 6 recebem parâmetro. No `docs/02` eles aparecem como `?`, que é o marcador do JDBC e é o que o DAO vai usar. Aqui entram como variável do psql (`\set`), porque `?` não é sintaxe válida para execução direta e o objetivo destes arquivos é rodar sem edição.
