package com.fazenda.controllers;

import com.fazenda.dto.ListResponse;
import com.fazenda.entities.Animal;
import com.fazenda.services.AnimalService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/animais")
public class AnimalController {
    @Autowired
    private AnimalService animalService;

    @GetMapping
    public ListResponse<Animal> getAllAnimais(@RequestParam(required = false) String fazendaId) {
        if (fazendaId != null) {
            return new ListResponse<>(animalService.findByFazendaId(fazendaId));
        }
        return new ListResponse<>(animalService.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Animal> getAnimalById(@PathVariable String id) {
        return animalService.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public Animal createAnimal(@RequestBody Animal animal) {
        return animalService.save(animal);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Animal> updateAnimal(@PathVariable String id, @RequestBody Animal animal) {
        return animalService.findById(id)
                .map(existing -> {
                    animal.setId(id);
                    return ResponseEntity.ok(animalService.save(animal));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteAnimal(@PathVariable String id) {
        if (animalService.findById(id).isPresent()) {
            animalService.deleteById(id);
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }
}
