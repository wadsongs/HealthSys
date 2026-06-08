package com.br.unifor.pacientes.support;

import com.br.unifor.pacientes.model.PacienteModel;

import java.time.LocalDate;
import java.util.ArrayList;

public final class PacienteTestDataFactory {

    private PacienteTestDataFactory() {
    }

    public static PacienteModel pacienteValidoSemId() {
        PacienteModel paciente = new PacienteModel();
        paciente.setNome("Ana Silva");
        paciente.setDataNascimento(LocalDate.of(1990, 10, 10));
        paciente.setCpf("52998224725");
        paciente.setSexo(PacienteModel.Sexo.FEMININO);
        paciente.setTelefone("85999999999");
        paciente.setAlergias(new ArrayList<>());
        paciente.setVacinas(new ArrayList<>());
        return paciente;
    }

    public static PacienteModel pacienteValidoComId(Long id) {
        PacienteModel paciente = pacienteValidoSemId();
        paciente.setId(id);
        return paciente;
    }
}
