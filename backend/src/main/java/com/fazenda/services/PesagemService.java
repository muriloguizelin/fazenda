package com.fazenda.services;

import com.fazenda.entities.Pesagem;
import com.fazenda.repositories.PesagemRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class PesagemService {
    @Autowired
    private PesagemRepository pesagemRepository;

    public List<Pesagem> findAll() {
        return pesagemRepository.findAll();
    }

    public List<Pesagem> findByAnimalId(String animalId) {
        return pesagemRepository.findByAnimalId(animalId);
    }

    public Optional<Pesagem> findById(String id) {
        return pesagemRepository.findById(id);
    }

    public Pesagem save(Pesagem pesagem) {
        return pesagemRepository.save(pesagem);
    }

    public void deleteById(String id) {
        pesagemRepository.deleteById(id);
    }
}
