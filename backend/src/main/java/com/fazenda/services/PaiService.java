package com.fazenda.services;

import com.fazenda.entities.Pai;
import com.fazenda.repositories.PaiRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class PaiService {
    @Autowired
    private PaiRepository paiRepository;

    public List<Pai> findAll() {
        return paiRepository.findAll();
    }

    public List<Pai> findByFazendaId(String fazendaId) {
        return paiRepository.findByFazendaId(fazendaId);
    }

    public Optional<Pai> findById(String id) {
        return paiRepository.findById(id);
    }

    public Pai save(Pai pai) {
        return paiRepository.save(pai);
    }

    public void deleteById(String id) {
        paiRepository.deleteById(id);
    }
}
