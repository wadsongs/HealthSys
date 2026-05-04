package com.br.unifor.usuarios.mq;

import com.br.unifor.usuarios.dto.ProntuarioEvent;
import com.br.unifor.usuarios.dto.RealtimeNotificationDto;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class NotificationConsumer {

    private static final String TOPIC_NOTIFICATIONS = "/topic/notifications";

    private final SimpMessagingTemplate messagingTemplate;

    @RabbitListener(queues = "usuarios.notification.queue")
    public void consumeNotification(ProntuarioEvent event) {
        log.info("=== [SERVIÇO DE NOTIFICAÇÕES] ===");
        
        String tipo = event.getTipoEvento();
        
        switch (tipo) {
            case "PACIENTE_CRIADO":
                log.info("🔔 NOTIFICAÇÃO: Paciente atualizado (Novo cadastro)");
                log.info("Mensagem: {}", event.getDescricao());
                break;
            case "TRIAGEM_CRIADA":
                log.info("🔔 NOTIFICAÇÃO: Triagem criada");
                log.info("Paciente ID: {}", event.getIdPaciente());
                break;
            case "TRIAGEM_URGENTE":
                log.info("🚨 ALERTA: Triagem urgente!");
                log.info("Paciente ID: {} precisa de atendimento imediato!", event.getIdPaciente());
                break;
            case "ALERGIAS_ATUALIZADAS":
                log.info("🔔 NOTIFICAÇÃO: Paciente atualizado (Alergias)");
                log.info("Paciente ID: {} teve suas alergias alteradas.", event.getIdPaciente());
                break;
            default:
                log.info("🔔 NOTIFICAÇÃO: Evento recebido: {}", tipo);
        }

        RealtimeNotificationDto push = RealtimeNotificationDto.builder()
                .id(UUID.randomUUID().toString())
                .tipoEvento(event.getTipoEvento())
                .descricao(event.getDescricao())
                .idPaciente(event.getIdPaciente())
                .dataEvento(event.getDataEvento() != null ? event.getDataEvento().toString() : null)
                .build();
        messagingTemplate.convertAndSend(TOPIC_NOTIFICATIONS, push);
        
        log.info("==================================");
    }
}
