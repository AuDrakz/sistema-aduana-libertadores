package cl.aduana.sistema.repository;

import cl.aduana.sistema.model.Persona;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PersonaRepository extends JpaRepository<Persona, Long> {

    Optional<Persona> findByNumeroDocumento(String numeroDocumento);
    boolean existsByNumeroDocumento(String numeroDocumento);

    @Query("SELECT p FROM Persona p WHERE LOWER(p.nombres) LIKE LOWER(CONCAT('%',:termino,'%')) " +
           "OR LOWER(p.apellidos) LIKE LOWER(CONCAT('%',:termino,'%')) " +
           "OR p.numeroDocumento LIKE CONCAT('%',:termino,'%')")
    List<Persona> buscarPorTermino(@Param("termino") String termino);

    @Query("SELECT p FROM Persona p WHERE p.nacionalidad = :nacionalidad")
    List<Persona> findByNacionalidad(@Param("nacionalidad") String nacionalidad);
}
