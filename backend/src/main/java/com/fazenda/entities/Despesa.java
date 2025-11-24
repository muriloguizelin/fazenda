package com.fazenda.entities;

import com.fasterxml.jackson.annotation.JsonIgnore;

import com.fazenda.enums.CategoriaDespesa;
import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "Despesa")
public class Despesa {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @ManyToOne
    @JoinColumn(name = "fazendaId")
    @JsonIgnore
    private Fazenda fazenda;

    private String descricao;

    private Double valor;

    private LocalDateTime data = LocalDateTime.now();

    @Enumerated(EnumType.STRING)
    private CategoriaDespesa categoria;

    private String observacao;

    @CreationTimestamp
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;
}
