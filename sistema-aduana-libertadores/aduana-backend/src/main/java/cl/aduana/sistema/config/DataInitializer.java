package cl.aduana.sistema.config;

import cl.aduana.sistema.model.Usuario;
import cl.aduana.sistema.model.enums.RolUsuario;
import cl.aduana.sistema.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        if (usuarioRepository.count() == 0) {
            crearUsuariosSistema();
            log.info("✅ Usuarios iniciales del sistema creados exitosamente.");
        }
    }

    private void crearUsuariosSistema() {
        // Administrador del sistema
        usuarioRepository.save(Usuario.builder()
                .username("admin")
                .password(passwordEncoder.encode("Admin2024!"))
                .nombreCompleto("Administrador Sistema Aduanas")
                .email("admin@aduana.cl")
                .rol(RolUsuario.ROLE_ADMIN)
                .rut("11.111.111-1")
                .cargo("Administrador")
                .activo(true)
                .build());

        // Supervisor
        usuarioRepository.save(Usuario.builder()
                .username("supervisor")
                .password(passwordEncoder.encode("Super2024!"))
                .nombreCompleto("Supervisor Paso Los Libertadores")
                .email("supervisor@aduana.cl")
                .rol(RolUsuario.ROLE_SUPERVISOR)
                .rut("22.222.222-2")
                .cargo("Supervisor Fronterizo")
                .activo(true)
                .build());

        // Oficial de Aduana
        usuarioRepository.save(Usuario.builder()
                .username("oficial.aduana")
                .password(passwordEncoder.encode("Aduana2024!"))
                .nombreCompleto("Juan Pérez González")
                .email("jperez@aduana.cl")
                .rol(RolUsuario.ROLE_OFICIAL_ADUANA)
                .rut("33.333.333-3")
                .cargo("Oficial de Aduana")
                .activo(true)
                .build());

        // Oficial PDI
        usuarioRepository.save(Usuario.builder()
                .username("oficial.pdi")
                .password(passwordEncoder.encode("Pdi2024!"))
                .nombreCompleto("María Rodríguez Soto")
                .email("mrodriguez@pdi.cl")
                .rol(RolUsuario.ROLE_OFICIAL_PDI)
                .rut("44.444.444-4")
                .cargo("Oficial PDI")
                .activo(true)
                .build());

        // Oficial SAG
        usuarioRepository.save(Usuario.builder()
                .username("oficial.sag")
                .password(passwordEncoder.encode("Sag2024!"))
                .nombreCompleto("Carlos Muñoz Vega")
                .email("cmunoz@sag.cl")
                .rol(RolUsuario.ROLE_OFICIAL_SAG)
                .rut("55.555.555-5")
                .cargo("Oficial SAG")
                .activo(true)
                .build());

        log.info("👤 Usuarios creados: admin | supervisor | oficial.aduana | oficial.pdi | oficial.sag");
        log.info("🔑 Contraseñas: Admin2024! | Super2024! | Aduana2024! | Pdi2024! | Sag2024!");
    }
}
