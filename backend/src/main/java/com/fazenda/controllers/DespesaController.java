package com.fazenda.controllers;

import com.fazenda.entities.Despesa;
import com.fazenda.services.DespesaService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/despesas")
public class DespesaController {
    @Autowired
    private DespesaService despesaService;

    @GetMapping
    public List<Despesa> getAllDespesas(@RequestParam(required = false) String fazendaId) {
        if (fazendaId != null) {
            return despesaService.findByFazendaId(fazendaId);
        }
        return despesaService.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Despesa> getDespesaById(@PathVariable String id) {
        return despesaService.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public Despesa createDespesa(@RequestBody Despesa despesa) {
        return despesaService.save(despesa);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Despesa> updateDespesa(@PathVariable String id, @RequestBody Despesa despesa) {
        return despesaService.findById(id)
                .map(existing -> {
                    despesa.setId(id);
                    return ResponseEntity.ok(despesaService.save(despesa));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteDespesa(@PathVariable String id) {
        if (despesaService.findById(id).isPresent()) {
            despesaService.deleteById(id);
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }
}
