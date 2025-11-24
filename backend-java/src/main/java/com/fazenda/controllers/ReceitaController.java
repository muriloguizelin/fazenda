package com.fazenda.controllers;

import com.fazenda.entities.Receita;
import com.fazenda.services.ReceitaService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/receitas")
public class ReceitaController {
    @Autowired
    private ReceitaService receitaService;

    @GetMapping
    public List<Receita> getAllReceitas(@RequestParam(required = false) String fazendaId) {
        if (fazendaId != null) {
            return receitaService.findByFazendaId(fazendaId);
        }
        return receitaService.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Receita> getReceitaById(@PathVariable String id) {
        return receitaService.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public Receita createReceita(@RequestBody Receita receita) {
        return receitaService.save(receita);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Receita> updateReceita(@PathVariable String id, @RequestBody Receita receita) {
        return receitaService.findById(id)
                .map(existing -> {
                    receita.setId(id);
                    return ResponseEntity.ok(receitaService.save(receita));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteReceita(@PathVariable String id) {
        if (receitaService.findById(id).isPresent()) {
            receitaService.deleteById(id);
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }
}
