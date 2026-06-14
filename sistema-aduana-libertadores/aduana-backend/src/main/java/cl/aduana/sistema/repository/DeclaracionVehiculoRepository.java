package cl.aduana.sistema.repository;

import cl.aduana.sistema.model.DeclaracionVehiculo;
import cl.aduana.sistema.model.enums.EstadoDeclaracion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface DeclaracionVehiculoRepository extends JpaRepository<DeclaracionVehiculo, Long> {

    Optional<DeclaracionVehiculo> findByNumeroFormulario(String numeroFormulario);
    List<DeclaracionVehiculo> findByPatente(String patente);
    List<DeclaracionVehiculo> findByEstado(EstadoDeclaracion estado);

    // Vehículos que no han retornado y su plazo venció (180 o 90 días según diplomático)
    @Query("SELECT d FROM DeclaracionVehiculo d " +
           "WHERE d.fechaRetornoReal IS NULL " +
           "AND d.estado = 'APROBADA' " +
           "AND ( " +
           "  (d.esDiplomatico = false AND d.fechaSalida < :fechaLimite180) OR " +
           "  (d.esDiplomatico = true  AND d.fechaSalida < :fechaLimite90) " +
           ")")
    List<DeclaracionVehiculo> findVehiculosVencidos(
            @Param("fechaLimite180") LocalDate fechaLimite180,
            @Param("fechaLimite90") LocalDate fechaLimite90);

    // Vehículos próximos a vencer en los próximos N días
    @Query("SELECT d FROM DeclaracionVehiculo d " +
           "WHERE d.fechaRetornoReal IS NULL " +
           "AND d.estado = 'APROBADA' " +
           "AND d.fechaSalida BETWEEN :desde AND :hasta")
    List<DeclaracionVehiculo> findProximosAVencer(
            @Param("desde") LocalDate desde,
            @Param("hasta") LocalDate hasta);

    // Estadísticas: conteo por mes y año
    @Query("SELECT YEAR(d.fechaSalida), MONTH(d.fechaSalida), COUNT(d) " +
           "FROM DeclaracionVehiculo d " +
           "WHERE YEAR(d.fechaSalida) = :anio " +
           "GROUP BY YEAR(d.fechaSalida), MONTH(d.fechaSalida) " +
           "ORDER BY MONTH(d.fechaSalida)")
    List<Object[]> contarPorMesAnio(@Param("anio") int anio);

    @Query("SELECT COUNT(d) FROM DeclaracionVehiculo d WHERE d.fechaSalida BETWEEN :desde AND :hasta")
    long contarEntreFechas(@Param("desde") LocalDate desde, @Param("hasta") LocalDate hasta);
}
