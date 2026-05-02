package com.br.unifor.usuarios.mq;

import com.br.unifor.usuarios.dto.ProntuarioEvent;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Service;

@Slf4j
@Service
public class NotificationConsumer {

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
        
        log.info("==================================");
    }
}
