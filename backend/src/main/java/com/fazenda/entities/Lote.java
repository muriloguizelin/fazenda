package com.fazenda.entities;

import com.fasterxml.jackson.annotation.JsonIgnore;

import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Entity
@Table(name = "Lote", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"fazendaId", "nome"})
})
public class Lote {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @ManyToOne
    @JoinColumn(name = "fazendaId")
    @JsonIgnore
    private Fazenda fazenda;

    private String nome;

    private String prefixo;

    private Integer capacidade;

    @OneToMany(mappedBy = "lote")
    @JsonIgnore
    private List<Animal> animais;

    @CreationTimestamp
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;
}
