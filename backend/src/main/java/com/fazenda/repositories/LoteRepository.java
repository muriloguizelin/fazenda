package com.fazenda.repositories;

import com.fazenda.entities.Lote;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LoteRepository extends JpaRepository<Lote, String> {
    List<Lote> findByFazendaId(String fazendaId);
}
