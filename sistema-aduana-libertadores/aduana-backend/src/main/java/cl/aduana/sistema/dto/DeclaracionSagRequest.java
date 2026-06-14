package cl.aduana.sistema.dto;

import cl.aduana.sistema.model.enums.TipoCruce;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;
import java.util.List;

@Data
public class DeclaracionSagRequest {

    @NotNull(message = "El ID de la persona es obligatorio")
    private Long personaId;

    private Long representanteId;

    @NotNull(message = "El tipo de cruce es obligatorio")
    private TipoCruce tipoCruce;

    @NotNull(message = "La fecha de declaración es obligatoria")
    private LocalDate fechaDeclaracion;

    private boolean declaraProductosAnimales = false;
    private String descripcionProductosAnimales;

    private boolean declaraProductosVegetales = false;
    private String descripcionProductosVegetales;

    private boolean declaraMascotas = false;
    private List<MascotaDeclaradaDto> mascotas;

    private String observaciones;

    @Data
    public static class MascotaDeclaradaDto {
        private String especie;
        private String raza;
        private String nombreMascota;
        private String microchip;
        private boolean tieneVacunaAntirabica;
        private boolean tieneCertificadoSalud;
        private String numeroCertificado;
        private String observaciones;
    }
}
