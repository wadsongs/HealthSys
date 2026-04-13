package com.br.unifor.pacientes.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    // Paciente não encontrado → 404
    @ExceptionHandler(PacienteNotFoundException.class)
    public ResponseEntity<Map<String, Object>> handleNotFound(PacienteNotFoundException ex) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(erro(ex.getMessage()));
    }

    // CPF duplicado → 409
    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<Map<String, Object>> handleConflict(RuntimeException ex) {
        return ResponseEntity.status(HttpStatus.CONFLICT).body(erro(ex.getMessage()));
    }

    // Erros de validação (@Valid) → 400
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, Object>> handleValidation(MethodArgumentNotValidException ex) {
        Map<String, String> campos = new HashMap<>();
        for (FieldError field : ex.getBindingResult().getFieldErrors()) {
            campos.put(field.getField(), field.getDefaultMessage());
        }
        Map<String, Object> body = new HashMap<>();
        body.put("timestamp", LocalDateTime.now().toString());
        body.put("status", 400);
        body.put("erros", campos);
        return ResponseEntity.badRequest().body(body);
    }

    private Map<String, Object> erro(String mensagem) {
        Map<String, Object> body = new HashMap<>();
        body.put("timestamp", LocalDateTime.now().toString());
        body.put("mensagem", mensagem);
        return body;
    }
}