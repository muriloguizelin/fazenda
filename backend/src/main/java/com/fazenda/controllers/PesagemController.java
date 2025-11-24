package com.fazenda.controllers;

import com.fazenda.entities.Pesagem;
import com.fazenda.services.PesagemService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/pesagens")
public class PesagemController {
    @Autowired
    private PesagemService pesagemService;

    @GetMapping
    public List<Pesagem> getAllPesagens(@RequestParam(required = false) String animalId) {
        if (animalId != null) {
            return pesagemService.findByAnimalId(animalId);
        }
        return pesagemService.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Pesagem> getPesagemById(@PathVariable String id) {
        return pesagemService.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public Pesagem createPesagem(@RequestBody Pesagem pesagem) {
        return pesagemService.save(pesagem);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Pesagem> updatePesagem(@PathVariable String id, @RequestBody Pesagem pesagem) {
        return pesagemService.findById(id)
                .map(existing -> {
                    pesagem.setId(id);
                    return ResponseEntity.ok(pesagemService.save(pesagem));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePesagem(@PathVariable String id) {
        if (pesagemService.findById(id).isPresent()) {
            pesagemService.deleteById(id);
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }
}
