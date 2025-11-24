package com.fazenda.services;

import com.fazenda.entities.Despesa;
import com.fazenda.repositories.DespesaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class DespesaService {
    @Autowired
    private DespesaRepository despesaRepository;

    public List<Despesa> findAll() {
        return despesaRepository.findAll();
    }

    public List<Despesa> findByFazendaId(String fazendaId) {
        return despesaRepository.findByFazendaId(fazendaId);
    }

    public Optional<Despesa> findById(String id) {
        return despesaRepository.findById(id);
    }

    public Despesa save(Despesa despesa) {
        return despesaRepository.save(despesa);
    }

    public void deleteById(String id) {
        despesaRepository.deleteById(id);
    }
}
