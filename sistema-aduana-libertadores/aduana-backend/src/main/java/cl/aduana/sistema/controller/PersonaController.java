package cl.aduana.sistema.controller;

import cl.aduana.sistema.exception.RecursoNoEncontradoException;
import cl.aduana.sistema.model.Persona;
import cl.aduana.sistema.repository.PersonaRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/personas")
@RequiredArgsConstructor
@Tag(name = "Personas", description = "Registro y búsqueda de viajeros")
public class PersonaController {

    private final PersonaRepository personaRepo;

    @PostMapping
    @Operation(summary = "Registrar una persona/viajero")
    public ResponseEntity<Persona> registrar(@Valid @RequestBody Persona persona) {
        return ResponseEntity.status(HttpStatus.CREATED).body(personaRepo.save(persona));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Obtener persona por ID")
    public ResponseEntity<Persona> obtener(@PathVariable Long id) {
        return ResponseEntity.ok(personaRepo.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException("Persona", "id", id)));
    }

    @GetMapping("/documento/{numero}")
    @Operation(summary = "Buscar persona por número de documento")
    public ResponseEntity<Persona> buscarPorDocumento(@PathVariable String numero) {
        return ResponseEntity.ok(personaRepo.findByNumeroDocumento(numero)
                .orElseThrow(() -> new RecursoNoEncontradoException("Persona", "documento", numero)));
    }

    @GetMapping("/buscar")
    @Operation(summary = "Búsqueda de personas por nombre, apellido o documento")
    public ResponseEntity<List<Persona>> buscar(@RequestParam String q) {
        return ResponseEntity.ok(personaRepo.buscarPorTermino(q));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Actualizar datos de una persona")
    public ResponseEntity<Persona> actualizar(@PathVariable Long id, @Valid @RequestBody Persona datos) {
        Persona persona = personaRepo.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException("Persona", "id", id));
        datos.setId(persona.getId());
        return ResponseEntity.ok(personaRepo.save(datos));
    }
}
