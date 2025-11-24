package com.fazenda.services;

import com.fazenda.entities.Animal;
import com.fazenda.repositories.AnimalRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class AnimalService {
    @Autowired
    private AnimalRepository animalRepository;

    public List<Animal> findAll() {
        return animalRepository.findAll();
    }

    public Optional<Animal> findById(String id) {
        return animalRepository.findById(id);
    }

    public Animal save(Animal animal) {
        return animalRepository.save(animal);
    }

    public void deleteById(String id) {
        animalRepository.deleteById(id);
    }
    
    public List<Animal> findByFazendaId(String fazendaId) {
        return animalRepository.findByFazendaId(fazendaId);
    }
}
