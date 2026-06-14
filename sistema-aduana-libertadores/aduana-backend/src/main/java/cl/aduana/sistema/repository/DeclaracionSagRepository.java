package cl.aduana.sistema.repository;

import cl.aduana.sistema.model.DeclaracionSag;
import cl.aduana.sistema.model.enums.EstadoDeclaracion;
import cl.aduana.sistema.model.enums.TipoCruce;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface DeclaracionSagRepository extends JpaRepository<DeclaracionSag, Long> {

    Optional<DeclaracionSag> findByNumeroDeclaracion(String numeroDeclaracion);
    List<DeclaracionSag> findByEstado(EstadoDeclaracion estado);
    List<DeclaracionSag> findByRequiereInspeccionTrue();

    @Query("SELECT COUNT(d) FROM DeclaracionSag d WHERE d.fechaDeclaracion BETWEEN :desde AND :hasta")
    long contarEntreFechas(@Param("desde") LocalDate desde, @Param("hasta") LocalDate hasta);

    @Query("SELECT COUNT(d) FROM DeclaracionSag d " +
           "WHERE d.fechaDeclaracion BETWEEN :desde AND :hasta " +
           "AND d.declaraMascotas = true")
    long contarConMascotas(@Param("desde") LocalDate desde, @Param("hasta") LocalDate hasta);
}
