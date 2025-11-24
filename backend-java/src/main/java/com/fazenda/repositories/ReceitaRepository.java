package com.fazenda.repositories;

import com.fazenda.entities.Receita;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReceitaRepository extends JpaRepository<Receita, String> {
    List<Receita> findByFazendaId(String fazendaId);
}
