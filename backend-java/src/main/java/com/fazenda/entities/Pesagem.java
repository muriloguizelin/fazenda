package com.fazenda.entities;

import com.fasterxml.jackson.annotation.JsonIgnore;

import com.fazenda.enums.StatusAnimal;
import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "Pesagem")
public class Pesagem {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @ManyToOne
    @JoinColumn(name = "animalId")
    @JsonIgnore
    private Animal animal;

    private LocalDateTime data = LocalDateTime.now();

    private Double peso;

    @Enumerated(EnumType.STRING)
    private StatusAnimal flag;

    private String observacao;

    @CreationTimestamp
    private LocalDateTime createdAt;
}
