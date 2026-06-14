package cl.aduana.sistema.controller;

import cl.aduana.sistema.service.ReporteService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.Map;

@RestController
@RequestMapping("/reportes")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('ROLE_ADMIN','ROLE_SUPERVISOR')")
@Tag(name = "Reportes", description = "Generación de informes estadísticos exportables a Excel y PDF.")
public class ReporteController {

    private final ReporteService reporteService;

    @GetMapping("/dashboard")
    @Operation(summary = "Estadísticas del día para el dashboard")
    public ResponseEntity<Map<String, Object>> dashboard(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fecha) {
        if (fecha == null) fecha = LocalDate.now();
        return ResponseEntity.ok(reporteService.obtenerEstadisticasDashboard(fecha));
    }

    @GetMapping("/cruces/excel")
    @Operation(summary = "Exportar registro de cruces a Excel (.xlsx)")
    public ResponseEntity<byte[]> exportarCrucesExcel(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate desde,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate hasta)
            throws IOException {

        byte[] excel = reporteService.generarExcelCruces(desde, hasta);
        String filename = "cruces_" + desde.format(DateTimeFormatter.ofPattern("yyyyMMdd"))
                + "_" + hasta.format(DateTimeFormatter.ofPattern("yyyyMMdd")) + ".xlsx";

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                .contentType(MediaType.parseMediaType(
                        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                .body(excel);
    }

    @GetMapping("/estadistico/pdf")
    @Operation(summary = "Exportar informe estadístico anual a PDF")
    public ResponseEntity<byte[]> exportarResumenPdf(
            @RequestParam(defaultValue = "0") int anio) throws IOException {

        if (anio == 0) anio = LocalDate.now().getYear();
        byte[] pdf = reporteService.generarPdfResumenEstadistico(anio);
        String filename = "informe_estadistico_" + anio + ".pdf";

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                .contentType(MediaType.APPLICATION_PDF)
                .body(pdf);
    }
}
