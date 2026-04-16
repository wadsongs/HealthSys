package br.com.unifor.prontuario.config;

import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.OpenAPI;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class SwaggerConfig {

    @Bean
    public OpenAPI openAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("Prontuário Service - HealthSys")
                        .description("API de gerenciamento de prontuários eletrônicos")
                        .version("1.0")
                        .contact(new Contact()
                                .name("UNIFOR")
                                .email("healthsys@unifor.br")));
    }
}
