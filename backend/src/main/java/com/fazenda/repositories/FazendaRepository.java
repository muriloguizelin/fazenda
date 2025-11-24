package com.fazenda.repositories;

import com.fazenda.entities.Fazenda;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FazendaRepository extends JpaRepository<Fazenda, String> {
    List<Fazenda> findByContaId(String contaId);
}
