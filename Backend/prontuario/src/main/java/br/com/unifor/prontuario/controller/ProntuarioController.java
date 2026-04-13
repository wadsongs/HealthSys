package br.com.unifor.prontuario.controller;

import br.com.unifor.prontuario.model.*;
import br.com.unifor.prontuario.service.ProntuarioService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/prontuarios")
@RequiredArgsConstructor
@Tag(name = "Prontuário", description = "Gerenciamento de prontuários eletrônicos")
public class ProntuarioController {

    private final ProntuarioService service;

    @Operation(summary = "Criar prontuário", description = "Cria um novo prontuário para o paciente")
    @PostMapping("/{idPaciente}")
    public ResponseEntity<ProntuarioModel> criar(@PathVariable Long idPaciente) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.criar(idPaciente));
    }

    @Operation(summary = "Buscar prontuário", description = "Retorna o prontuário completo do paciente")
    @GetMapping("/{idPaciente}")
    public ResponseEntity<ProntuarioModel> buscar(
            @PathVariable Long idPaciente,
            @RequestHeader("X-User-Id") Long idUsuario) {
        return ResponseEntity.ok(service.buscarPorIdPaciente(idPaciente, idUsuario));
    }

    @Operation(summary = "Adicionar consulta")
    @PostMapping("/{idPaciente}/consultas")
    public ResponseEntity<ProntuarioModel> adicionarConsulta(
            @PathVariable Long idPaciente,
            @RequestBody @Valid Consulta consulta,
            @RequestHeader("X-User-Id") Long idUsuario) {
        return ResponseEntity.ok(service.adicionarConsulta(idPaciente, consulta, idUsuario));
    }

    @Operation(summary = "Adicionar exame")
    @PostMapping("/{idPaciente}/exames")
    public ResponseEntity<ProntuarioModel> adicionarExame(
            @PathVariable Long idPaciente,
            @RequestBody @Valid Exame exame,
            @RequestHeader("X-User-Id") Long idUsuario) {
        return ResponseEntity.ok(service.adicionarExame(idPaciente, exame, idUsuario));
    }

    @Operation(summary = "Adicionar medicamento", description = "Apenas médicos podem prescrever — RN03")
    @PostMapping("/{idPaciente}/medicamentos")
    public ResponseEntity<ProntuarioModel> adicionarMedicamento(
            @PathVariable Long idPaciente,
            @RequestBody @Valid Medicamento medicamento,
            @RequestHeader("X-User-Id") Long idUsuario) {
        return ResponseEntity.ok(service.adicionarMedicamento(idPaciente, medicamento, idUsuario));
    }

    @Operation(summary = "Atualizar alergias")
    @PutMapping("/{idPaciente}/alergias")
    public ResponseEntity<ProntuarioModel> atualizarAlergias(
            @PathVariable Long idPaciente,
            @RequestBody List<String> alergias,
            @RequestHeader("X-User-Id") Long idUsuario) {
        return ResponseEntity.ok(service.atualizarAlergias(idPaciente, alergias, idUsuario));
    }

    @Operation(summary = "Buscar logs de auditoria", description = "Lista todos os acessos ao prontuário — RN04")
    @GetMapping("/{idPaciente}/logs")
    public ResponseEntity<List<LogAuditoria>> buscarLogs(@PathVariable Long idPaciente) {
        return ResponseEntity.ok(service.buscarLogs(idPaciente));
    }
}
