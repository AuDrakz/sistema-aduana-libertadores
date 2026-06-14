package cl.aduana.sistema.controller;

import cl.aduana.sistema.dto.DeclaracionMenorRequest;
import cl.aduana.sistema.model.DeclaracionMenor;
import cl.aduana.sistema.model.enums.EstadoDeclaracion;
import cl.aduana.sistema.service.MenorService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/menores")
@RequiredArgsConstructor
@Tag(name = "Menores de Edad", description = "Gestión de salida/entrada de menores. Valida autorización notarial según situación de viaje.")
public class MenorController {

    private final MenorService menorService;

    @PostMapping
    @Operation(summary = "Registrar declaración de menor",
               description = "Valida automáticamente si requiere autorización notarial según la situación de viaje.")
    public ResponseEntity<DeclaracionMenor> registrar(
            @Valid @RequestBody DeclaracionMenorRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(menorService.registrar(request));
    }

    @GetMapping
    @Operation(summary = "Listar todas las declaraciones de menores")
    public ResponseEntity<List<DeclaracionMenor>> listar() {
        return ResponseEntity.ok(menorService.listarTodos());
    }

    @GetMapping("/{id}")
    @Operation(summary = "Obtener declaración de menor por ID")
    public ResponseEntity<DeclaracionMenor> obtener(@PathVariable Long id) {
        return ResponseEntity.ok(menorService.buscarPorId(id));
    }

    @GetMapping("/pendientes")
    @Operation(summary = "Listar declaraciones pendientes de revisión")
    public ResponseEntity<List<DeclaracionMenor>> listarPendientes() {
        return ResponseEntity.ok(menorService.listarPendientes());
    }

    @PatchMapping("/{id}/estado")
    @Operation(summary = "Actualizar estado de una declaración de menor")
    public ResponseEntity<DeclaracionMenor> actualizarEstado(
            @PathVariable Long id,
            @RequestBody Map<String, String> body) {
        EstadoDeclaracion estado = EstadoDeclaracion.valueOf(body.get("estado"));
        String motivo = body.get("motivo");
        return ResponseEntity.ok(menorService.actualizarEstado(id, estado, motivo));
    }
}
