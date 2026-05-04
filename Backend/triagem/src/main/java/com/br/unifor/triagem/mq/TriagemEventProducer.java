package com.br.unifor.triagem.mq;

import com.br.unifor.triagem.config.RabbitMQConfig;
import com.br.unifor.triagem.dto.ProntuarioEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class TriagemEventProducer {

    private final RabbitTemplate rabbitTemplate;

    @Value("${rabbitmq.exchange.name:healthsys_exchange}")
    private String exchange;

    @Value("${rabbitmq.routing.key:healthsys_routing_key}")
    private String routingKey;

    public void sendTriagemEvent(ProntuarioEvent event) {
        log.info("Enviando evento de triagem: {} pacienteId={}", event.getTipoEvento(), event.getIdPaciente());
        rabbitTemplate.convertAndSend(
                exchange != null ? exchange : RabbitMQConfig.HEALTHSYS_EXCHANGE,
                routingKey != null ? routingKey : RabbitMQConfig.HEALTHSYS_ROUTING_KEY,
                event
        );
    }
}
