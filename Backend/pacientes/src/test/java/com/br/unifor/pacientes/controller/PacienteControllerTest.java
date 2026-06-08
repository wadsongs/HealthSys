package com.br.unifor.pacientes.controller;

import com.br.unifor.pacientes.dto.PacienteResponseDTO;
import com.br.unifor.pacientes.exception.GlobalExceptionHandler;
import com.br.unifor.pacientes.exception.PacienteNotFoundException;
import com.br.unifor.pacientes.model.PacienteModel;
import com.br.unifor.pacientes.service.PacienteService;
import com.br.unifor.pacientes.support.PacienteTestDataFactory;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableHandlerMethodArgumentResolver;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.validation.beanvalidation.LocalValidatorFactoryBean;

import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@ExtendWith(MockitoExtension.class)
class PacienteControllerTest {

    private MockMvc mockMvc;

    private ObjectMapper objectMapper;

    @Mock
    private PacienteService service;

    @InjectMocks
    private PacienteController controller;

    @BeforeEach
    void setup() {
        LocalValidatorFactoryBean validator = new LocalValidatorFactoryBean();
        validator.afterPropertiesSet();

        objectMapper = new ObjectMapper();
        objectMapper.registerModule(new JavaTimeModule());

        mockMvc = MockMvcBuilders
                .standaloneSetup(controller)
                .setControllerAdvice(new GlobalExceptionHandler())
                .setCustomArgumentResolvers(new PageableHandlerMethodArgumentResolver())
                .setValidator(validator)
                .build();
    }

    private PacienteResponseDTO dto(Long id) {
        return PacienteResponseDTO.fromModel(PacienteTestDataFactory.pacienteValidoComId(id));
    }

    @Test
    @DisplayName("POST /pacientes deve retornar 201 para payload valido")
    void criarDeveRetornarCreated() throws Exception {
        PacienteModel entrada = PacienteTestDataFactory.pacienteValidoSemId();

        when(service.criar(any(PacienteModel.class))).thenReturn(dto(1L));

        mockMvc.perform(post("/pacientes")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(entrada)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(1L))
                .andExpect(jsonPath("$.nome").value("Ana Silva"));
    }

    @Test
    @DisplayName("POST /pacientes deve retornar 400 quando nome estiver vazio")
    void criarDeveRetornarBadRequestQuandoNomeInvalido() throws Exception {
        PacienteModel invalido = PacienteTestDataFactory.pacienteValidoSemId();
        invalido.setNome(" ");

        mockMvc.perform(post("/pacientes")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(invalido)))
                .andExpect(status().isBadRequest());

        verify(service, never()).criar(any(PacienteModel.class));
    }

    @Test
    @DisplayName("POST /pacientes deve retornar 400 quando dataNascimento for futura")
    void criarDeveRetornarBadRequestQuandoDataNascimentoForFutura() throws Exception {
        PacienteModel invalido = PacienteTestDataFactory.pacienteValidoSemId();
        invalido.setDataNascimento(java.time.LocalDate.now().plusDays(1));

        mockMvc.perform(post("/pacientes")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(invalido)))
                .andExpect(status().isBadRequest());

        verify(service, never()).criar(any(PacienteModel.class));
    }

    @Test
    @DisplayName("POST /pacientes deve retornar 400 quando cpf estiver vazio")
    void criarDeveRetornarBadRequestQuandoCpfForVazio() throws Exception {
        PacienteModel invalido = PacienteTestDataFactory.pacienteValidoSemId();
        invalido.setCpf(" ");

        mockMvc.perform(post("/pacientes")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(invalido)))
                .andExpect(status().isBadRequest());

        verify(service, never()).criar(any(PacienteModel.class));
    }

    @Test
    @DisplayName("POST /pacientes deve retornar 400 quando sexo estiver ausente")
    void criarDeveRetornarBadRequestQuandoSexoForAusente() throws Exception {
        PacienteModel invalido = PacienteTestDataFactory.pacienteValidoSemId();
        invalido.setSexo(null);

        mockMvc.perform(post("/pacientes")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(invalido)))
                .andExpect(status().isBadRequest());

        verify(service, never()).criar(any(PacienteModel.class));
    }

    @Test
    @DisplayName("POST /pacientes deve retornar 400 quando telefone estiver vazio")
    void criarDeveRetornarBadRequestQuandoTelefoneForVazio() throws Exception {
        PacienteModel invalido = PacienteTestDataFactory.pacienteValidoSemId();
        invalido.setTelefone(" ");

        mockMvc.perform(post("/pacientes")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(invalido)))
                .andExpect(status().isBadRequest());

        verify(service, never()).criar(any(PacienteModel.class));
    }

    @Test
    @DisplayName("POST /pacientes deve retornar 400 quando dataNascimento estiver ausente")
    void criarDeveRetornarBadRequestQuandoDataNascimentoEstiverAusente() throws Exception {
        PacienteModel invalido = PacienteTestDataFactory.pacienteValidoSemId();
        invalido.setDataNascimento(null);

        mockMvc.perform(post("/pacientes")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(invalido)))
                .andExpect(status().isBadRequest());

        verify(service, never()).criar(any(PacienteModel.class));
    }

    @Test
    @DisplayName("POST /pacientes deve retornar 400 quando JSON estiver invalido")
    void criarDeveRetornarBadRequestQuandoJsonForInvalido() throws Exception {
        String jsonInvalido = "{\"nome\":\"Ana Silva\"";

        mockMvc.perform(post("/pacientes")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(jsonInvalido))
                .andExpect(status().isBadRequest());

        verify(service, never()).criar(any(PacienteModel.class));
    }

    @Test
    @DisplayName("GET /pacientes deve retornar 200 com pagina")
    void listarTodosDeveRetornarOk() throws Exception {
        when(service.listarTodos(any(Pageable.class)))
                .thenReturn(new PageImpl<>(List.of(dto(1L))));

        mockMvc.perform(get("/pacientes"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[0].id").value(1L));
    }

    @Test
    @DisplayName("GET /pacientes/{id} deve retornar 200 quando encontrar")
    void buscarPorIdDeveRetornarOkQuandoEncontrar() throws Exception {
        when(service.buscarPorId(1L)).thenReturn(dto(1L));

        mockMvc.perform(get("/pacientes/{id}", 1L))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.cpf").value("52998224725"));
    }

    @Test
    @DisplayName("GET /pacientes/{id} deve retornar 404 quando nao encontrar")
    void buscarPorIdDeveRetornarNotFoundQuandoNaoEncontrar() throws Exception {
        when(service.buscarPorId(999L)).thenThrow(new PacienteNotFoundException(999L));

        mockMvc.perform(get("/pacientes/{id}", 999L))
                .andExpect(status().isNotFound());
    }

    @Test
    @DisplayName("DELETE /pacientes/{id} deve retornar 204")
    void deletarDeveRetornarNoContent() throws Exception {
        mockMvc.perform(delete("/pacientes/{id}", 1L))
                .andExpect(status().isNoContent());

        verify(service).deletar(1L);
    }
}
