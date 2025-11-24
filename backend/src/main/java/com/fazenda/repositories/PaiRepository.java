package com.fazenda.repositories;

import com.fazenda.entities.Pai;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PaiRepository extends JpaRepository<Pai, String> {
    List<Pai> findByFazendaId(String fazendaId);
}
