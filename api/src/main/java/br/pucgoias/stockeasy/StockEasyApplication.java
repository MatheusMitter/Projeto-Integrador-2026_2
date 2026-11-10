package br.pucgoias.stockeasy;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * Retaguarda do StockEasy: autenticação e sincronização
 * (docs/03-arquitetura.md, seções 5 e 5.1).
 */
@SpringBootApplication
public class StockEasyApplication {

    public static void main(String[] args) {
        SpringApplication.run(StockEasyApplication.class, args);
    }
}
