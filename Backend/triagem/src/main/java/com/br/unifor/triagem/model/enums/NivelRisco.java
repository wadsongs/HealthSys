package com.br.unifor.triagem.model.enums;

import lombok.Getter;

@Getter
public enum NivelRisco {
    VERMELHO("Emergência - Atendimento imediato"),
    LARANJA("Muito Urgente - Até 10 minutos"),
    AMARELO("Urgente - Até 60 minutos"),
    VERDE("Pouco Urgente - Até 120 minutos"),
    AZUL("Não Urgente - Até 240 minutos");

    private final String descricao;

    NivelRisco(String descricao) {
        this.descricao = descricao;
    }
}
