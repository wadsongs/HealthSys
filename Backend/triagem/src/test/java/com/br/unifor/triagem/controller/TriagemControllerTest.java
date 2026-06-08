package com.br.unifor.triagem.controller;

import com.br.unifor.triagem.dto.TriagemRequest;
import com.br.unifor.triagem.dto.TriagemResponse;
import com.br.unifor.triagem.exception.TriagemNotFoundException;
import com.br.unifor.triagem.model.enums.NivelRisco;
import com.br.unifor.triagem.model.enums.StatusTriagem;
import com.br.unifor.triagem.service.TriagemService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.http.MediaType;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDateTime;
import java.util.List;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(controllers = TriagemController.class)
class TriagemControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private TriagemService service;

    @Autowired
    private ObjectMapper objectMapper;

    private TriagemResponse response;
    private TriagemRequest request;

    @BeforeEach
    void setUp() {
        response = TriagemResponse.builder()
                .id(1L)
                .pacienteId(10L)
                .nomePaciente("Maria Santos")
                .nivelRisco(NivelRisco.AMARELO)
                .descricaoRisco(NivelRisco.AMARELO.getDescricao())
                .status(StatusTriagem.AGUARDANDO)
                .sintomas("Febre alta")
                .dataHoraEntrada(LocalDateTime.now())
                .build();

        request = new TriagemRequest();
        request.setPacienteId(10L);
        request.setNomePaciente("Maria Santos");
        request.setNivelRisco(NivelRisco.AMARELO);
        request.setSintomas("Febre alta");
    }

    @Test
    @DisplayName("POST /triagens deve retornar 201 com triagem criada")
    void criar_deveRetornar201() throws Exception {
        when(service.criar(any())).thenReturn(response);

        mockMvc.perform(post("/triagens")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.status").value("AGUARDANDO"))
                .andExpect(jsonPath("$.pacienteId").value(10))
                .andExpect(jsonPath("$.nomePaciente").value("Maria Santos"));
    }

    @Test
    @DisplayName("POST /triagens com campos obrigatórios ausentes deve retornar 400")
    void criar_comDadosInvalidos_deveRetornar400() throws Exception {
        TriagemRequest invalido = new TriagemRequest();

        mockMvc.perform(post("/triagens")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(invalido)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.erros").exists());
    }

    @Test
    @DisplayName("GET /triagens deve retornar 200 com página de triagens")
    void listarTodos_deveRetornar200() throws Exception {
        when(service.listarTodos(any(Pageable.class)))
                .thenReturn(new PageImpl<>(List.of(response)));

        mockMvc.perform(get("/triagens"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content").isArray())
                .andExpect(jsonPath("$.content[0].id").value(1));
    }

    @Test
    @DisplayName("GET /triagens/{id} deve retornar 200 quando encontrado")
    void buscarPorId_deveRetornar200() throws Exception {
        when(service.buscarPorId(1L)).thenReturn(response);

        mockMvc.perform(get("/triagens/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.nivelRisco").value("AMARELO"));
    }

    @Test
    @DisplayName("GET /triagens/{id} deve retornar 404 quando não encontrado")
    void buscarPorId_deveRetornar404() throws Exception {
        when(service.buscarPorId(99L)).thenThrow(new TriagemNotFoundException(99L));

        mockMvc.perform(get("/triagens/99"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.mensagem").exists());
    }

    @Test
    @DisplayName("GET /triagens/paciente/{id} deve retornar lista do paciente")
    void listarPorPaciente_deveRetornar200() throws Exception {
        when(service.listarPorPaciente(10L)).thenReturn(List.of(response));

        mockMvc.perform(get("/triagens/paciente/10"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].pacienteId").value(10));
    }

    @Test
    @DisplayName("GET /triagens/status/{status} deve retornar lista filtrada")
    void listarPorStatus_deveRetornar200() throws Exception {
        when(service.listarPorStatus(StatusTriagem.AGUARDANDO)).thenReturn(List.of(response));

        mockMvc.perform(get("/triagens/status/AGUARDANDO"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].status").value("AGUARDANDO"));
    }

    @Test
    @DisplayName("PUT /triagens/{id} deve retornar triagem atualizada")
    void atualizar_deveRetornar200() throws Exception {
        when(service.atualizar(eq(1L), any())).thenReturn(response);

        mockMvc.perform(put("/triagens/1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1));
    }

    @Test
    @DisplayName("PATCH /triagens/{id}/status deve retornar triagem com novo status")
    void atualizarStatus_deveRetornar200() throws Exception {
        TriagemResponse emAtendimento = TriagemResponse.builder()
                .id(1L)
                .nivelRisco(NivelRisco.AMARELO)
                .status(StatusTriagem.EM_ATENDIMENTO)
                .dataHoraAtendimento(LocalDateTime.now())
                .build();
        when(service.atualizarStatus(eq(1L), eq(StatusTriagem.EM_ATENDIMENTO)))
                .thenReturn(emAtendimento);

        mockMvc.perform(patch("/triagens/1/status")
                        .param("status", "EM_ATENDIMENTO"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("EM_ATENDIMENTO"))
                .andExpect(jsonPath("$.dataHoraAtendimento").exists());
    }

    @Test
    @DisplayName("DELETE /triagens/{id} deve retornar 204")
    void deletar_deveRetornar204() throws Exception {
        doNothing().when(service).deletar(1L);

        mockMvc.perform(delete("/triagens/1"))
                .andExpect(status().isNoContent());
    }
}
