package com.fazenda.entities;

import com.fasterxml.jackson.annotation.JsonIgnore;

import com.fazenda.enums.Cargo;
import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "Usuario")
public class Usuario {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    private String nome;

    @Column(unique = true)
    private String email;

    private String senhaHash;

    @Enumerated(EnumType.STRING)
    private Cargo cargo;

    @ManyToOne
    @JoinColumn(name = "contaId")
    @JsonIgnore
    private Conta conta;

    @CreationTimestamp
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;
}
