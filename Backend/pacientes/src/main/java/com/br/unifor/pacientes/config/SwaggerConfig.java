package com.br.unifor.pacientes.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class SwaggerConfig {

    @Bean
    public OpenAPI openAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("Pacientes Service - HealthSys")
                        .description("API de gerenciamento de pacientes")
                        .version("1.0")
                        .contact(new Contact()
                                .name("UNIFOR")
                                .email("healthsys@unifor.br")));
    }
}