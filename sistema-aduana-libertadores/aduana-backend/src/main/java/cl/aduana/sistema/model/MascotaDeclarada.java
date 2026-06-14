package cl.aduana.sistema.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Entity
@Table(name = "mascotas_declaradas")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class MascotaDeclarada {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "declaracion_sag_id", nullable = false)
    private DeclaracionSag declaracionSag;

    @NotBlank
    @Column(nullable = false, length = 50)
    private String especie;           // Perro, Gato, Ave, etc.

    @Column(length = 50)
    private String raza;

    @NotBlank
    @Column(name = "nombre_mascota", nullable = false, length = 50)
    private String nombreMascota;

    @Column(length = 20)
    private String microchip;

    @Column(name = "tiene_vacuna_antirabica")
    @Builder.Default
    private boolean tieneVacunaAntirabica = false;

    @Column(name = "tiene_certificado_salud")
    @Builder.Default
    private boolean tieneCertificadoSalud = false;

    @Column(name = "numero_certificado", length = 50)
    private String numeroCertificado;

    @Column(columnDefinition = "TEXT")
    private String observaciones;
}
