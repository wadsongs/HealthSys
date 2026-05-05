package com.br.unifor.triagem.service;

import com.br.unifor.triagem.dto.TriagemRequest;
import com.br.unifor.triagem.dto.TriagemResponse;
import com.br.unifor.triagem.exception.TriagemNotFoundException;
import com.br.unifor.triagem.model.TriagemModel;
import com.br.unifor.triagem.model.enums.NivelRisco;
import com.br.unifor.triagem.model.enums.StatusTriagem;
import com.br.unifor.triagem.mq.TriagemEventProducer;
import com.br.unifor.triagem.repository.TriagemRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class TriagemServiceTest {

    @Mock
    private TriagemRepository repository;

    @Mock
    private TriagemEventProducer triagemEventProducer;

    @InjectMocks
    private TriagemService service;

    private TriagemModel triagemSalva;
    private TriagemRequest request;

    @BeforeEach
    void setUp() {
        triagemSalva = TriagemModel.builder()
                .id(1L)
                .pacienteId(10L)
                .nomePaciente("Maria Santos")
                .nivelRisco(NivelRisco.AMARELO)
                .status(StatusTriagem.AGUARDANDO)
                .sintomas("Febre alta e dor de cabeça")
                .dataHoraEntrada(LocalDateTime.now())
                .build();

        request = new TriagemRequest();
        request.setPacienteId(10L);
        request.setNomePaciente("Maria Santos");
        request.setNivelRisco(NivelRisco.AMARELO);
        request.setSintomas("Febre alta e dor de cabeça");
    }

    @Test
    @DisplayName("Deve criar triagem com status AGUARDANDO e data de entrada preenchida")
    void criar_deveCriarComStatusAguardandoEDataEntrada() {
        when(repository.save(any())).thenReturn(triagemSalva);

        TriagemResponse response = service.criar(request);

        assertThat(response.getStatus()).isEqualTo(StatusTriagem.AGUARDANDO);
        assertThat(response.getPacienteId()).isEqualTo(10L);
        verify(repository).save(argThat(t ->
                t.getStatus() == StatusTriagem.AGUARDANDO &&
                t.getDataHoraEntrada() != null));
    }

    @Test
    @DisplayName("Deve retornar triagem ao buscar por ID existente")
    void buscarPorId_deveRetornarTriagem_quandoEncontrado() {
        when(repository.findById(1L)).thenReturn(Optional.of(triagemSalva));

        TriagemResponse response = service.buscarPorId(1L);

        assertThat(response.getId()).isEqualTo(1L);
        assertThat(response.getNomePaciente()).isEqualTo("Maria Santos");
        assertThat(response.getDescricaoRisco()).isEqualTo(NivelRisco.AMARELO.getDescricao());
    }

    @Test
    @DisplayName("Deve lançar TriagemNotFoundException para ID inexistente")
    void buscarPorId_deveLancarException_quandoNaoEncontrado() {
        when(repository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.buscarPorId(99L))
                .isInstanceOf(TriagemNotFoundException.class)
                .hasMessageContaining("99");
    }

    @Test
    @DisplayName("Deve setar dataHoraAtendimento ao mudar status para EM_ATENDIMENTO")
    void atualizarStatus_deveSetarDataAtendimento_quandoEmAtendimento() {
        when(repository.findById(1L)).thenReturn(Optional.of(triagemSalva));
        when(repository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        TriagemResponse response = service.atualizarStatus(1L, StatusTriagem.EM_ATENDIMENTO);

        assertThat(response.getStatus()).isEqualTo(StatusTriagem.EM_ATENDIMENTO);
        assertThat(response.getDataHoraAtendimento()).isNotNull();
    }

    @Test
    @DisplayName("Não deve sobrescrever dataHoraAtendimento em mudanças de status subsequentes")
    void atualizarStatus_naoDeveResetarDataAtendimento_quandoJaPreenchida() {
        LocalDateTime dataOriginal = LocalDateTime.now().minusMinutes(30);
        triagemSalva.setStatus(StatusTriagem.EM_ATENDIMENTO);
        triagemSalva.setDataHoraAtendimento(dataOriginal);

        when(repository.findById(1L)).thenReturn(Optional.of(triagemSalva));
        when(repository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        TriagemResponse response = service.atualizarStatus(1L, StatusTriagem.FINALIZADO);

        assertThat(response.getDataHoraAtendimento()).isEqualTo(dataOriginal);
    }

    @Test
    @DisplayName("Deve listar triagens de um paciente")
    void listarPorPaciente_deveRetornarListaDoPaciente() {
        when(repository.findByPacienteId(10L)).thenReturn(List.of(triagemSalva));

        List<TriagemResponse> responses = service.listarPorPaciente(10L);

        assertThat(responses).hasSize(1);
        assertThat(responses.get(0).getPacienteId()).isEqualTo(10L);
    }

    @Test
    @DisplayName("Deve listar triagens filtradas por status")
    void listarPorStatus_deveRetornarListaFiltrada() {
        when(repository.findByStatus(StatusTriagem.AGUARDANDO)).thenReturn(List.of(triagemSalva));

        List<TriagemResponse> responses = service.listarPorStatus(StatusTriagem.AGUARDANDO);

        assertThat(responses).hasSize(1);
        assertThat(responses.get(0).getStatus()).isEqualTo(StatusTriagem.AGUARDANDO);
    }

    @Test
    @DisplayName("Deve deletar triagem por ID")
    void deletar_deveChamarDeleteById() {
        when(repository.findById(1L)).thenReturn(Optional.of(triagemSalva));

        service.deletar(1L);

        verify(repository).deleteById(1L);
    }

    @Test
    @DisplayName("Deve lançar exception ao deletar triagem inexistente")
    void deletar_deveLancarException_quandoNaoEncontrado() {
        when(repository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.deletar(99L))
                .isInstanceOf(TriagemNotFoundException.class);
    }

    @Test
    @DisplayName("Deve retornar página de triagens")
    void listarTodos_deveRetornarPagina() {
        var pageable = PageRequest.of(0, 10);
        when(repository.findAll(pageable))
                .thenReturn(new PageImpl<>(List.of(triagemSalva)));

        var page = service.listarTodos(pageable);

        assertThat(page.getContent()).hasSize(1);
        assertThat(page.getContent().get(0).getNivelRisco()).isEqualTo(NivelRisco.AMARELO);
    }
}
