package cl.aduana.sistema.model;

import cl.aduana.sistema.model.enums.EstadoDeclaracion;
import cl.aduana.sistema.model.enums.TipoCruce;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "declaraciones_menor", indexes = {
        @Index(name = "idx_menor_documento", columnList = "numero_documento_menor"),
        @Index(name = "idx_menor_estado", columnList = "estado")
})
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class DeclaracionMenor {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // ── Datos del menor ──────────────────────────────────────────────────
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "menor_id", nullable = false)
    private Persona menor;

    // ── Acompañante responsable (puede ser padre/madre o tutor) ──────────
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "acompaniante_id")
    private Persona acompaniante;

    // ── Situación de viaje ───────────────────────────────────────────────
    @Enumerated(EnumType.STRING)
    @Column(name = "situacion_viaje", nullable = false, length = 40)
    private SituacionViaje situacionViaje;

    @Enumerated(EnumType.STRING)
    @Column(name = "tipo_cruce", nullable = false, length = 10)
    private TipoCruce tipoCruce;

    // ── Autorización notarial ────────────────────────────────────────────

    /**
     * Regla: requerida si viaja solo o con un solo padre/madre.
     */
    @Column(name = "requiere_autorizacion_notarial")
    @Builder.Default
    private boolean requiereAutorizacionNotarial = false;

    @Column(name = "tiene_autorizacion_notarial")
    @Builder.Default
    private boolean tieneAutorizacionNotarial = false;

    @Column(name = "notaria_nombre", length = 100)
    private String notariaNombre;

    @Column(name = "notaria_ciudad", length = 100)
    private String notariaCiudad;

    @Column(name = "numero_escritura", length = 50)
    private String numeroEscritura;

    @Column(name = "fecha_autorizacion")
    private LocalDate fechaAutorizacion;

    // ── Datos del padre/madre que NO acompaña (cuando viaja con 1 solo) ──
    @Column(name = "padre_no_acompania_nombre", length = 150)
    private String padreNoAcompaniaNombre;

    @Column(name = "padre_no_acompania_rut", length = 20)
    private String padreNoAcompaniaRut;

    // ── Control ──────────────────────────────────────────────────────────
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private EstadoDeclaracion estado = EstadoDeclaracion.PENDIENTE;

    @Column(name = "fecha_viaje", nullable = false)
    @NotNull
    private LocalDate fechaViaje;

    @Column(name = "pais_destino", nullable = false, length = 60)
    @NotBlank
    private String paisDestino;

    @Column(columnDefinition = "TEXT")
    private String observaciones;

    @Column(name = "motivo_rechazo", columnDefinition = "TEXT")
    private String motivoRechazo;

    // ── Auditoría ────────────────────────────────────────────────────────
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "oficial_id")
    private Usuario oficialRegistrador;

    @CreationTimestamp
    @Column(name = "creado_en", updatable = false)
    private LocalDateTime creadoEn;

    @UpdateTimestamp
    @Column(name = "actualizado_en")
    private LocalDateTime actualizadoEn;

    // ── Enum situación de viaje ──────────────────────────────────────────
    public enum SituacionViaje {
        SOLO,                    // Sin acompañante adulto → requiere autorización + cédula/pasaporte
        CON_AMBOS_PADRES,        // No requiere autorización notarial
        CON_UN_PADRE,            // Requiere autorización notarial del padre ausente
        CON_TUTOR_LEGAL          // Requiere documentación de tutor + autorización si aplica
    }

    // ── Lógica de negocio ────────────────────────────────────────────────
    @Transient
    public boolean esValida() {
        if (!requiereAutorizacionNotarial) return true;
        return tieneAutorizacionNotarial
                && notariaNombre != null && !notariaNombre.isBlank()
                && fechaAutorizacion != null;
    }
}
