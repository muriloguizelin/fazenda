package com.fazenda.controllers;

import com.fazenda.entities.Pai;
import com.fazenda.services.PaiService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/pais")
public class PaiController {
    @Autowired
    private PaiService paiService;

    @GetMapping
    public List<Pai> getAllPais(@RequestParam(required = false) String fazendaId) {
        if (fazendaId != null) {
            return paiService.findByFazendaId(fazendaId);
        }
        return paiService.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Pai> getPaiById(@PathVariable String id) {
        return paiService.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public Pai createPai(@RequestBody Pai pai) {
        return paiService.save(pai);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Pai> updatePai(@PathVariable String id, @RequestBody Pai pai) {
        return paiService.findById(id)
                .map(existing -> {
                    pai.setId(id);
                    return ResponseEntity.ok(paiService.save(pai));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePai(@PathVariable String id) {
        if (paiService.findById(id).isPresent()) {
            paiService.deleteById(id);
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }
}
