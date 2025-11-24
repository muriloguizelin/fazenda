package com.fazenda.repositories;

import com.fazenda.entities.Animal;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AnimalRepository extends JpaRepository<Animal, String> {
    List<Animal> findByFazendaId(String fazendaId);
    List<Animal> findByLoteId(String loteId);
}
