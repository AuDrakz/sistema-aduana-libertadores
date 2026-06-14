# Sistema Integrado de Control Fronterizo
### Paso Los Libertadores — Servicio Nacional de Aduanas de Chile

> Proyecto desarrollado para el curso **Desarrollo Fullstack I — DSY1103**  
> Escuela de Informática y Telecomunicaciones — DuocUC

---

## ¿Qué es este sistema?

Plataforma web full-stack que digitaliza y automatiza los procesos del Paso Fronterizo
Los Libertadores (Chile - Argentina), integrando Aduanas, PDI y SAG en una sola aplicación.

---

## Tecnologías utilizadas

| Capa       | Tecnología                                           |
|------------|------------------------------------------------------|
| Backend    | Java 17 · Spring Boot 3.3 · Spring Security · JWT    |
| Base datos | MySQL 8                                              |
| Frontend   | React 18 · Vite · CSS Variables · Recharts           |
| Reportes   | Apache POI (Excel) · iText 8 (PDF)                   |
| Docs API   | Swagger / OpenAPI 3                                  |

---

## Módulos del sistema

| Módulo | Descripción |
|--------|-------------|
|  **Vehículos** | Salida/admisión temporal. Valida plazo máximo de 180 días (90 para diplomáticos) |
|  **Menores de Edad** | Verifica automáticamente si se requiere autorización notarial según situación de viaje |
|  **SAG** | Declaración jurada de alimentos, productos animales/vegetales y mascotas |
|  **Reportes** | Dashboard en tiempo real + exportación a Excel y PDF con diseño institucional |

---

## Requisitos previos

- [Java 17+](https://adoptium.net) — descargar versión **Temurin 17 LTS**
- [Maven 3.9+](https://maven.apache.org) — necesario para compilar el backend
- [MySQL 8+](https://dev.mysql.com/downloads) — asegurarse de que corra en el **puerto 3307**
- [Node.js 20 LTS+](https://nodejs.org) — incluye npm, necesario para el frontend

---

## Instalación y ejecución

### 1. Crear base de datos

```sql
CREATE DATABASE aduana_libertadores
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;
```

### 2. Configurar backend

Abrir el archivo `aduana-backend/src/main/resources/application.properties`
con cualquier editor de texto (Bloc de notas, VS Code, IntelliJ, etc.)
y modificar **solo estas dos líneas** según tu entorno local:

```properties
spring.datasource.url=jdbc:mysql://localhost:3307/aduana_libertadores?useSSL=false&serverTimezone=America/Santiago&allowPublicKeyRetrieval=true&characterEncoding=UTF-8
spring.datasource.password=TU_PASSWORD_MYSQL
```

> **Nota sobre el puerto:** El proyecto usa el puerto **3307** para MySQL
> (en lugar del 3306 por defecto). Si tu MySQL corre en otro puerto,
> cámbialo en la línea `spring.datasource.url` donde dice `localhost:3307`.
> Puedes verificar el puerto de tu MySQL abriendo MySQL Workbench →
> ver la conexión configurada.

### 3. Levantar backend

```bash
cd aduana-backend
mvn spring-boot:run
```

> Las tablas y usuarios se crean automáticamente al primer inicio.  
> API disponible en: http://localhost:8080/api  
> Swagger UI en: http://localhost:8080/api/swagger-ui.html

### 4. Levantar frontend

```bash
cd aduana-frontend
npm install
npm run dev
```

> Frontend disponible en: http://localhost:3000

---

## Usuarios del sistema (creados automáticamente)

| Usuario | Contraseña | Rol | Módulos disponibles |
|---|---|---|---|
| `admin` | `Admin2024!` | Administrador | Todo el sistema |
| `supervisor` | `Super2024!` | Supervisor | Todo + Reportes |
| `oficial.aduana` | `Aduana2024!` | Oficial Aduana | Vehículos |
| `oficial.pdi` | `Pdi2024!` | Oficial PDI | Menores de Edad |
| `oficial.sag` | `Sag2024!` | Oficial SAG | Declaraciones SAG |

---

## Estructura del proyecto

```
sistema-aduana-libertadores/
├── aduana-backend/          # Spring Boot - API REST
│   └── src/main/java/cl/aduana/sistema/
│       ├── config/          # SecurityConfig, SwaggerConfig, DataInitializer
│       ├── controller/      # 6 controladores REST
│       ├── dto/             # Objetos de transferencia de datos
│       ├── exception/       # Manejo global de errores
│       ├── model/           # 7 entidades JPA + enums
│       ├── repository/      # Repositorios JPA con queries optimizadas
│       ├── security/        # JWT Filter, UserDetailsService
│       └── service/         # Lógica de negocio y reglas
│
└── aduana-frontend/         # React 18 + Vite
    └── src/
        ├── api/             # Axios client + servicios por módulo
        ├── components/      # Componentes reutilizables + Layout
        ├── context/         # AuthContext (estado global)
        └── pages/           # Login, Dashboard, Vehículos, Menores, SAG, Reportes
```

---

## Reglas de negocio implementadas

- **Vehículos:** El sistema rechaza automáticamente si el plazo solicitado supera 180 días (o 90 para diplomáticos). Detecta vehículos vencidos y próximos a vencer.
- **Menores:** Determina automáticamente si se requiere autorización notarial según la situación de viaje. Rechaza el trámite si el documento es requerido pero no se presenta.
- **SAG:** Menores de edad requieren representante mayor de 18 para firmar. Activa inspección automáticamente cuando hay productos declarados.
- **Seguridad:** Control de acceso por rol en cada endpoint. Tokens JWT con expiración de 24 horas.

---

## Guía de pruebas funcionales

Esta sección explica exactamente cómo probar cada módulo del sistema desde cero,
incluyendo los datos necesarios para registrar personas y comprobar las reglas de negocio.

> **Importante:** El backend debe estar corriendo en `http://localhost:8080/api`
> antes de realizar cualquier prueba desde el frontend.

---

### PASO PREVIO — Registrar personas de prueba

Antes de probar cualquier módulo necesitas tener personas registradas.
Hay dos formas de hacerlo:

#### Opción A: Desde Swagger UI (recomendado para pruebas)

1. Abrir `http://localhost:8080/api/swagger-ui.html` en el navegador
2. Buscar la sección **"Autenticación"** → endpoint `POST /auth/login`
3. Click en **"Try it out"** → pegar este body y click **"Execute"**:
   ```json
   { "username": "admin", "password": "Admin2024!" }
   ```
4. Copiar el valor del campo `token` que aparece en la respuesta
5. Click en el botón **"Authorize"**  (arriba a la derecha en Swagger)
6. Pegar el token en el campo y click **"Authorize"**
7. Ahora usar el endpoint `POST /personas` con los JSON de abajo

**Persona adulta (para usar como titular de vehículo o acompañante):**
```json
{
  "nombres": "Juan Carlos",
  "apellidos": "González Pérez",
  "fechaNacimiento": "1985-03-15",
  "nacionalidad": "Chilena",
  "tipoDocumento": "CEDULA_IDENTIDAD",
  "numeroDocumento": "12345678-9",
  "telefono": "+56912345678",
  "email": "juan.gonzalez@email.com"
}
```

**Persona menor de edad (para probar módulo de Menores):**
```json
{
  "nombres": "Sofía Valentina",
  "apellidos": "González Pérez",
  "fechaNacimiento": "2012-07-22",
  "nacionalidad": "Chilena",
  "tipoDocumento": "CEDULA_IDENTIDAD",
  "numeroDocumento": "23456789-0",
  "telefono": "",
  "email": ""
}
```

**Segundo adulto (para usar como padre/madre que no acompaña):**
```json
{
  "nombres": "María Isabel",
  "apellidos": "Pérez Rojas",
  "fechaNacimiento": "1987-11-08",
  "nacionalidad": "Chilena",
  "tipoDocumento": "CEDULA_IDENTIDAD",
  "numeroDocumento": "13456789-1",
  "telefono": "+56987654321",
  "email": "maria.perez@email.com"
}
```

#### Opción B: Desde el frontend (alternativa)

El frontend no tiene formulario para registrar personas directamente.
Cuando en cualquier módulo buscas un documento que no existe, el sistema
muestra el mensaje "Persona no encontrada". En ese caso debes registrarla
primero usando la Opción A (Swagger) y luego volver al módulo.

---

### PRUEBA 1 — Módulo de Vehículos  (regla de 180 días)

**Login requerido:** `oficial.aduana / Aduana2024!`

**Caso exitoso — salida normal:**
1. Ir al módulo **Vehículos** → click **"Nueva declaración"**
2. Buscar persona por documento: `12345678-9`
3. Completar el formulario:
   - Patente: `ABCD12`
   - Marca: `Toyota`
   - Modelo: `Hilux`
   - Año: `2022`
   - Tipo: `CAMIONETA`
   - País matrícula: `Chile`
   - Tipo cruce: `SALIDA`
   - Fecha salida: *(fecha de hoy)*
   - Retorno estimado: *(fecha de hoy + 30 días)*
4. Click **"Registrar declaración"**
5.  Resultado esperado: declaración creada con número de formulario VEH-XXXXXXXX

**Caso de error — plazo excedido (valida la regla de negocio):**
1. Mismo formulario pero en **Retorno estimado** poner una fecha a más de 180 días
2.  Resultado esperado: error con mensaje _"El plazo solicitado (XXX días) supera el máximo permitido (180 días corridos)"_

**Caso diplomático:**
1. Marcar checkbox **"Vehículo diplomático"**
2. Poner retorno estimado a más de 90 días
3.  Resultado esperado: error indicando que supera los 90 días

---

### PRUEBA 2 — Módulo de Menores  (regla de autorización notarial)

**Login requerido:** `oficial.pdi / Pdi2024!`

**Caso A — Menor viaja con ambos padres (sin notarial):**
1. Ir al módulo **Menores** → click **"Nueva declaración"**
2. Buscar menor por documento: `23456789-0`
3. El sistema muestra su edad automáticamente (13 años) — confirma que es menor
4. Situación de viaje: `Viaja con AMBOS padres/tutores`
5. Tipo cruce: `SALIDA`
6. Fecha de viaje: *(fecha de hoy)*
7. País de destino: `Argentina`
8.  Resultado esperado: la sección de autorización notarial **no aparece** y la declaración se aprueba automáticamente

**Caso B — Menor viaja SOLO (requiere notarial):**
1. Nueva declaración con el mismo menor
2. Situación de viaje: `Viaja SOLO (sin acompañante adulto)`
3. Aparece alerta amarilla **"Esta situación REQUIERE autorización notarial"**
4. Si NO marcas el checkbox de autorización y das registrar:
   -  Resultado esperado: error _"Se requiere autorización notarial para esta situación de viaje"_
5. Si SÍ marcas el checkbox y completas notaría:
   - Notaría nombre: `Notaría Primera de Santiago`
   - Ciudad: `Santiago`
   - N° escritura: `4521-2024`
   - Fecha autorización: *(fecha reciente)*
   - Resultado esperado: declaración aprobada

**Caso C — Menor viaja con UN solo padre (requiere notarial del otro):**
1. Nueva declaración con el menor
2. Situación: `Viaja con UN solo padre/madre`
3. Aparece sección **"Datos del padre/madre que NO acompaña"**
4. Si intentas registrar SIN completar esos datos:
   -  Resultado esperado: error _"Debe registrar los datos del padre/madre que no acompaña"_
5. Completar con nombre del otro progenitor: `María Isabel Pérez Rojas`
6. Completar notaría y registrar
   -  Resultado esperado: declaración aprobada

**Caso D — Persona adulta en módulo de menores (error esperado):**
1. Buscar la persona adulta: `12345678-9` (nacida en 1985)
2.  Resultado esperado: error _"Juan Carlos González tiene 40 años. Este módulo solo aplica a menores de 18 años"_

---

### PRUEBA 3 — Módulo SAG  (regla de representante para menores)

**Login requerido:** `oficial.sag / Sag2024!`

**Caso A — Adulto declara sin productos:**
1. Ir al módulo **SAG** → click **"Nueva declaración"**
2. Buscar viajero: `12345678-9`
3. Tipo cruce: `ENTRADA`
4. Fecha: *(hoy)*
5. No marcar ningún producto
6.  Resultado esperado: declaración registrada sin inspección requerida

**Caso B — Adulto declara mascota:**
1. Nueva declaración con el adulto
2. Marcar checkbox **"Mascotas / Animales Vivos"**
3. Click **"+ Agregar mascota"**:
   - Especie: `Perro`
   - Raza: `Labrador`
   - Nombre: `Max`
   - Microchip: `123456789`
   - Marcar: vacuna antirrábica ✓ y certificado de salud ✓
4.  Resultado esperado: declaración registrada con **inspección requerida = Sí** (ícono ⚠️ en la tabla)

**Caso C — Menor intenta declarar sin representante (error esperado):**
1. Buscar viajero: `23456789-0` (el menor)
2. El sistema detecta que es menor y muestra alerta naranja
3. Si intentas registrar SIN buscar representante:
   -  Resultado esperado: error _"El viajero es menor de edad. Un representante mayor de 18 años debe firmar la declaración SAG"_
4. Buscar representante: `12345678-9`
5.  Resultado esperado: declaración registrada correctamente

---

### PRUEBA 4 — Reportes  (solo Admin/Supervisor)

**Login requerido:** `admin / Admin2024!` o `supervisor / Super2024!`

1. Ir al módulo **Reportes**
2. **Excel:** seleccionar rango de fechas (desde hace 7 días hasta hoy) → click **"Descargar Excel"**
   -  Resultado esperado: se descarga archivo `.xlsx` con los cruces del período
3. **PDF:** dejar el año actual → click **"Descargar PDF"**
   -  Resultado esperado: se descarga informe estadístico con diseño institucional

**Verificar que oficial.aduana NO puede acceder a reportes:**
1. Iniciar sesión con `oficial.aduana / Aduana2024!`
2. El módulo **Reportes** no aparece en el menú lateral
3. Si se accede directamente a `/reportes`:
   -  Resultado esperado: pantalla de acceso restringido 🔒

---

### PRUEBA 5 — Dashboard 

**Login requerido:** cualquier usuario

1. Ir al **Dashboard**
2. Registrar algunas declaraciones en otros módulos primero
3.  Resultado esperado: los KPIs de "Entradas hoy" y "Salidas hoy" se actualizan
4. Si hay vehículos vencidos, aparece la tabla roja en la parte inferior del dashboard
5. Las alertas del panel derecho muestran contadores en tiempo real

---

### Resumen de números de documento para pruebas rápidas

| Documento | Persona | Edad | Usar en |
|---|---|---|---|
| `12345678-9` | Juan Carlos González (adulto) | 40 años | Vehículos, SAG representante, acompañante |
| `23456789-0` | Sofía Valentina González (menor) | 13 años | Menores, SAG con representante |
| `13456789-1` | María Isabel Pérez (adulto) | 37 años | Padre/madre que no acompaña |

