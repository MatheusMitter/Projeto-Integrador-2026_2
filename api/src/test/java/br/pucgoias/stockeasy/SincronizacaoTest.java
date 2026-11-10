package br.pucgoias.stockeasy;

import static org.hamcrest.Matchers.containsString;
import static org.hamcrest.Matchers.hasSize;
import static org.hamcrest.Matchers.is;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.flywaydb.core.Flyway;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

/**
 * Testes de integração contra o banco stockeasy_test (AC6a.1 a AC6a.6).
 * O banco é recriado pelo Flyway antes de cada teste.
 */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class SincronizacaoTest {

    static final String C = "11111111-1111-1111-1111-111111111111";
    static final String P = "22222222-2222-2222-2222-222222222222";
    static final String M1 = "33333333-3333-3333-3333-333333333331";
    static final String M2 = "33333333-3333-3333-3333-333333333332";

    @Autowired MockMvc mvc;
    @Autowired Flyway flyway;
    @Autowired ObjectMapper json;

    @BeforeEach
    void limparBanco() {
        flyway.clean();
        flyway.migrate();
    }

    @Test
    void registraLojaEntraERecusaEmailRepetido() throws Exception {
        String token = registrar("dona@exemplo.com");
        org.junit.jupiter.api.Assertions.assertFalse(token.isBlank());

        mvc.perform(post("/auth/registrar").contentType(MediaType.APPLICATION_JSON)
                        .content(registro("dona@exemplo.com")))
                .andExpect(status().isConflict());

        mvc.perform(post("/auth/login").contentType(MediaType.APPLICATION_JSON)
                        .content("{\"email\":\"dona@exemplo.com\",\"senha\":\"segredo1\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.usuario.perfil", is("PROPRIETARIO")));

        mvc.perform(post("/auth/login").contentType(MediaType.APPLICATION_JSON)
                        .content("{\"email\":\"dona@exemplo.com\",\"senha\":\"errada\"}"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.mensagem", is("E-mail ou senha inválidos.")));
    }

    @Test
    void recusaSemTokenEComTokenInvalido() throws Exception {
        mvc.perform(get("/sync/baixar")).andExpect(status().isUnauthorized());
        mvc.perform(get("/sync/baixar").header("Authorization", "Bearer abc.def.ghi"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void aplicaLoteRegistraDivergenciaEIgnoraReenvio() throws Exception {
        String token = registrar("dona@exemplo.com");

        // 3 entradas e 5 saídas: saldo -2, divergência registrada, nada recusado (DA09)
        mvc.perform(post("/sync/enviar").header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON).content(lote()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.aceitos.movimentacoes", hasSize(2)))
                .andExpect(jsonPath("$.divergencias", hasSize(1)))
                .andExpect(jsonPath("$.divergencias[0].saldo", is(-2)));

        // mesmo lote de novo: movimentações ignoradas, saldo não muda (idempotente)
        mvc.perform(post("/sync/enviar").header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON).content(lote()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.divergencias", hasSize(0)));

        mvc.perform(get("/sync/baixar").header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.produtos[0].estoqueAtual", is(-2)))
                .andExpect(jsonPath("$.movimentacoes", hasSize(2)))
                .andExpect(jsonPath("$.alertas[?(@.tipoAlerta == 'DIVERGENCIA')]", hasSize(1)));

        mvc.perform(get("/sync/baixar").param("desde", "2030-01-01T00:00:00Z")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.produtos", hasSize(0)));
    }

    @Test
    void loteComReferenciaInvalidaNaoGravaNada() throws Exception {
        String token = registrar("dona@exemplo.com");
        String lote = "{\"categorias\":[{\"uuid\":\"" + C + "\",\"nome\":\"Bebidas\",\"ativo\":true}],"
                + "\"produtos\":[{\"uuid\":\"" + P + "\",\"nome\":\"X\",\"categoriaUuid\":"
                + "\"99999999-9999-9999-9999-999999999999\",\"precoCusto\":1,\"precoVenda\":2,"
                + "\"estoqueMinimo\":0,\"ativo\":true}]}";
        mvc.perform(post("/sync/enviar").header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON).content(lote))
                .andExpect(status().isUnprocessableEntity());
        // rollback total: nem a categoria válida do mesmo lote ficou gravada
        mvc.perform(get("/sync/baixar").header("Authorization", "Bearer " + token))
                .andExpect(jsonPath("$.categorias", hasSize(0)));
    }

    @Test
    void umaLojaNaoEnxergaNemAlteraOutra() throws Exception {
        String tokenA = registrar("a@exemplo.com");
        String tokenB = registrar("b@exemplo.com");
        mvc.perform(post("/sync/enviar").header("Authorization", "Bearer " + tokenA)
                .contentType(MediaType.APPLICATION_JSON).content(lote())).andExpect(status().isOk());

        mvc.perform(get("/sync/baixar").header("Authorization", "Bearer " + tokenB))
                .andExpect(jsonPath("$.produtos", hasSize(0)))
                .andExpect(jsonPath("$.categorias", hasSize(0)));

        // B tenta movimentar o produto de A pelo uuid: produto desconhecido para a loja B
        String soMov = "{\"movimentacoes\":[{\"uuid\":\"33333333-3333-3333-3333-333333333339\",\"produtoUuid\":\""
                + P + "\",\"tipo\":\"VENDA\",\"quantidade\":1,\"dataHora\":\"2026-11-04T20:00:00Z\"}]}";
        mvc.perform(post("/sync/enviar").header("Authorization", "Bearer " + tokenB)
                        .contentType(MediaType.APPLICATION_JSON).content(soMov))
                .andExpect(status().isUnprocessableEntity());

        // B reaproveita o uuid da categoria de A: recusado, e a categoria de A não muda
        String categoriaDeA = "{\"categorias\":[{\"uuid\":\"" + C + "\",\"nome\":\"Invadida\",\"ativo\":true}]}";
        mvc.perform(post("/sync/enviar").header("Authorization", "Bearer " + tokenB)
                        .contentType(MediaType.APPLICATION_JSON).content(categoriaDeA))
                .andExpect(status().isUnprocessableEntity())
                .andExpect(jsonPath("$.mensagem", containsString("outra loja")));

        // B reaproveita o uuid de uma movimentação de A: recusado, não passa por "já aplicada"
        String movimentacaoDeA = "{\"movimentacoes\":[{\"uuid\":\"" + M1 + "\",\"produtoUuid\":\""
                + P + "\",\"tipo\":\"VENDA\",\"quantidade\":1,\"dataHora\":\"2026-11-04T20:00:00Z\"}]}";
        mvc.perform(post("/sync/enviar").header("Authorization", "Bearer " + tokenB)
                        .contentType(MediaType.APPLICATION_JSON).content(movimentacaoDeA))
                .andExpect(status().isUnprocessableEntity())
                .andExpect(jsonPath("$.mensagem", containsString("outra loja")));

        mvc.perform(get("/sync/baixar").header("Authorization", "Bearer " + tokenA))
                .andExpect(jsonPath("$.categorias[0].nome", is("Bebidas")))
                .andExpect(jsonPath("$.movimentacoes", hasSize(2)));
    }

    @Test
    void codigoDeBarrasRepetidoEntreAtivosDaConflitoENadaGrava() throws Exception {
        String token = registrar("dona@exemplo.com");
        String lote = "{\"categorias\":[{\"uuid\":\"" + C + "\",\"nome\":\"Bebidas\",\"ativo\":true}],"
                + "\"produtos\":[" + produto("22222222-2222-2222-2222-222222222221") + ","
                + produto("22222222-2222-2222-2222-222222222222") + "]}";
        mvc.perform(post("/sync/enviar").header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON).content(lote))
                .andExpect(status().isConflict());
        // rollback total: nem a categoria do mesmo lote ficou
        mvc.perform(get("/sync/baixar").header("Authorization", "Bearer " + token))
                .andExpect(jsonPath("$.categorias", hasSize(0)));
    }

    // ---- apoio ----

    private String registrar(String email) throws Exception {
        MvcResult r = mvc.perform(post("/auth/registrar").contentType(MediaType.APPLICATION_JSON)
                        .content(registro(email)))
                .andExpect(status().isCreated()).andReturn();
        JsonNode corpo = json.readTree(r.getResponse().getContentAsString());
        return corpo.get("token").asText();
    }

    private static String produto(String uuid) {
        return "{\"uuid\":\"" + uuid + "\",\"nome\":\"Refrigerante 2L\",\"codigoBarras\":\"7894900011517\","
                + "\"categoriaUuid\":\"" + C + "\",\"precoCusto\":5.5,\"precoVenda\":9.9,\"estoqueMinimo\":2,\"ativo\":true}";
    }

    private static String registro(String email) {
        return "{\"nomeLoja\":\"Mercadinho\",\"nome\":\"Dona\",\"email\":\"" + email + "\",\"senha\":\"segredo1\"}";
    }

    private static String lote() {
        return "{\"categorias\":[{\"uuid\":\"" + C + "\",\"nome\":\"Bebidas\",\"ativo\":true}],"
                + "\"produtos\":[{\"uuid\":\"" + P + "\",\"nome\":\"Refrigerante 2L\",\"codigoBarras\":\"7894900011517\","
                + "\"categoriaUuid\":\"" + C + "\",\"precoCusto\":5.5,\"precoVenda\":9.9,\"estoqueMinimo\":2,\"ativo\":true}],"
                + "\"movimentacoes\":["
                + "{\"uuid\":\"" + M1 + "\",\"produtoUuid\":\"" + P + "\",\"tipo\":\"COMPRA\",\"quantidade\":3,\"dataHora\":\"2026-11-04T20:00:00Z\"},"
                + "{\"uuid\":\"" + M2 + "\",\"produtoUuid\":\"" + P + "\",\"tipo\":\"VENDA\",\"quantidade\":5,\"dataHora\":\"2026-11-04T20:01:00Z\"}]}";
    }
}
