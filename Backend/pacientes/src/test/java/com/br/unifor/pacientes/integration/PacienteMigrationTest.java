package com.br.unifor.pacientes.integration;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.jdbc.core.JdbcTemplate;

import static org.junit.jupiter.api.Assertions.assertEquals;

@SpringBootTest
class PacienteMigrationTest {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Test
    @DisplayName("Flyway deve criar as tabelas principais do modulo pacientes")
    void deveCriarTabelasPrincipais() {
        assertEquals(1, countTable("paciente"));
        assertEquals(1, countTable("vacina"));
        assertEquals(1, countTable("paciente_alergia"));
    }

    private Integer countTable(String tableName) {
        return jdbcTemplate.queryForObject(
                "select count(*) from information_schema.tables where table_schema = 'public' and table_name = ?",
                Integer.class,
                tableName
        );
    }
}

