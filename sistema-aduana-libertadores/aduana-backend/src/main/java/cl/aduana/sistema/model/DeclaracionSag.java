package cl.aduana.sistema.model;

import cl.aduana.sistema.model.enums.EstadoDeclaracion;
import cl.aduana.sistema.model.enums.TipoCruce;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "declaraciones_sag", indexes = {
        @Index(name = "idx_sag_persona", columnList = "persona_id"),
        @Index(name = "idx_sag_estado", columnList = "estado"),
        @Index(name = "idx_sag_fecha", columnList = "fecha_declaracion")
})
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class DeclaracionSag {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // ── Declarante ───────────────────────────────────────────────────────
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "persona_id", nullable = false)
    private Persona persona;

    /**
     * Regla: Solo mayores de 18 años pueden declarar.
     * Si el viajero es menor, un representante mayor de 18 debe firmar.
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "representante_id")
    private Persona representante;

    // ── Tipo de cruce ────────────────────────────────────────────────────
    @Enumerated(EnumType.STRING)
    @Column(name = "tipo_cruce", nullable = false, length = 10)
    private TipoCruce tipoCruce;

    @NotNull
    @Column(name = "fecha_declaracion", nullable = false)
    private LocalDate fechaDeclaracion;

    // ── Declaración de alimentos ─────────────────────────────────────────
    @Column(name = "declara_productos_animales")
    @Builder.Default
    private boolean declaraProductosAnimales = false;

    @Column(name = "declara_productos_vegetales")
    @Builder.Default
    private boolean declaraProductosVegetales = false;

    @Column(name = "descripcion_productos_animales", columnDefinition = "TEXT")
    private String descripcionProductosAnimales;

    @Column(name = "descripcion_productos_vegetales", columnDefinition = "TEXT")
    private String descripcionProductosVegetales;

    // ── Mascotas ─────────────────────────────────────────────────────────
    @Column(name = "declara_mascotas")
    @Builder.Default
    private boolean declaraMascotas = false;

    @OneToMany(mappedBy = "declaracionSag", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<MascotaDeclarada> mascotas = new ArrayList<>();

    // ── Control ──────────────────────────────────────────────────────────
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private EstadoDeclaracion estado = EstadoDeclaracion.PENDIENTE;

    @Column(name = "numero_declaracion", unique = true, length = 30)
    private String numeroDeclaracion;

    @Column(columnDefinition = "TEXT")
    private String observaciones;

    @Column(name = "requiere_inspeccion")
    @Builder.Default
    private boolean requiereInspeccion = false;

    @Column(name = "motivo_rechazo", columnDefinition = "TEXT")
    private String motivoRechazo;

    // ── Auditoría ────────────────────────────────────────────────────────
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "oficial_sag_id")
    private Usuario oficialSag;

    @CreationTimestamp
    @Column(name = "creado_en", updatable = false)
    private LocalDateTime creadoEn;

    @UpdateTimestamp
    @Column(name = "actualizado_en")
    private LocalDateTime actualizadoEn;

    // ── Lógica de negocio ────────────────────────────────────────────────
    @Transient
    public boolean requiereRepresentante() {
        return persona != null && persona.esMenorDeEdad();
    }

    @Transient
    public boolean tieneDeclaracionDeProductos() {
        return declaraProductosAnimales || declaraProductosVegetales || declaraMascotas;
    }
}
