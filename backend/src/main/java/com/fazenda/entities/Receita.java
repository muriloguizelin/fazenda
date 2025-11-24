package com.fazenda.entities;

import com.fasterxml.jackson.annotation.JsonIgnore;

import com.fazenda.enums.CategoriaReceita;
import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Entity
@Table(name = "Receita")
public class Receita {
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
    private CategoriaReceita categoria;

    private String observacao;

    @OneToMany(mappedBy = "receita")
    @JsonIgnore
    private List<Animal> animais;

    @CreationTimestamp
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;
}
