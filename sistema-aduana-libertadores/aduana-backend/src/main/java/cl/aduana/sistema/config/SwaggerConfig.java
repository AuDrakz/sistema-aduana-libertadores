package cl.aduana.sistema.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import io.swagger.v3.oas.models.servers.Server;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;

@Configuration
public class SwaggerConfig {

    @Bean
    public OpenAPI customOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("Sistema Integrado de Control Fronterizo - Paso Los Libertadores")
                        .version("1.0.0")
                        .description("""
                                API REST del **Servicio Nacional de Aduanas de Chile** para la gestión 
                                del Paso Fronterizo Los Libertadores (Chile - Argentina).
                                
                                **Módulos disponibles:**
                                - 🚗 **Vehículos**: Salida temporal con control de 180/90 días
                                - 👶 **Menores de Edad**: Validación de autorizaciones notariales
                                - 🌿 **SAG**: Declaraciones juradas de alimentos y mascotas
                                - 📊 **Reportes**: Exportación a Excel y PDF
                                
                                **Autenticación:** Bearer JWT — Obtener token en `/auth/login`
                                """)
                        .contact(new Contact()
                                .name("Servicio Nacional de Aduanas")
                                .url("https://www.aduana.cl")
                                .email("soporte.sistemas@aduana.cl"))
                        .license(new License()
                                .name("Uso Interno - Gobierno de Chile")
                                .url("https://www.aduana.cl")))
                .servers(List.of(
                        new Server().url("http://localhost:8080/api").description("Desarrollo Local"),
                        new Server().url("https://api.aduana.cl").description("Producción")))
                .addSecurityItem(new SecurityRequirement().addList("Bearer Authentication"))
                .components(new Components()
                        .addSecuritySchemes("Bearer Authentication",
                                new SecurityScheme()
                                        .type(SecurityScheme.Type.HTTP)
                                        .scheme("bearer")
                                        .bearerFormat("JWT")
                                        .description("Ingresa el token JWT obtenido en /auth/login")));
    }
}
