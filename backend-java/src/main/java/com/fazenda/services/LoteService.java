package com.fazenda.services;

import com.fazenda.entities.Lote;
import com.fazenda.repositories.LoteRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class LoteService {
    @Autowired
    private LoteRepository loteRepository;

    public List<Lote> findAll() {
        return loteRepository.findAll();
    }

    public List<Lote> findByFazendaId(String fazendaId) {
        return loteRepository.findByFazendaId(fazendaId);
    }

    public Optional<Lote> findById(String id) {
        return loteRepository.findById(id);
    }

    public Lote save(Lote lote) {
        return loteRepository.save(lote);
    }

    public void deleteById(String id) {
        loteRepository.deleteById(id);
    }
}
