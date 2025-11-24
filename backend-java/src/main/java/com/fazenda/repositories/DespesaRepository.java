package com.fazenda.repositories;

import com.fazenda.entities.Despesa;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DespesaRepository extends JpaRepository<Despesa, String> {
    List<Despesa> findByFazendaId(String fazendaId);
}
