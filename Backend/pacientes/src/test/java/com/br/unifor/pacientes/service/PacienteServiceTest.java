package com.br.unifor.pacientes.service;

import com.br.unifor.pacientes.dto.PacienteResponseDTO;
import com.br.unifor.pacientes.exception.PacienteNotFoundException;
import com.br.unifor.pacientes.model.PacienteModel;
import com.br.unifor.pacientes.mq.PacienteEventProducer;
import com.br.unifor.pacientes.repository.PacienteRepository;
import com.br.unifor.pacientes.support.PacienteTestDataFactory;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class PacienteServiceTest {

    @Mock
    private PacienteRepository repository;

    @Mock
    private PacienteEventProducer eventProducer;

    @InjectMocks
    private PacienteService service;

    @Test
    @DisplayName("criar deve salvar o paciente e publicar evento de criação")
    void criarDeveSalvarEPublicarEvento() {
        PacienteModel entrada = PacienteTestDataFactory.pacienteValidoSemId();
        PacienteModel salvo = PacienteTestDataFactory.pacienteValidoComId(1L);

        when(repository.existsByCpf(entrada.getCpf())).thenReturn(false);
        when(repository.save(entrada)).thenReturn(salvo);

        PacienteResponseDTO resultado = service.criar(entrada);

        assertEquals(1L, resultado.getId());
        assertEquals("Ana Silva", resultado.getNome());
        verify(repository).save(entrada);
        verify(eventProducer).sendPacienteCriadoEvent(any());
    }

    @Test
    @DisplayName("criar deve falhar e não publicar evento quando CPF já existe")
    void criarDeveFalharQuandoCpfDuplicado() {
        PacienteModel entrada = PacienteTestDataFactory.pacienteValidoSemId();

        when(repository.existsByCpf(entrada.getCpf())).thenReturn(true);

        assertThrows(RuntimeException.class, () -> service.criar(entrada));

        verify(repository, never()).save(any());
        verify(eventProducer, never()).sendPacienteCriadoEvent(any());
    }

    @Test
    @DisplayName("listarTodos deve retornar página mapeada para DTO")
    void listarTodosDeveRetornarPagina() {
        Pageable pageable = PageRequest.of(0, 10);
        when(repository.findAll(pageable))
                .thenReturn(new PageImpl<>(List.of(PacienteTestDataFactory.pacienteValidoComId(1L))));

        Page<PacienteResponseDTO> resultado = service.listarTodos(pageable);

        assertEquals(1, resultado.getContent().size());
        assertEquals(1L, resultado.getContent().get(0).getId());
        verify(repository).findAll(pageable);
    }

    @Test
    @DisplayName("buscarPorId deve retornar DTO quando encontrado")
    void buscarPorIdDeveRetornarDto() {
        when(repository.findById(1L))
                .thenReturn(Optional.of(PacienteTestDataFactory.pacienteValidoComId(1L)));

        PacienteResponseDTO resultado = service.buscarPorId(1L);

        assertEquals("Ana Silva", resultado.getNome());
        verify(repository).findById(1L);
    }

    @Test
    @DisplayName("buscarPorId deve lançar PacienteNotFoundException quando ausente")
    void buscarPorIdDeveLancarQuandoAusente() {
        when(repository.findById(999L)).thenReturn(Optional.empty());

        assertThrows(PacienteNotFoundException.class, () -> service.buscarPorId(999L));
    }

    @Test
    @DisplayName("deletar deve delegar para repository.deleteById quando o paciente existe")
    void deletarDeveDelegarParaRepository() {
        when(repository.findById(1L))
                .thenReturn(Optional.of(PacienteTestDataFactory.pacienteValidoComId(1L)));

        service.deletar(1L);

        verify(repository).deleteById(1L);
    }
}
