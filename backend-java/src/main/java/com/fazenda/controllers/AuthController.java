package com.fazenda.controllers;

import com.fazenda.entities.Usuario;
import com.fazenda.services.UsuarioService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private UsuarioService usuarioService;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> credentials) {
        String email = credentials.get("email");
        String senha = credentials.get("senha");

        Optional<Usuario> usuario = usuarioService.findByEmail(email);

        if (usuario.isPresent()) {
            // TODO: Implement real password hashing check (BCrypt)
            // For now, we do a simple string comparison
            if (senha != null && senha.equals(usuario.get().getSenhaHash())) {
                return ResponseEntity.ok(Map.of(
                    "accessToken", "dummy-token-for-" + usuario.get().getId(),
                    "user", usuario.get()
                ));
            }
        }

        return ResponseEntity.status(401).body(Map.of("message", "Invalid credentials"));
    }
    
    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody Usuario usuario) {
        if (usuarioService.findByEmail(usuario.getEmail()).isPresent()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Email already registered"));
        }
        return ResponseEntity.ok(usuarioService.save(usuario));
    }
}
