package cl.aduana.sistema.dto;

import cl.aduana.sistema.model.enums.RolUsuario;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class LoginResponse {
    private String token;
    private String username;
    private String nombreCompleto;
    private RolUsuario rol;
    private long expiresIn;
}
