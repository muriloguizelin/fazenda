package com.fazenda.entities;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fazenda.enums.Sexo;
import com.fazenda.enums.StatusAnimal;
import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Entity
@Table(name = "Animal")
public class Animal {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @ManyToOne
    @JoinColumn(name = "fazendaId")
    @JsonIgnore
    private Fazenda fazenda;

    private String prefixo;

    private Integer numero;

    @Column(unique = true)
    private String brinco;

    @Enumerated(EnumType.STRING)
    private Sexo sexo;

    @ManyToOne
    @JoinColumn(name = "paiId")
    private Pai pai;

    private LocalDateTime nascimento;

    private String origem;

    private String fotoUrl;

    @Enumerated(EnumType.STRING)
    private StatusAnimal status = StatusAnimal.ATIVO;

    @ManyToOne
    @JoinColumn(name = "loteId")
    @JsonIgnore
    private Lote lote;

    @OneToMany(mappedBy = "animal")
    @JsonIgnore
    private List<Pesagem> pesagens;

    @ManyToOne
    @JoinColumn(name = "receitaId")
    @JsonIgnore
    private Receita receita;

    @CreationTimestamp
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;

    @PrePersist
    @PreUpdate
    private void generateBrinco() {
        if (prefixo != null && numero != null) {
            this.brinco = prefixo + "-" + numero;
        }
    }
}
