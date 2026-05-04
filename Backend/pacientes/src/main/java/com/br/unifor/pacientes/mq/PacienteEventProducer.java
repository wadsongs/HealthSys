package com.br.unifor.pacientes.mq;

import com.br.unifor.pacientes.dto.ProntuarioEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class PacienteEventProducer {

    private final RabbitTemplate rabbitTemplate;

    @Value("${rabbitmq.exchange.name:healthsys_exchange}")
    private String exchange;

    @Value("${rabbitmq.routing.key:healthsys_routing_key}")
    private String routingKey;

    public void sendPacienteCriadoEvent(ProntuarioEvent event) {
        log.info("Enviando evento de novo paciente: {}", event.getIdPaciente());
        rabbitTemplate.convertAndSend(exchange, routingKey, event);
    }
}
