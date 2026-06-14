package cl.aduana.sistema.controller;

import cl.aduana.sistema.dto.DeclaracionSagRequest;
import cl.aduana.sistema.model.DeclaracionSag;
import cl.aduana.sistema.service.SagService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/sag")
@RequiredArgsConstructor
@Tag(name = "SAG - Declaraciones", description = "Declaraciones juradas de alimentos, productos animales/vegetales y mascotas.")
public class SagController {

    private final SagService sagService;

    @PostMapping
    @Operation(summary = "Registrar declaración SAG",
               description = "Crea declaración jurada. Si el viajero es menor de 18, requiere representante mayor.")
    public ResponseEntity<DeclaracionSag> registrar(
            @Valid @RequestBody DeclaracionSagRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(sagService.registrar(request));
    }

    @GetMapping
    @Operation(summary = "Listar todas las declaraciones SAG")
    public ResponseEntity<List<DeclaracionSag>> listar() {
        return ResponseEntity.ok(sagService.listarTodas());
    }

    @GetMapping("/{id}")
    @Operation(summary = "Obtener declaración SAG por ID")
    public ResponseEntity<DeclaracionSag> obtener(@PathVariable Long id) {
        return ResponseEntity.ok(sagService.buscarPorId(id));
    }

    @GetMapping("/pendientes-inspeccion")
    @Operation(summary = "Listar declaraciones que requieren inspección física")
    public ResponseEntity<List<DeclaracionSag>> pendientesInspeccion() {
        return ResponseEntity.ok(sagService.listarPendientesInspeccion());
    }

    @PatchMapping("/{id}/aprobar")
    @Operation(summary = "Aprobar una declaración SAG")
    public ResponseEntity<DeclaracionSag> aprobar(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(sagService.aprobar(id, userDetails.getUsername()));
    }

    @PatchMapping("/{id}/rechazar")
    @Operation(summary = "Rechazar una declaración SAG con motivo")
    public ResponseEntity<DeclaracionSag> rechazar(
            @PathVariable Long id,
            @RequestBody Map<String, String> body) {
        return ResponseEntity.ok(sagService.rechazar(id, body.get("motivo")));
    }
}
