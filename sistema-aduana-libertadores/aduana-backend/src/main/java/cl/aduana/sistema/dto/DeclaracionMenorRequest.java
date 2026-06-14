package cl.aduana.sistema.dto;

import cl.aduana.sistema.model.DeclaracionMenor.SituacionViaje;
import cl.aduana.sistema.model.enums.TipoCruce;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;

@Data
public class DeclaracionMenorRequest {

    @NotNull(message = "El ID del menor es obligatorio")
    private Long menorId;

    private Long acompanianteId;

    @NotNull(message = "La situación de viaje es obligatoria")
    private SituacionViaje situacionViaje;

    @NotNull(message = "El tipo de cruce es obligatorio")
    private TipoCruce tipoCruce;

    private boolean tieneAutorizacionNotarial = false;
    private String notariaNombre;
    private String notariaCiudad;
    private String numeroEscritura;
    private LocalDate fechaAutorizacion;

    private String padreNoAcompaniaNombre;
    private String padreNoAcompaniaRut;

    @NotNull(message = "La fecha de viaje es obligatoria")
    private LocalDate fechaViaje;

    @NotBlank(message = "El país de destino es obligatorio")
    private String paisDestino;

    private String observaciones;
}
