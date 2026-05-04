package com.br.unifor.usuarios.config;

import org.springframework.amqp.core.*;
import org.springframework.amqp.rabbit.connection.ConnectionFactory;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.amqp.support.converter.MessageConverter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RabbitMQConfig {

    public static final String PRONTUARIO_QUEUE = "usuarios.notification.queue";
    public static final String PRONTUARIO_EXCHANGE = "healthsys_exchange";
    public static final String PRONTUARIO_ROUTING_KEY = "healthsys_routing_key";

    @Bean
    public Queue prontuarioQueue() {
        return new Queue(PRONTUARIO_QUEUE, true);
    }

    @Bean
    public DirectExchange prontuarioExchange() {
        return new DirectExchange(PRONTUARIO_EXCHANGE);
    }

    @Bean
    public Binding prontuarioBinding() {
        return BindingBuilder.bind(prontuarioQueue())
                .to(prontuarioExchange())
                .with(PRONTUARIO_ROUTING_KEY);
    }

    @Bean
    public MessageConverter converter() {
        return new org.springframework.amqp.support.converter.Jackson2JsonMessageConverter();
    }
}
