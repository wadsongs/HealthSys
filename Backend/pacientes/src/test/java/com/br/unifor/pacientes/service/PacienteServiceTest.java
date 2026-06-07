package com.br.unifor.pacientes.service;

import com.br.unifor.pacientes.dto.PacienteResponseDTO;
import com.br.unifor.pacientes.model.PacienteModel;
import com.br.unifor.pacientes.repository.PacienteRepository;
import com.br.unifor.pacientes.support.PacienteTestDataFactory;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class PacienteServiceTest {

    @Mock
    private PacienteRepository repository;

    @InjectMocks
    private PacienteService service;

    @Test
    @DisplayName("salvar deve delegar para repository.save")
    void salvarDeveDelegarParaRepository() {
        PacienteModel entrada = PacienteTestDataFactory.pacienteValidoSemId();
        PacienteModel salvo = PacienteTestDataFactory.pacienteValidoComId(1L);

        when(repository.save(entrada)).thenReturn(salvo);

        PacienteResponseDTO resultado = service.criar(entrada);

        assertEquals(1L, resultado.getId());
        verify(repository).save(entrada);
    }

    @Test
    @DisplayName("listarTodos deve retornar dados do repository")
    void listarTodosDeveRetornarDados() {
        when(repository.findAll()).thenReturn(List.of(PacienteTestDataFactory.pacienteValidoComId(1L)));


        Pageable paginacao = PageRequest.of(0, 10);

        Page<PacienteResponseDTO> resultado = service.listarTodos(paginacao);
        assertEquals(1, resultado.getContent().size());
        verify(repository).findAll();
    }

    @Test
    @DisplayName("buscarPorId deve retornar Optional com paciente")
    void buscarPorIdDeveRetornarOptionalComPaciente() {
        when(repository.findById(1L)).thenReturn(Optional.of(PacienteTestDataFactory.pacienteValidoComId(1L)));

        PacienteResponseDTO resultado = service.buscarPorId(1L);

        assertEquals("Ana Silva", resultado.getNome());
        verify(repository).findById(1L);
    }

    @Test
    @DisplayName("deletar deve delegar para repository.deleteById")
    void deletarDeveDelegarParaRepository() {
        service.deletar(1L);

        verify(repository).deleteById(1L);
    }
}

