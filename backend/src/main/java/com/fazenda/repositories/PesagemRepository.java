package com.fazenda.repositories;

import com.fazenda.entities.Pesagem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PesagemRepository extends JpaRepository<Pesagem, String> {
    List<Pesagem> findByAnimalId(String animalId);
}
