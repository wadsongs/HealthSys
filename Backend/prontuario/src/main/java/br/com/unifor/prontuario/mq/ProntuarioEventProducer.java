package br.com.unifor.prontuario.mq;

import br.com.unifor.prontuario.config.RabbitMQConfig;
import br.com.unifor.prontuario.dto.ProntuarioEvent;
import lombok.RequiredArgsConstructor;
import org.springframework.amqp.core.AmqpTemplate;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class ProntuarioEventProducer {

    private final AmqpTemplate amqpTemplate;

    public void sendProntuarioEvent(ProntuarioEvent event) {
        amqpTemplate.convertAndSend(
                RabbitMQConfig.PRONTUARIO_EXCHANGE,
                RabbitMQConfig.PRONTUARIO_ROUTING_KEY,
                event
        );
    }
}
