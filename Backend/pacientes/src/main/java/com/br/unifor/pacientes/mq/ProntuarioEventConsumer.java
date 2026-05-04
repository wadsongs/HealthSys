package com.br.unifor.pacientes.mq;

import com.br.unifor.pacientes.config.RabbitMQConfig;
import com.br.unifor.pacientes.dto.ProntuarioEvent;
import com.br.unifor.pacientes.model.PacienteModel;
import com.br.unifor.pacientes.repository.PacienteRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class ProntuarioEventConsumer {

    private final PacienteRepository repository;

    @RabbitListener(queues = RabbitMQConfig.PRONTUARIO_QUEUE)
    public void handleProntuarioEvent(ProntuarioEvent event) {
        log.info("Recebido evento do prontuário: {}", event.getTipoEvento());

        if ("ALERGIAS_ATUALIZADAS".equals(event.getTipoEvento())) {
            try {
                PacienteModel paciente = repository.findById(event.getIdPaciente())
                        .orElseThrow(() -> new RuntimeException("Paciente não encontrado: " + event.getIdPaciente()));

                paciente.setAlergias(event.getAlergias());
                repository.save(paciente);

                log.info("Alergias atualizadas para paciente ID: {}", event.getIdPaciente());
            } catch (Exception e) {
                log.error("Erro ao processar evento de alergias: {}", e.getMessage());
            }
        }
    }
}
