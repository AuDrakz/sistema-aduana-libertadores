package cl.aduana.sistema.service;

import cl.aduana.sistema.dto.DeclaracionVehiculoRequest;
import cl.aduana.sistema.exception.RecursoNoEncontradoException;
import cl.aduana.sistema.exception.ReglaNegocioException;
import cl.aduana.sistema.model.DeclaracionVehiculo;
import cl.aduana.sistema.model.Persona;
import cl.aduana.sistema.model.enums.EstadoDeclaracion;
import cl.aduana.sistema.model.enums.TipoCruce;
import cl.aduana.sistema.repository.DeclaracionVehiculoRepository;
import cl.aduana.sistema.repository.PersonaRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class VehiculoService {

    private final DeclaracionVehiculoRepository vehiculoRepo;
    private final PersonaRepository personaRepo;

    @Transactional
    public DeclaracionVehiculo registrar(DeclaracionVehiculoRequest req) {
        Persona persona = personaRepo.findById(req.getPersonaId())
                .orElseThrow(() -> new RecursoNoEncontradoException("Persona", "id", req.getPersonaId()));

        // ── Regla: plazo retorno no puede superar el máximo permitido ──────
        if (req.getFechaRetornoEstimado() != null && req.getFechaSalida() != null) {
            int plazoMaximo = req.isEsDiplomatico() ? 90 : 180;
            long diasSolicitados = java.time.temporal.ChronoUnit.DAYS.between(
                    req.getFechaSalida(), req.getFechaRetornoEstimado());

            if (diasSolicitados > plazoMaximo) {
                throw new ReglaNegocioException(String.format(
                        "El plazo solicitado (%d días) supera el máximo permitido (%d días corridos).",
                        diasSolicitados, plazoMaximo));
            }
        }

        // ── Regla: fecha de salida no puede ser anterior a hoy ────────────
        if (req.getFechaSalida() != null && req.getFechaSalida().isBefore(LocalDate.now())) {
            throw new ReglaNegocioException("La fecha de salida no puede ser anterior a la fecha actual.");
        }

        DeclaracionVehiculo declaracion = DeclaracionVehiculo.builder()
                .persona(persona)
                .patente(req.getPatente().toUpperCase().trim())
                .marca(req.getMarca())
                .modelo(req.getModelo())
                .anio(req.getAnio())
                .tipoVehiculo(req.getTipoVehiculo())
                .numeroChasis(req.getNumeroChasis())
                .numeroMotor(req.getNumeroMotor())
                .paisMatricula(req.getPaisMatricula())
                .tipoCruce(req.getTipoCruce())
                .fechaSalida(req.getFechaSalida())
                .fechaRetornoEstimado(req.getFechaRetornoEstimado())
                .esDiplomatico(req.isEsDiplomatico())
                .observaciones(req.getObservaciones())
                .estado(EstadoDeclaracion.APROBADA)
                .numeroFormulario(generarNumeroFormulario())
                .build();

        DeclaracionVehiculo guardado = vehiculoRepo.save(declaracion);
        log.info("Declaración vehículo registrada: {} | Formulario: {}", req.getPatente(), guardado.getNumeroFormulario());
        return guardado;
    }

    @Transactional
    public DeclaracionVehiculo registrarRetorno(Long id, LocalDate fechaRetorno) {
        DeclaracionVehiculo declaracion = vehiculoRepo.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException("Declaración de vehículo", "id", id));

        if (declaracion.getFechaRetornoReal() != null) {
            throw new ReglaNegocioException("Este vehículo ya registró su retorno el " +
                    declaracion.getFechaRetornoReal());
        }

        declaracion.setFechaRetornoReal(fechaRetorno);
        declaracion.setEstado(EstadoDeclaracion.APROBADA);

        if (declaracion.estaVencido()) {
            log.warn("Vehículo {} retornó FUERA DEL PLAZO. Fecha límite era: {}",
                    declaracion.getPatente(), declaracion.getFechaLimiteRetorno());
        }

        return vehiculoRepo.save(declaracion);
    }

    @Transactional(readOnly = true)
    public List<DeclaracionVehiculo> obtenerVehiculosVencidos() {
        LocalDate fechaLimite180 = LocalDate.now().minusDays(180);
        LocalDate fechaLimite90 = LocalDate.now().minusDays(90);
        return vehiculoRepo.findVehiculosVencidos(fechaLimite180, fechaLimite90);
    }

    @Transactional(readOnly = true)
    public List<DeclaracionVehiculo> obtenerProximosAVencer(int diasAntelacion) {
        LocalDate desde = LocalDate.now().minusDays(180 - diasAntelacion);
        LocalDate hasta = LocalDate.now().minusDays(180 - diasAntelacion * 2);
        return vehiculoRepo.findProximosAVencer(desde, hasta);
    }

    @Transactional(readOnly = true)
    public DeclaracionVehiculo buscarPorId(Long id) {
        return vehiculoRepo.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException("Declaración de vehículo", "id", id));
    }

    @Transactional(readOnly = true)
    public List<DeclaracionVehiculo> buscarPorPatente(String patente) {
        return vehiculoRepo.findByPatente(patente.toUpperCase().trim());
    }

    @Transactional(readOnly = true)
    public List<DeclaracionVehiculo> listarTodos() {
        return vehiculoRepo.findAll();
    }

    private String generarNumeroFormulario() {
        String fecha = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        String uuid = UUID.randomUUID().toString().substring(0, 6).toUpperCase();
        return "VEH-" + fecha + "-" + uuid;
    }
}
