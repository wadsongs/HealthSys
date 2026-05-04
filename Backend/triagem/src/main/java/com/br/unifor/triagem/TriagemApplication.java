package com.br.unifor.triagem;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

import java.util.TimeZone;

@SpringBootApplication
public class TriagemApplication {

    static {
        TimeZone.setDefault(TimeZone.getTimeZone("America/Sao_Paulo"));
    }

    public static void main(String[] args) {
        SpringApplication.run(TriagemApplication.class, args);
    }
}
