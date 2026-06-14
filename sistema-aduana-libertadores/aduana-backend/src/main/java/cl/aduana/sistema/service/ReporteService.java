package cl.aduana.sistema.service;

import cl.aduana.sistema.model.RegistroCruce;
import cl.aduana.sistema.model.enums.TipoCruce;
import cl.aduana.sistema.repository.DeclaracionMenorRepository;
import cl.aduana.sistema.repository.DeclaracionSagRepository;
import cl.aduana.sistema.repository.DeclaracionVehiculoRepository;
import cl.aduana.sistema.repository.RegistroCruceRepository;
import com.itextpdf.kernel.colors.ColorConstants;
import com.itextpdf.kernel.colors.DeviceRgb;
import com.itextpdf.kernel.font.PdfFontFactory;
import com.itextpdf.kernel.pdf.PdfDocument;
import com.itextpdf.kernel.pdf.PdfWriter;
import com.itextpdf.layout.Document;
import com.itextpdf.layout.element.Cell;
import com.itextpdf.layout.element.Paragraph;
import com.itextpdf.layout.element.Table;
import com.itextpdf.layout.properties.TextAlignment;
import com.itextpdf.layout.properties.UnitValue;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.ss.util.CellRangeAddress;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class ReporteService {

    private final RegistroCruceRepository cruceRepo;
    private final DeclaracionVehiculoRepository vehiculoRepo;
    private final DeclaracionMenorRepository menorRepo;
    private final DeclaracionSagRepository sagRepo;

    // ── Color institucional Aduana Chile: azul #003F8A ───────────────────
    private static final DeviceRgb AZUL_ADUANA = new DeviceRgb(0, 63, 138);
    private static final DeviceRgb AZUL_CLARO  = new DeviceRgb(173, 207, 232);

    // ── REPORTE EXCEL ─────────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public byte[] generarExcelCruces(LocalDate desde, LocalDate hasta) throws IOException {
        List<RegistroCruce> cruces = cruceRepo.findEntreFechas(
                desde.atStartOfDay(), hasta.atTime(23, 59, 59));

        try (XSSFWorkbook workbook = new XSSFWorkbook();
             ByteArrayOutputStream out = new ByteArrayOutputStream()) {

            Sheet sheet = workbook.createSheet("Registro de Cruces");
            sheet.setDefaultColumnWidth(20);

            // ── Estilo encabezado ──────────────────────────────────────────
            CellStyle headerStyle = workbook.createCellStyle();
            headerStyle.setFillForegroundColor(IndexedColors.DARK_BLUE.getIndex());
            headerStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);
            headerStyle.setAlignment(HorizontalAlignment.CENTER);
            Font headerFont = workbook.createFont();
            headerFont.setColor(IndexedColors.WHITE.getIndex());
            headerFont.setBold(true);
            headerStyle.setFont(headerFont);
            headerStyle.setBorderBottom(BorderStyle.THIN);

            // ── Estilo alternado filas ─────────────────────────────────────
            CellStyle rowStyle = workbook.createCellStyle();
            rowStyle.setFillForegroundColor(IndexedColors.LIGHT_CORNFLOWER_BLUE.getIndex());
            rowStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);

            // ── Título del reporte ─────────────────────────────────────────
            Row titleRow = sheet.createRow(0);
            titleRow.setHeightInPoints(30);
            var titleCell = titleRow.createCell(0); // <-- Cambiado a var
            titleCell.setCellValue("SERVICIO NACIONAL DE ADUANAS DE CHILE");
            CellStyle titleStyle = workbook.createCellStyle();
            titleStyle.setFillForegroundColor(IndexedColors.DARK_BLUE.getIndex());
            titleStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);
            titleStyle.setAlignment(HorizontalAlignment.CENTER);
            titleStyle.setVerticalAlignment(VerticalAlignment.CENTER);
            Font titleFont = workbook.createFont();
            titleFont.setColor(IndexedColors.WHITE.getIndex());
            titleFont.setBold(true);
            titleFont.setFontHeightInPoints((short) 14);
            titleStyle.setFont(titleFont);
            titleCell.setCellStyle(titleStyle);
            sheet.addMergedRegion(new CellRangeAddress(0, 0, 0, 7));

            Row subtitleRow = sheet.createRow(1);
            var subtitleCell = subtitleRow.createCell(0); // <-- Cambiado a var
            String periodo = desde.format(DateTimeFormatter.ofPattern("dd/MM/yyyy")) +
                             " al " + hasta.format(DateTimeFormatter.ofPattern("dd/MM/yyyy"));
            subtitleCell.setCellValue("Registro de Cruces Fronterizos - Paso Los Libertadores | Período: " + periodo);
            sheet.addMergedRegion(new CellRangeAddress(1, 1, 0, 7));

            // ── Encabezados ────────────────────────────────────────────────
            Row headerRow = sheet.createRow(3);
            String[] columnas = {"ID", "Nombres", "Apellidos", "Documento", "Tipo Cruce",
                                  "País Origen", "País Destino", "Fecha y Hora", "Tiempo (min)", "Oficial"};
            for (int i = 0; i < columnas.length; i++) {
                var cell = headerRow.createCell(i); // <-- Cambiado a var
                cell.setCellValue(columnas[i]);
                cell.setCellStyle(headerStyle);
            }

            // ── Datos ──────────────────────────────────────────────────────
            int rowNum = 4;
            DateTimeFormatter dtf = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm");
            for (RegistroCruce cruce : cruces) {
                Row row = sheet.createRow(rowNum++);
                if (rowNum % 2 == 0) {
                    row.setRowStyle(rowStyle);
                }
                row.createCell(0).setCellValue(cruce.getId());
                row.createCell(1).setCellValue(cruce.getPersona().getNombres());
                row.createCell(2).setCellValue(cruce.getPersona().getApellidos());
                row.createCell(3).setCellValue(cruce.getPersona().getNumeroDocumento());
                row.createCell(4).setCellValue(cruce.getTipoCruce().name());
                row.createCell(5).setCellValue(cruce.getPaisOrigen() != null ? cruce.getPaisOrigen() : "");
                row.createCell(6).setCellValue(cruce.getPaisDestino() != null ? cruce.getPaisDestino() : "");
                row.createCell(7).setCellValue(cruce.getFechaHora().format(dtf));
                row.createCell(8).setCellValue(cruce.getTiempoProcesamientoMinutos() != null
                        ? cruce.getTiempoProcesamientoMinutos() : 0);
                row.createCell(9).setCellValue(cruce.getOficial() != null
                        ? cruce.getOficial().getNombreCompleto() : "");
            }

            // ── Fila resumen ───────────────────────────────────────────────
            Row resumenRow = sheet.createRow(rowNum + 1);
            var totalLabel = resumenRow.createCell(0); // <-- Cambiado a var
            totalLabel.setCellValue("TOTAL DE CRUCES:");
            var totalValue = resumenRow.createCell(1); // <-- Cambiado a var
            totalValue.setCellValue(cruces.size());

            workbook.write(out);
            log.info("Reporte Excel generado: {} registros | Período: {} - {}", cruces.size(), desde, hasta);
            return out.toByteArray();
        }
    }

    // ── REPORTE PDF ───────────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public byte[] generarPdfResumenEstadistico(int anio) throws IOException {
        try (ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            PdfWriter writer = new PdfWriter(out);
            PdfDocument pdf = new PdfDocument(writer);
            Document document = new Document(pdf);

            // ── Encabezado ─────────────────────────────────────────────────
            Paragraph titulo = new Paragraph("SERVICIO NACIONAL DE ADUANAS DE CHILE")
                    .setFontSize(16)
                    .setBold()
                    .setFontColor(AZUL_ADUANA)
                    .setTextAlignment(TextAlignment.CENTER);
            document.add(titulo);

            document.add(new Paragraph("Paso Fronterizo Los Libertadores")
                    .setFontSize(12)
                    .setFontColor(AZUL_ADUANA)
                    .setTextAlignment(TextAlignment.CENTER));

            document.add(new Paragraph("Informe Estadístico Anual - " + anio)
                    .setFontSize(14)
                    .setBold()
                    .setTextAlignment(TextAlignment.CENTER)
                    .setMarginBottom(20));

            document.add(new Paragraph("Generado el: " +
                    LocalDateTime.now().format(DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm:ss")))
                    .setFontSize(9)
                    .setTextAlignment(TextAlignment.RIGHT));

            // ── Tabla resumen ─────────────────────────────────────────────
            float[] columnWidths = {3, 2};
            Table resumen = new Table(UnitValue.createPercentArray(columnWidths)).useAllAvailableWidth();

            // Header tabla
            resumen.addHeaderCell(buildHeaderCell("Indicador"));
            resumen.addHeaderCell(buildHeaderCell("Total " + anio));

            // Estadísticas anuales
            LocalDate inicio = LocalDate.of(anio, 1, 1);
            LocalDate fin = LocalDate.of(anio, 12, 31);

            long totalEntradas = cruceRepo.contarPorTipoEntreFechas(
                    TipoCruce.ENTRADA, inicio.atStartOfDay(), fin.atTime(23,59,59));
            long totalSalidas = cruceRepo.contarPorTipoEntreFechas(
                    TipoCruce.SALIDA, inicio.atStartOfDay(), fin.atTime(23,59,59));
            long totalVehiculos = vehiculoRepo.contarEntreFechas(inicio, fin);
            long totalMenores = menorRepo.contarEntreFechas(inicio, fin);
            long totalSag = sagRepo.contarEntreFechas(inicio, fin);
            long totalSagMascotas = sagRepo.contarConMascotas(inicio, fin);

            agregarFilaResumen(resumen, "Total Entradas al país", String.valueOf(totalEntradas), false);
            agregarFilaResumen(resumen, "Total Salidas del país", String.valueOf(totalSalidas), true);
            agregarFilaResumen(resumen, "Total cruces (Entradas + Salidas)", String.valueOf(totalEntradas + totalSalidas), false);
            agregarFilaResumen(resumen, "Declaraciones de Vehículos", String.valueOf(totalVehiculos), true);
            agregarFilaResumen(resumen, "Declaraciones de Menores", String.valueOf(totalMenores), false);
            agregarFilaResumen(resumen, "Declaraciones SAG", String.valueOf(totalSag), true);
            agregarFilaResumen(resumen, "  - Con mascotas declaradas", String.valueOf(totalSagMascotas), false);

            document.add(resumen);

            // ── Tabla mensual ──────────────────────────────────────────────
            document.add(new Paragraph("\nDetalle Mensual de Cruces - " + anio)
                    .setFontSize(12).setBold().setFontColor(AZUL_ADUANA).setMarginTop(20));

            List<Object[]> mensual = cruceRepo.estadisticasMensuales(anio);
            Table tablaMensual = new Table(UnitValue.createPercentArray(new float[]{2, 2, 2}))
                    .useAllAvailableWidth();
            tablaMensual.addHeaderCell(buildHeaderCell("Mes"));
            tablaMensual.addHeaderCell(buildHeaderCell("Tipo Cruce"));
            tablaMensual.addHeaderCell(buildHeaderCell("Cantidad"));

            String[] meses = {"", "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
                               "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"};

            boolean alt = false;
            for (Object[] fila : mensual) {
                int mes = ((Number) fila[1]).intValue();
                String tipoCruce = fila[2].toString();
                long cantidad = ((Number) fila[3]).longValue();

                tablaMensual.addCell(buildDataCell(meses[mes], alt));
                tablaMensual.addCell(buildDataCell(tipoCruce, alt));
                tablaMensual.addCell(buildDataCell(String.valueOf(cantidad), alt));
                alt = !alt;
            }
            document.add(tablaMensual);

            // ── Pie de página ──────────────────────────────────────────────
            document.add(new Paragraph("\n\nDocumento generado automáticamente por el Sistema Integrado " +
                    "de Control Fronterizo - Aduanas Chile")
                    .setFontSize(8)
                    .setFontColor(ColorConstants.GRAY)
                    .setTextAlignment(TextAlignment.CENTER));

            document.close();
            log.info("Reporte PDF generado para año {}", anio);
            return out.toByteArray();
        }
    }

    // ── Helpers para celdas PDF ───────────────────────────────────────────

    private Cell buildHeaderCell(String texto) {
        return new Cell()
                .add(new Paragraph(texto).setBold().setFontSize(10).setFontColor(ColorConstants.WHITE))
                .setBackgroundColor(AZUL_ADUANA)
                .setTextAlignment(TextAlignment.CENTER)
                .setPadding(6);
    }

    private Cell buildDataCell(String texto, boolean alternar) {
        Cell cell = new Cell()
                .add(new Paragraph(texto).setFontSize(9))
                .setPadding(4);
        if (alternar) {
            cell.setBackgroundColor(AZUL_CLARO);
        }
        return cell;
    }

    private void agregarFilaResumen(Table table, String indicador, String valor, boolean alternar) {
        table.addCell(buildDataCell(indicador, alternar));
        table.addCell(buildDataCell(valor, alternar));
    }

    // ── Estadísticas para dashboard ───────────────────────────────────────

    @Transactional(readOnly = true)
    public Map<String, Object> obtenerEstadisticasDashboard(LocalDate fecha) {
        LocalDateTime inicio = fecha.atStartOfDay();
        LocalDateTime fin = fecha.atTime(23, 59, 59);

        long entradas = cruceRepo.contarPorTipoEntreFechas(TipoCruce.ENTRADA, inicio, fin);
        long salidas = cruceRepo.contarPorTipoEntreFechas(TipoCruce.SALIDA, inicio, fin);
        Double promedio = cruceRepo.promedioTiempoProcesamiento(inicio, fin);
        List<Object[]> crucesPorHora = cruceRepo.crucesPorHora(fecha);
        long vehiculosVencidos = vehiculoRepo.findVehiculosVencidos(
                LocalDate.now().minusDays(180), LocalDate.now().minusDays(90)).size();

        return Map.of(
                "fecha", fecha.toString(),
                "totalEntradas", entradas,
                "totalSalidas", salidas,
                "totalCruces", entradas + salidas,
                "promedioTiempoMinutos", promedio != null ? Math.round(promedio) : 0,
                "vehiculosVencidos", vehiculosVencidos,
                "crucesPorHora", crucesPorHora
        );
    }
}