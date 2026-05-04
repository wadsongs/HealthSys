package com.br.unifor.triagem.config;

import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.amqp.support.converter.MessageConverter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RabbitMQConfig {

    public static final String HEALTHSYS_EXCHANGE = "healthsys_exchange";
    public static final String HEALTHSYS_ROUTING_KEY = "healthsys_routing_key";

    @Bean
    public MessageConverter messageConverter() {
        return new Jackson2JsonMessageConverter();
    }
}
