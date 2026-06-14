package cl.aduana.sistema.model;

import cl.aduana.sistema.model.enums.TipoCruce;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "registros_cruce", indexes = {
        @Index(name = "idx_cruce_persona", columnList = "persona_id"),
        @Index(name = "idx_cruce_fecha", columnList = "fecha_hora"),
        @Index(name = "idx_cruce_tipo", columnList = "tipo_cruce")
})
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class RegistroCruce {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "persona_id", nullable = false)
    private Persona persona;

    @Enumerated(EnumType.STRING)
    @Column(name = "tipo_cruce", nullable = false, length = 10)
    private TipoCruce tipoCruce;

    @Column(name = "fecha_hora", nullable = false)
    private LocalDateTime fechaHora;

    // FK opcionales según el tipo de trámite asociado
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "declaracion_vehiculo_id")
    private DeclaracionVehiculo declaracionVehiculo;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "declaracion_menor_id")
    private DeclaracionMenor declaracionMenor;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "declaracion_sag_id")
    private DeclaracionSag declaracionSag;

    @Column(name = "pais_origen", length = 60)
    private String paisOrigen;

    @Column(name = "pais_destino", length = 60)
    private String paisDestino;

    @Column(name = "numero_vuelo_transporte", length = 30)
    private String numeroTransporte;

    @Column(name = "carril_atencion", length = 20)
    private String carrilAtencion;

    @Column(name = "tiempo_procesamiento_minutos")
    private Integer tiempoProcesamientoMinutos;

    @Column(name = "aprobado_pdi")
    @Builder.Default
    private boolean aprobadoPdi = false;

    @Column(name = "aprobado_aduana")
    @Builder.Default
    private boolean aprobadoAduana = false;

    @Column(name = "aprobado_sag")
    @Builder.Default
    private boolean aprobadoSag = false;

    @Column(columnDefinition = "TEXT")
    private String observaciones;

    // Oficial que procesó el cruce
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "oficial_id")
    private Usuario oficial;

    @CreationTimestamp
    @Column(name = "registrado_en", updatable = false)
    private LocalDateTime registradoEn;

    @Transient
    public boolean estaCompleto() {
        return aprobadoPdi && aprobadoAduana;
    }
}
