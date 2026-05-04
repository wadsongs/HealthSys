package br.com.unifor.prontuario.service;

import br.com.unifor.prontuario.exception.ProntuarioNotFoundException;
import br.com.unifor.prontuario.model.*;
import br.com.unifor.prontuario.dto.ProntuarioEvent;
import br.com.unifor.prontuario.mq.ProntuarioEventProducer;
import br.com.unifor.prontuario.repository.ProntuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ProntuarioService {

    private final ProntuarioRepository repository;
    private final ProntuarioEventProducer eventProducer;

    // Criar prontuário (chamado ao cadastrar paciente)
    public ProntuarioModel criar(Long idPaciente) {
        if (repository.existsByIdPaciente(idPaciente)) {
            throw new RuntimeException("Já existe um prontuário para o paciente: " + idPaciente);
        }
        ProntuarioModel prontuario = new ProntuarioModel();
        prontuario.setIdPaciente(idPaciente);
        registrarLog(prontuario, null, "PRONTUARIO_CRIADO");
        return repository.save(prontuario);
    }

    // Buscar prontuário por ID do paciente
    public ProntuarioModel buscarPorIdPaciente(Long idPaciente, Long idUsuario) {
        ProntuarioModel prontuario = buscarOuFalhar(idPaciente);
        registrarLog(prontuario, idUsuario, "VISUALIZOU");
        return repository.save(prontuario);
    }

    // Adicionar consulta
    public ProntuarioModel adicionarConsulta(Long idPaciente, Consulta consulta, Long idUsuario) {
        ProntuarioModel prontuario = buscarOuFalhar(idPaciente);
        prontuario.getConsultas().add(consulta);
        registrarLog(prontuario, idUsuario, "ADICIONOU_CONSULTA");
        ProntuarioModel salvo = repository.save(prontuario);

        // Enviar evento de triagem
        String tipoEvento = "EMERGENCIA".equalsIgnoreCase(consulta.getTipoAtendimento()) ? "TRIAGEM_URGENTE" : "TRIAGEM_CRIADA";
        
        eventProducer.sendProntuarioEvent(ProntuarioEvent.builder()
                .idPaciente(idPaciente)
                .tipoEvento(tipoEvento)
                .descricao(tipoEvento.equals("TRIAGEM_URGENTE") ? "Triagem urgente detectada!" : "Nova triagem criada")
                .dataEvento(LocalDateTime.now())
                .idUsuario(idUsuario)
                .build());

        return salvo;
    }

    // Adicionar exame — RF03
    public ProntuarioModel adicionarExame(Long idPaciente, Exame exame, Long idUsuario) {
        ProntuarioModel prontuario = buscarOuFalhar(idPaciente);
        prontuario.getExames().add(exame);
        registrarLog(prontuario, idUsuario, "ADICIONOU_EXAME");
        return repository.save(prontuario);
    }

    // Adicionar medicamento
    public ProntuarioModel adicionarMedicamento(Long idPaciente, Medicamento medicamento, Long idUsuario) {
        ProntuarioModel prontuario = buscarOuFalhar(idPaciente);
        prontuario.getMedicamentos().add(medicamento);
        registrarLog(prontuario, idUsuario, "ADICIONOU_MEDICAMENTO");
        return repository.save(prontuario);
    }

    // Atualizar alergias
    public ProntuarioModel atualizarAlergias(Long idPaciente, List<String> alergias, Long idUsuario) {
        ProntuarioModel prontuario = buscarOuFalhar(idPaciente);
        prontuario.setAlergias(alergias);
        registrarLog(prontuario, idUsuario, "ATUALIZOU_ALERGIAS");
        ProntuarioModel salvo = repository.save(prontuario);

        ProntuarioEvent event = ProntuarioEvent.builder()
                .idPaciente(idPaciente)
                .tipoEvento("ALERGIAS_ATUALIZADAS")
                .descricao("Alergias atualizadas")
                .alergias(alergias)
                .dataEvento(LocalDateTime.now())
                .idUsuario(idUsuario)
                .build();
        eventProducer.sendProntuarioEvent(event);

        return salvo;
    }

    // Buscar logs de auditoria
    public List<LogAuditoria> buscarLogs(Long idPaciente) {
        return buscarOuFalhar(idPaciente).getLogs();
    }

    private ProntuarioModel buscarOuFalhar(Long idPaciente) {
        return repository.findByIdPaciente(idPaciente)
                .orElseThrow(() -> new ProntuarioNotFoundException(idPaciente));
    }

    // registra toda ação no prontuário
    private void registrarLog(ProntuarioModel prontuario, Long idUsuario, String acao) {
        prontuario.getLogs().add(new LogAuditoria(idUsuario, acao, LocalDateTime.now()));
    }
}
