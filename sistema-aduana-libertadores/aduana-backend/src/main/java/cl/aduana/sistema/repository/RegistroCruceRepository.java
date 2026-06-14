package cl.aduana.sistema.repository;

import cl.aduana.sistema.model.RegistroCruce;
import cl.aduana.sistema.model.enums.TipoCruce;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface RegistroCruceRepository extends JpaRepository<RegistroCruce, Long> {

    Page<RegistroCruce> findByTipoCruceOrderByFechaHoraDesc(TipoCruce tipoCruce, Pageable pageable);

    @Query("SELECT r FROM RegistroCruce r WHERE r.fechaHora BETWEEN :desde AND :hasta ORDER BY r.fechaHora DESC")
    List<RegistroCruce> findEntreFechas(
            @Param("desde") LocalDateTime desde,
            @Param("hasta") LocalDateTime hasta);

    @Query("SELECT COUNT(r) FROM RegistroCruce r WHERE r.fechaHora BETWEEN :desde AND :hasta")
    long contarEntreFechas(@Param("desde") LocalDateTime desde, @Param("hasta") LocalDateTime hasta);

    @Query("SELECT COUNT(r) FROM RegistroCruce r WHERE r.tipoCruce = :tipo AND r.fechaHora BETWEEN :desde AND :hasta")
    long contarPorTipoEntreFechas(
            @Param("tipo") TipoCruce tipo,
            @Param("desde") LocalDateTime desde,
            @Param("hasta") LocalDateTime hasta);

    // Estadísticas: cruces por hora del día (para análisis de flujo)
    @Query("SELECT HOUR(r.fechaHora), COUNT(r) FROM RegistroCruce r " +
           "WHERE DATE(r.fechaHora) = :fecha " +
           "GROUP BY HOUR(r.fechaHora) ORDER BY HOUR(r.fechaHora)")
    List<Object[]> crucesPorHora(@Param("fecha") java.time.LocalDate fecha);

    // Estadísticas: cruces por mes
    @Query("SELECT YEAR(r.fechaHora), MONTH(r.fechaHora), r.tipoCruce, COUNT(r) " +
           "FROM RegistroCruce r " +
           "WHERE YEAR(r.fechaHora) = :anio " +
           "GROUP BY YEAR(r.fechaHora), MONTH(r.fechaHora), r.tipoCruce " +
           "ORDER BY MONTH(r.fechaHora)")
    List<Object[]> estadisticasMensuales(@Param("anio") int anio);

    // Top 10 de mayor tiempo de procesamiento (para detectar cuellos de botella)
    @Query("SELECT r FROM RegistroCruce r WHERE r.tiempoProcesamientoMinutos IS NOT NULL " +
           "ORDER BY r.tiempoProcesamientoMinutos DESC")
    List<RegistroCruce> findTopTiemposProcesamiento(Pageable pageable);

    @Query("SELECT AVG(r.tiempoProcesamientoMinutos) FROM RegistroCruce r " +
           "WHERE r.fechaHora BETWEEN :desde AND :hasta " +
           "AND r.tiempoProcesamientoMinutos IS NOT NULL")
    Double promedioTiempoProcesamiento(
            @Param("desde") LocalDateTime desde,
            @Param("hasta") LocalDateTime hasta);
}
