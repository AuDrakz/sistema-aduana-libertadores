package cl.aduana.sistema.repository;

import cl.aduana.sistema.model.DeclaracionMenor;
import cl.aduana.sistema.model.enums.EstadoDeclaracion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface DeclaracionMenorRepository extends JpaRepository<DeclaracionMenor, Long> {

    List<DeclaracionMenor> findByEstado(EstadoDeclaracion estado);

    @Query("SELECT d FROM DeclaracionMenor d WHERE d.menor.numeroDocumento = :documento")
    List<DeclaracionMenor> findByDocumentoMenor(@Param("documento") String documento);

    @Query("SELECT COUNT(d) FROM DeclaracionMenor d WHERE d.fechaViaje BETWEEN :desde AND :hasta")
    long contarEntreFechas(@Param("desde") LocalDate desde, @Param("hasta") LocalDate hasta);

    @Query("SELECT COUNT(d) FROM DeclaracionMenor d " +
           "WHERE d.fechaViaje BETWEEN :desde AND :hasta " +
           "AND d.estado = 'RECHAZADA'")
    long contarRechazadasEntreFechas(@Param("desde") LocalDate desde, @Param("hasta") LocalDate hasta);
}
