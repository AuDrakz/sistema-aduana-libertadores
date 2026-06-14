package cl.aduana.sistema.model;

import cl.aduana.sistema.model.enums.EstadoDeclaracion;
import cl.aduana.sistema.model.enums.TipoCruce;
import cl.aduana.sistema.model.enums.TipoVehiculo;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;

@Entity
@Table(name = "declaraciones_vehiculo", indexes = {
        @Index(name = "idx_vehiculo_patente", columnList = "patente"),
        @Index(name = "idx_vehiculo_estado", columnList = "estado"),
        @Index(name = "idx_vehiculo_fecha_salida", columnList = "fecha_salida")
})
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class DeclaracionVehiculo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // ── Datos del propietario / conductor ────────────────────────────────
    @ManyToOne(fetch = FetchType.EAGER, optional = false)
    @JoinColumn(name = "persona_id", nullable = false)
    private Persona persona;

    // ── Datos del vehículo ───────────────────────────────────────────────
    @NotBlank
    @Column(nullable = false, length = 20)
    private String patente;

    @NotBlank
    @Column(nullable = false, length = 50)
    private String marca;

    @NotBlank
    @Column(nullable = false, length = 50)
    private String modelo;

    @Column(length = 4)
    private String anio;

    @Enumerated(EnumType.STRING)
    @Column(name = "tipo_vehiculo", nullable = false, length = 30)
    private TipoVehiculo tipoVehiculo;

    @Column(name = "numero_chasis", length = 50)
    private String numeroChasis;

    @Column(name = "numero_motor", length = 50)
    private String numeroMotor;

    @Column(name = "pais_matricula", nullable = false, length = 50)
    private String paisMatricula;

    // ── Datos del cruce ──────────────────────────────────────────────────
    @Enumerated(EnumType.STRING)
    @Column(name = "tipo_cruce", nullable = false, length = 10)
    private TipoCruce tipoCruce;

    @NotNull
    @Column(name = "fecha_salida", nullable = false)
    private LocalDate fechaSalida;

    @Column(name = "fecha_retorno_estimado")
    private LocalDate fechaRetornoEstimado;

    @Column(name = "fecha_retorno_real")
    private LocalDate fechaRetornoReal;

    // ── Estado y control ─────────────────────────────────────────────────
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private EstadoDeclaracion estado = EstadoDeclaracion.PENDIENTE;

    @Column(name = "numero_formulario", unique = true, length = 30)
    private String numeroFormulario;

    @Column(name = "es_diplomatico")
    @Builder.Default
    private boolean esDiplomatico = false;

    @Column(columnDefinition = "TEXT")
    private String observaciones;

    // ── Auditoría ────────────────────────────────────────────────────────
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "oficial_id")
    private Usuario oficialRegistrador;

    @CreationTimestamp
    @Column(name = "creado_en", updatable = false)
    private LocalDateTime creadoEn;

    @UpdateTimestamp
    @Column(name = "actualizado_en")
    private LocalDateTime actualizadoEn;

    // ── Lógica de negocio: plazo máximo ──────────────────────────────────

    /**
     * Regla: diplomáticos tienen 90 días; resto 180 días corridos.
     */
    @Transient
    public int getPlazoMaximoDias() {
        return esDiplomatico ? 90 : 180;
    }

    @Transient
    public LocalDate getFechaLimiteRetorno() {
        return fechaSalida.plusDays(getPlazoMaximoDias());
    }

    @Transient
    public long getDiasRestantes() {
        if (fechaRetornoReal != null) return 0;
        return ChronoUnit.DAYS.between(LocalDate.now(), getFechaLimiteRetorno());
    }

    @Transient
    public boolean estaVencido() {
        if (fechaRetornoReal != null) return false;
        return LocalDate.now().isAfter(getFechaLimiteRetorno());
    }

    @Transient
    public boolean estaProximoAVencer() {
        long dias = getDiasRestantes();
        return dias > 0 && dias <= 15;
    }
}
