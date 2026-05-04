package com.br.unifor.triagem.service;

import com.br.unifor.triagem.dto.TriagemRequest;
import com.br.unifor.triagem.dto.TriagemResponse;
import com.br.unifor.triagem.exception.TriagemNotFoundException;
import com.br.unifor.triagem.model.TriagemModel;
import com.br.unifor.triagem.model.enums.NivelRisco;
import com.br.unifor.triagem.model.enums.StatusTriagem;
import com.br.unifor.triagem.mq.TriagemEventProducer;
import com.br.unifor.triagem.dto.ProntuarioEvent;
import com.br.unifor.triagem.repository.TriagemRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class TriagemService {

    private final TriagemRepository repository;
    private final TriagemEventProducer triagemEventProducer;

    public TriagemResponse criar(TriagemRequest request) {
        TriagemModel triagem = TriagemModel.builder()
                .pacienteId(request.getPacienteId())
                .nomePaciente(request.getNomePaciente())
                .nivelRisco(request.getNivelRisco())
                .status(StatusTriagem.AGUARDANDO)
                .sintomas(request.getSintomas())
                .observacoes(request.getObservacoes())
                .dataHoraEntrada(LocalDateTime.now())
                .build();
        TriagemModel salvo = repository.save(triagem);

        String tipo = (salvo.getNivelRisco() == NivelRisco.VERMELHO
                || salvo.getNivelRisco() == NivelRisco.LARANJA)
                ? "TRIAGEM_URGENTE"
                : "TRIAGEM_CRIADA";
        triagemEventProducer.sendTriagemEvent(ProntuarioEvent.builder()
                .idPaciente(salvo.getPacienteId())
                .tipoEvento(tipo)
                .descricao("Triagem registrada: " + salvo.getNomePaciente()
                        + " (" + salvo.getNivelRisco() + ")")
                .dataEvento(LocalDateTime.now())
                .build());

        return toResponse(salvo);
    }

    public Page<TriagemResponse> listarTodos(Pageable pageable) {
        return repository.findAll(pageable).map(this::toResponse);
    }

    public TriagemResponse buscarPorId(Long id) {
        return toResponse(buscarOuFalhar(id));
    }

    public List<TriagemResponse> listarPorPaciente(Long pacienteId) {
        return repository.findByPacienteId(pacienteId)
                .stream().map(this::toResponse).toList();
    }

    public List<TriagemResponse> listarPorStatus(StatusTriagem status) {
        return repository.findByStatus(status)
                .stream().map(this::toResponse).toList();
    }

    public TriagemResponse atualizar(Long id, TriagemRequest request) {
        TriagemModel triagem = buscarOuFalhar(id);

        triagem.setNivelRisco(request.getNivelRisco());
        triagem.setSintomas(request.getSintomas());
        triagem.setObservacoes(request.getObservacoes());

        if (request.getStatus() != null && request.getStatus() != triagem.getStatus()) {
            if (request.getStatus() == StatusTriagem.EM_ATENDIMENTO
                    && triagem.getDataHoraAtendimento() == null) {
                triagem.setDataHoraAtendimento(LocalDateTime.now());
            }
            triagem.setStatus(request.getStatus());
        }

        return toResponse(repository.save(triagem));
    }

    public TriagemResponse atualizarStatus(Long id, StatusTriagem novoStatus) {
        TriagemModel triagem = buscarOuFalhar(id);

        if (novoStatus == StatusTriagem.EM_ATENDIMENTO
                && triagem.getDataHoraAtendimento() == null) {
            triagem.setDataHoraAtendimento(LocalDateTime.now());
        }
        triagem.setStatus(novoStatus);

        return toResponse(repository.save(triagem));
    }

    public void deletar(Long id) {
        buscarOuFalhar(id);
        repository.deleteById(id);
    }

    private TriagemModel buscarOuFalhar(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new TriagemNotFoundException(id));
    }

    private TriagemResponse toResponse(TriagemModel model) {
        return TriagemResponse.builder()
                .id(model.getId())
                .pacienteId(model.getPacienteId())
                .nomePaciente(model.getNomePaciente())
                .nivelRisco(model.getNivelRisco())
                .descricaoRisco(model.getNivelRisco().getDescricao())
                .status(model.getStatus())
                .sintomas(model.getSintomas())
                .observacoes(model.getObservacoes())
                .dataHoraEntrada(model.getDataHoraEntrada())
                .dataHoraAtendimento(model.getDataHoraAtendimento())
                .dataCadastro(model.getDataCadastro())
                .build();
    }
}
