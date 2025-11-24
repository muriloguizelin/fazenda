package com.fazenda.services;

import com.fazenda.entities.Receita;
import com.fazenda.repositories.ReceitaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class ReceitaService {
    @Autowired
    private ReceitaRepository receitaRepository;

    public List<Receita> findAll() {
        return receitaRepository.findAll();
    }

    public List<Receita> findByFazendaId(String fazendaId) {
        return receitaRepository.findByFazendaId(fazendaId);
    }

    public Optional<Receita> findById(String id) {
        return receitaRepository.findById(id);
    }

    public Receita save(Receita receita) {
        return receitaRepository.save(receita);
    }

    public void deleteById(String id) {
        receitaRepository.deleteById(id);
    }
}
