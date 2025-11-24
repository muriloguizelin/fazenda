package com.fazenda.services;

import com.fazenda.entities.Fazenda;
import com.fazenda.repositories.FazendaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class FazendaService {
    @Autowired
    private FazendaRepository fazendaRepository;

    public List<Fazenda> findAll() {
        return fazendaRepository.findAll();
    }

    public Optional<Fazenda> findById(String id) {
        return fazendaRepository.findById(id);
    }

    public Fazenda save(Fazenda fazenda) {
        return fazendaRepository.save(fazenda);
    }

    public void deleteById(String id) {
        fazendaRepository.deleteById(id);
    }
}
