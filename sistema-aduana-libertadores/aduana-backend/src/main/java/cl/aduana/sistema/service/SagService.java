package cl.aduana.sistema.service;

import cl.aduana.sistema.dto.DeclaracionSagRequest;
import cl.aduana.sistema.exception.RecursoNoEncontradoException;
import cl.aduana.sistema.exception.ReglaNegocioException;
import cl.aduana.sistema.model.DeclaracionSag;
import cl.aduana.sistema.model.MascotaDeclarada;
import cl.aduana.sistema.model.Persona;
import cl.aduana.sistema.model.enums.EstadoDeclaracion;
import cl.aduana.sistema.repository.DeclaracionSagRepository;
import cl.aduana.sistema.repository.PersonaRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class SagService {

    private final DeclaracionSagRepository sagRepo;
    private final PersonaRepository personaRepo;

    @Transactional
    public DeclaracionSag registrar(DeclaracionSagRequest req) {
        Persona persona = personaRepo.findById(req.getPersonaId())
                .orElseThrow(() -> new RecursoNoEncontradoException("Persona", "id", req.getPersonaId()));

        // ── Regla: menores de 18 requieren representante mayor de 18 ─────
        if (persona.esMenorDeEdad()) {
            if (req.getRepresentanteId() == null) {
                throw new ReglaNegocioException(
                        "El viajero es menor de edad. Un representante mayor de 18 años " +
                        "debe firmar la declaración SAG.");
            }
            Persona representante = personaRepo.findById(req.getRepresentanteId())
                    .orElseThrow(() -> new RecursoNoEncontradoException("Representante", "id", req.getRepresentanteId()));

            if (representante.esMenorDeEdad()) {
                throw new ReglaNegocioException("El representante debe ser mayor de 18 años.");
            }
        }

        // ── Regla: si declara mascotas, debe detallarlas ──────────────────
        if (req.isDeclaraMascotas() &&
                (req.getMascotas() == null || req.getMascotas().isEmpty())) {
            throw new ReglaNegocioException(
                    "Si declara mascotas, debe proporcionar los detalles de cada una.");
        }

        // ── Regla: si declara productos animales, debe describirlos ───────
        if (req.isDeclaraProductosAnimales() &&
                (req.getDescripcionProductosAnimales() == null || req.getDescripcionProductosAnimales().isBlank())) {
            throw new ReglaNegocioException(
                    "Debe describir los productos de origen animal que declara.");
        }

        Persona representante = (req.getRepresentanteId() != null && persona.esMenorDeEdad())
                ? personaRepo.findById(req.getRepresentanteId()).orElse(null)
                : null;

        DeclaracionSag declaracion = DeclaracionSag.builder()
                .persona(persona)
                .representante(representante)
                .tipoCruce(req.getTipoCruce())
                .fechaDeclaracion(req.getFechaDeclaracion())
                .declaraProductosAnimales(req.isDeclaraProductosAnimales())
                .descripcionProductosAnimales(req.getDescripcionProductosAnimales())
                .declaraProductosVegetales(req.isDeclaraProductosVegetales())
                .descripcionProductosVegetales(req.getDescripcionProductosVegetales())
                .declaraMascotas(req.isDeclaraMascotas())
                .observaciones(req.getObservaciones())
                .estado(EstadoDeclaracion.PENDIENTE)
                .numeroDeclaracion(generarNumeroDeclaracion())
                // Requiere inspección si declara animales, vegetales o mascotas
                .requiereInspeccion(req.isDeclaraProductosAnimales() ||
                                    req.isDeclaraProductosVegetales() ||
                                    req.isDeclaraMascotas())
                .build();

        // Asociar mascotas
        if (req.isDeclaraMascotas() && req.getMascotas() != null) {
            List<MascotaDeclarada> mascotas = new ArrayList<>();
            for (DeclaracionSagRequest.MascotaDeclaradaDto dto : req.getMascotas()) {
                mascotas.add(MascotaDeclarada.builder()
                        .declaracionSag(declaracion)
                        .especie(dto.getEspecie())
                        .raza(dto.getRaza())
                        .nombreMascota(dto.getNombreMascota())
                        .microchip(dto.getMicrochip())
                        .tieneVacunaAntirabica(dto.isTieneVacunaAntirabica())
                        .tieneCertificadoSalud(dto.isTieneCertificadoSalud())
                        .numeroCertificado(dto.getNumeroCertificado())
                        .observaciones(dto.getObservaciones())
                        .build());
            }
            declaracion.setMascotas(mascotas);
        }

        DeclaracionSag guardada = sagRepo.save(declaracion);
        log.info("Declaración SAG registrada: {} | Requiere inspección: {}",
                guardada.getNumeroDeclaracion(), guardada.isRequiereInspeccion());
        return guardada;
    }

    @Transactional
    public DeclaracionSag aprobar(Long id, String oficialUsername) {
        DeclaracionSag declaracion = sagRepo.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException("Declaración SAG", "id", id));
        declaracion.setEstado(EstadoDeclaracion.APROBADA);
        return sagRepo.save(declaracion);
    }

    @Transactional
    public DeclaracionSag rechazar(Long id, String motivo) {
        DeclaracionSag declaracion = sagRepo.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException("Declaración SAG", "id", id));
        declaracion.setEstado(EstadoDeclaracion.RECHAZADA);
        declaracion.setMotivoRechazo(motivo);
        return sagRepo.save(declaracion);
    }

    @Transactional(readOnly = true)
    public List<DeclaracionSag> listarPendientesInspeccion() {
        return sagRepo.findByRequiereInspeccionTrue();
    }

    @Transactional(readOnly = true)
    public DeclaracionSag buscarPorId(Long id) {
        return sagRepo.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException("Declaración SAG", "id", id));
    }

    @Transactional(readOnly = true)
    public List<DeclaracionSag> listarTodas() {
        return sagRepo.findAll();
    }

    private String generarNumeroDeclaracion() {
        String fecha = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        String uuid = UUID.randomUUID().toString().substring(0, 6).toUpperCase();
        return "SAG-" + fecha + "-" + uuid;
    }
}
