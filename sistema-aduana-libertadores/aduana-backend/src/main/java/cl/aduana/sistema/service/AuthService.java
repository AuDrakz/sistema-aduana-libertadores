package cl.aduana.sistema.service;

import cl.aduana.sistema.dto.LoginRequest;
import cl.aduana.sistema.dto.LoginResponse;
import cl.aduana.sistema.model.Usuario;
import cl.aduana.sistema.repository.UsuarioRepository;
import cl.aduana.sistema.security.JwtService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthService {

    private final AuthenticationManager authManager;
    private final UserDetailsService userDetailsService;
    private final JwtService jwtService;
    private final UsuarioRepository usuarioRepository;

    @Transactional
    public LoginResponse login(LoginRequest request) {
        // Spring Security valida las credenciales; lanza BadCredentialsException si falla
        authManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword()));

        UserDetails userDetails = userDetailsService.loadUserByUsername(request.getUsername());
        String token = jwtService.generarToken(userDetails);

        // Actualizar último acceso
        usuarioRepository.findByUsername(request.getUsername())
                .ifPresent(u -> {
                    usuarioRepository.actualizarUltimoAcceso(u.getId(), LocalDateTime.now());
                    log.info("Login exitoso: {} [{}]", u.getUsername(), u.getRol());
                });

        Usuario usuario = usuarioRepository.findByUsername(request.getUsername()).orElseThrow();

        return LoginResponse.builder()
                .token(token)
                .username(usuario.getUsername())
                .nombreCompleto(usuario.getNombreCompleto())
                .rol(usuario.getRol())
                .expiresIn(86400000L)
                .build();
    }
}
