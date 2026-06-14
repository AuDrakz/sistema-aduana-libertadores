package cl.aduana.sistema.controller;

import cl.aduana.sistema.dto.DeclaracionVehiculoRequest;
import cl.aduana.sistema.model.DeclaracionVehiculo;
import cl.aduana.sistema.service.VehiculoService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/vehiculos")
@RequiredArgsConstructor
@Tag(name = "Vehículos", description = "Gestión de salida y admisión temporal de vehículos")
public class VehiculoController {

    private final VehiculoService vehiculoService;

    @PostMapping
    @Operation(summary = "Registrar salida de vehículo",
               description = "Registra una declaración de salida temporal. Valida el plazo máximo de 180 días (90 para diplomáticos).")
    public ResponseEntity<DeclaracionVehiculo> registrar(
            @Valid @RequestBody DeclaracionVehiculoRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(vehiculoService.registrar(request));
    }

    @GetMapping
    @Operation(summary = "Listar todas las declaraciones de vehículos")
    public ResponseEntity<List<DeclaracionVehiculo>> listar() {
        return ResponseEntity.ok(vehiculoService.listarTodos());
    }

    @GetMapping("/{id}")
    @Operation(summary = "Obtener declaración por ID")
    public ResponseEntity<DeclaracionVehiculo> obtener(
            @Parameter(description = "ID de la declaración") @PathVariable Long id) {
        return ResponseEntity.ok(vehiculoService.buscarPorId(id));
    }

    @GetMapping("/patente/{patente}")
    @Operation(summary = "Buscar por patente del vehículo")
    public ResponseEntity<List<DeclaracionVehiculo>> buscarPorPatente(@PathVariable String patente) {
        return ResponseEntity.ok(vehiculoService.buscarPorPatente(patente));
    }

    @PatchMapping("/{id}/retorno")
    @Operation(summary = "Registrar retorno del vehículo",
               description = "Marca la fecha de retorno real del vehículo al país de origen")
    public ResponseEntity<DeclaracionVehiculo> registrarRetorno(
            @PathVariable Long id,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fechaRetorno) {
        return ResponseEntity.ok(vehiculoService.registrarRetorno(id, fechaRetorno));
    }

    @GetMapping("/vencidos")
    @PreAuthorize("hasAnyRole('ROLE_ADMIN','ROLE_SUPERVISOR','ROLE_OFICIAL_ADUANA')")
    @Operation(summary = "Listar vehículos con plazo vencido")
    public ResponseEntity<List<DeclaracionVehiculo>> obtenerVencidos() {
        return ResponseEntity.ok(vehiculoService.obtenerVehiculosVencidos());
    }

    @GetMapping("/proximos-vencer")
    @Operation(summary = "Listar vehículos próximos a vencer (15 días)")
    public ResponseEntity<List<DeclaracionVehiculo>> obtenerProximosVencer() {
        return ResponseEntity.ok(vehiculoService.obtenerProximosAVencer(15));
    }
}
