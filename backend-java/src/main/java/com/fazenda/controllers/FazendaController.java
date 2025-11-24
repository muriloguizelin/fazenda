package com.fazenda.controllers;

import com.fazenda.entities.Fazenda;
import com.fazenda.services.FazendaService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/fazendas")
public class FazendaController {
    @Autowired
    private FazendaService fazendaService;

    @GetMapping
    public List<Fazenda> getAllFazendas() {
        return fazendaService.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Fazenda> getFazendaById(@PathVariable String id) {
        return fazendaService.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public Fazenda createFazenda(@RequestBody Fazenda fazenda) {
        return fazendaService.save(fazenda);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Fazenda> updateFazenda(@PathVariable String id, @RequestBody Fazenda fazenda) {
        return fazendaService.findById(id)
                .map(existing -> {
                    fazenda.setId(id);
                    return ResponseEntity.ok(fazendaService.save(fazenda));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteFazenda(@PathVariable String id) {
        if (fazendaService.findById(id).isPresent()) {
            fazendaService.deleteById(id);
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }
}
