package cl.aduana.sistema.service;

import cl.aduana.sistema.dto.DeclaracionMenorRequest;
import cl.aduana.sistema.exception.RecursoNoEncontradoException;
import cl.aduana.sistema.exception.ReglaNegocioException;
import cl.aduana.sistema.model.DeclaracionMenor;
import cl.aduana.sistema.model.DeclaracionMenor.SituacionViaje;
import cl.aduana.sistema.model.Persona;
import cl.aduana.sistema.model.enums.EstadoDeclaracion;
import cl.aduana.sistema.repository.DeclaracionMenorRepository;
import cl.aduana.sistema.repository.PersonaRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class MenorService {

    private final DeclaracionMenorRepository menorRepo;
    private final PersonaRepository personaRepo;

    @Transactional
    public DeclaracionMenor registrar(DeclaracionMenorRequest req) {
        Persona menor = personaRepo.findById(req.getMenorId())
                .orElseThrow(() -> new RecursoNoEncontradoException("Persona", "id", req.getMenorId()));

        // ── Regla: la persona DEBE ser menor de 18 años ───────────────────
        if (!menor.esMenorDeEdad()) {
            throw new ReglaNegocioException(String.format(
                    "%s tiene %d años. Este módulo solo aplica a menores de 18 años.",
                    menor.getNombreCompleto(), menor.getEdad()));
        }

        // ── Regla: validar acompañante cuando corresponde ─────────────────
        Persona acompaniante = null;
        if (req.getAcompanianteId() != null) {
            acompaniante = personaRepo.findById(req.getAcompanianteId())
                    .orElseThrow(() -> new RecursoNoEncontradoException("Acompañante", "id", req.getAcompanianteId()));

            if (acompaniante.esMenorDeEdad()) {
                throw new ReglaNegocioException("El acompañante debe ser mayor de 18 años.");
            }
        }

        // ── Determinar si requiere autorización notarial ──────────────────
        boolean requiereNotarial = determinarRequiereNotarial(req.getSituacionViaje());

        // ── Regla: si requiere notarial, debe presentarla ─────────────────
        if (requiereNotarial && !req.isTieneAutorizacionNotarial()) {
            throw new ReglaNegocioException(
                    "Se requiere autorización notarial para esta situación de viaje (" +
                    req.getSituacionViaje() + "). El menor no puede salir sin este documento.");
        }

        // ── Regla: si viaja SOLO, obligatoriamente necesita acompañante registrado o notarial ──
        if (req.getSituacionViaje() == SituacionViaje.SOLO && acompaniante == null) {
            if (!req.isTieneAutorizacionNotarial()) {
                throw new ReglaNegocioException(
                        "Un menor que viaja solo debe presentar autorización notarial.");
            }
        }

        // ── Regla: con un solo padre, se requiere notarial del otro padre ─
        if (req.getSituacionViaje() == SituacionViaje.CON_UN_PADRE) {
            if (req.getPadreNoAcompaniaNombre() == null || req.getPadreNoAcompaniaNombre().isBlank()) {
                throw new ReglaNegocioException(
                        "Debe registrar los datos del padre/madre que NO acompaña al menor.");
            }
        }

        EstadoDeclaracion estado = requiereNotarial && req.isTieneAutorizacionNotarial()
                ? EstadoDeclaracion.APROBADA
                : (requiereNotarial ? EstadoDeclaracion.RECHAZADA : EstadoDeclaracion.APROBADA);

        DeclaracionMenor declaracion = DeclaracionMenor.builder()
                .menor(menor)
                .acompaniante(acompaniante)
                .situacionViaje(req.getSituacionViaje())
                .tipoCruce(req.getTipoCruce())
                .requiereAutorizacionNotarial(requiereNotarial)
                .tieneAutorizacionNotarial(req.isTieneAutorizacionNotarial())
                .notariaNombre(req.getNotariaNombre())
                .notariaCiudad(req.getNotariaCiudad())
                .numeroEscritura(req.getNumeroEscritura())
                .fechaAutorizacion(req.getFechaAutorizacion())
                .padreNoAcompaniaNombre(req.getPadreNoAcompaniaNombre())
                .padreNoAcompaniaRut(req.getPadreNoAcompaniaRut())
                .fechaViaje(req.getFechaViaje())
                .paisDestino(req.getPaisDestino())
                .observaciones(req.getObservaciones())
                .estado(estado)
                .build();

        DeclaracionMenor guardado = menorRepo.save(declaracion);
        log.info("Declaración menor registrada: {} | Estado: {}",
                menor.getNombreCompleto(), guardado.getEstado());
        return guardado;
    }

    @Transactional
    public DeclaracionMenor actualizarEstado(Long id, EstadoDeclaracion nuevoEstado, String motivo) {
        DeclaracionMenor declaracion = menorRepo.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException("Declaración de menor", "id", id));

        declaracion.setEstado(nuevoEstado);
        if (nuevoEstado == EstadoDeclaracion.RECHAZADA && motivo != null) {
            declaracion.setMotivoRechazo(motivo);
        }
        return menorRepo.save(declaracion);
    }

    @Transactional(readOnly = true)
    public DeclaracionMenor buscarPorId(Long id) {
        return menorRepo.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException("Declaración de menor", "id", id));
    }

    @Transactional(readOnly = true)
    public List<DeclaracionMenor> listarPendientes() {
        return menorRepo.findByEstado(EstadoDeclaracion.PENDIENTE);
    }

    @Transactional(readOnly = true)
    public List<DeclaracionMenor> listarTodos() {
        return menorRepo.findAll();
    }

    private boolean determinarRequiereNotarial(SituacionViaje situacion) {
        return switch (situacion) {
            case SOLO, CON_UN_PADRE, CON_TUTOR_LEGAL -> true;
            case CON_AMBOS_PADRES -> false;
        };
    }
}
