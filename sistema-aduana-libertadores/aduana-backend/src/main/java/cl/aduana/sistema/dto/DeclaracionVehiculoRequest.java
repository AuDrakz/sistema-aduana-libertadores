package cl.aduana.sistema.dto;

import cl.aduana.sistema.model.enums.TipoCruce;
import cl.aduana.sistema.model.enums.TipoVehiculo;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;

@Data
public class DeclaracionVehiculoRequest {

    @NotNull(message = "El ID de la persona es obligatorio")
    private Long personaId;

    @NotBlank(message = "La patente es obligatoria")
    private String patente;

    @NotBlank(message = "La marca es obligatoria")
    private String marca;

    @NotBlank(message = "El modelo es obligatorio")
    private String modelo;

    private String anio;

    @NotNull(message = "El tipo de vehículo es obligatorio")
    private TipoVehiculo tipoVehiculo;

    private String numeroChasis;
    private String numeroMotor;

    @NotBlank(message = "El país de matrícula es obligatorio")
    private String paisMatricula;

    @NotNull(message = "El tipo de cruce es obligatorio")
    private TipoCruce tipoCruce;

    @NotNull(message = "La fecha de salida es obligatoria")
    private LocalDate fechaSalida;

    private LocalDate fechaRetornoEstimado;

    private boolean esDiplomatico = false;

    private String observaciones;
}
