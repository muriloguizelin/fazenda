package com.fazenda.controllers;

import com.fazenda.dto.ListResponse;
import com.fazenda.entities.Lote;
import com.fazenda.services.LoteService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/lotes")
public class LoteController {
    @Autowired
    private LoteService loteService;

    @GetMapping
    public ListResponse<Lote> getAllLotes(@RequestParam(required = false) String fazendaId) {
        if (fazendaId != null) {
            return new ListResponse<>(loteService.findByFazendaId(fazendaId));
        }
        return new ListResponse<>(loteService.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Lote> getLoteById(@PathVariable String id) {
        return loteService.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public Lote createLote(@RequestBody Lote lote) {
        return loteService.save(lote);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Lote> updateLote(@PathVariable String id, @RequestBody Lote lote) {
        return loteService.findById(id)
                .map(existing -> {
                    lote.setId(id);
                    return ResponseEntity.ok(loteService.save(lote));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteLote(@PathVariable String id) {
        if (loteService.findById(id).isPresent()) {
            loteService.deleteById(id);
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }
}
