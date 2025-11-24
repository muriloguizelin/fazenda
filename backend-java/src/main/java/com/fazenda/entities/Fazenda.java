package com.fazenda.entities;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Data
@Entity
@Table(name = "Fazenda")
public class Fazenda {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @ManyToOne
    @JoinColumn(name = "contaId")
    @JsonIgnore
    private Conta conta;

    private String nome;

    @JdbcTypeCode(SqlTypes.JSON)
    private Map<String, Object> localizacao;

    private Float hectares;

    @OneToMany(mappedBy = "fazenda")
    @JsonIgnore
    private List<Animal> animais;

    @OneToMany(mappedBy = "fazenda")
    @JsonIgnore
    private List<Lote> lotes;

    @OneToMany(mappedBy = "fazenda")
    @JsonIgnore
    private List<Pai> pais;

    @OneToMany(mappedBy = "fazenda")
    @JsonIgnore
    private List<Despesa> despesas;

    @OneToMany(mappedBy = "fazenda")
    @JsonIgnore
    private List<Receita> receitas;

    @CreationTimestamp
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;
}
