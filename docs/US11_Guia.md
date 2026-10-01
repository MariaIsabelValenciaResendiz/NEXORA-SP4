# Guía de implementación US11 en NEXORA

Esta guía desarrolla únicamente US11, listar todos los usuarios registrados, sobre la rama SP4 de NEXORA-SP4. Incluye el código completo, las rutas exactas, la explicación de cada archivo, pruebas y commits por capa. Angular consume la API propia de NEXORA; no se consulta Fake Store API. El backend conserva los cuatro proyectos de arquitectura hexagonal y el frontend utiliza Model, View y ViewModel mediante services.

## 1 Revisión del repositorio

Repositorio revisado: https://github.com/MariaIsabelValenciaResendiz/NEXORA-SP4.git

Base verificada el 1 de octubre de 2026: SP4 en `28f035bbbc01fb7377062450c1a111d5a5ed7916`. SP4 integra el carrito US09. DEV y QA apuntaban a `806865d`; main a `50cce60`. El código nuevo debe partir de SP4, no de main, DEV ni QA.

La solución real es `backend/NEXORA.slnx`, no NEXORA.sln. Los cuatro proyectos ya están creados y apuntan a net10.0. Usuario.cs, IUsuarioRepository.cs, UsuarioService.cs, UsuarioRepositoryMemoria.cs y UsuariosController.cs están en la raíz de sus proyectos. La funcionalidad de carrito utiliza Entities, Interfaces, UseCases, Repositories y una carpeta de feature en Angular. Esta implementación reutiliza las clases existentes en su lugar y sigue esas carpetas para las clases nuevas.

El GET original /api/usuarios devuelve Id, Nombre, Contrasena y Rol, insuficientes para US11 y con información que no debe aparecer en el directorio. Se amplía la entidad sin borrar campos y se usa un DTO de lectura sin contraseña. Se conservan los métodos existentes y se agregan puertos específicos para no obligar al directorio a conocer métodos de escritura.

La rama `Task-01-Login` existe pero todavía no está integrada en SP4. En ella, AuthService guarda `{ id, nombre, contrasena, rol }` en `sessionStorage["usuario"]`. SP4 tiene otro dato, `nexora-rol-demo`, que solo cambia el rol del carrito. US11 lee la primera sesión e ignora el selector demo.

**Dependencia de autenticación:** para cumplir los permisos del lado de la API sin hacer US01, se incluye un adaptador Basic que comprueba las credenciales contra el repositorio en memoria. Reutiliza el contrato de sesión encontrado en la rama de login. La demo actual guarda contraseñas en claro y usa HTTP local; es una limitación heredada de la base académica. Basic codifica, no cifra: fuera de localhost requiere HTTPS. Cuando el equipo implemente tokens o cookies, debe sustituir este adaptador y el envío de Authorization; los DTO, la pantalla y el caso de uso pueden mantenerse. Esta entrega no implementa un login nuevo ni integra la rama de otro integrante.

La restricción del POST existente a Admin impide que una petición anónima cree su propia cuenta privilegiada. Es un ajuste del endpoint preexistente necesario para la protección, no una pantalla o historia nueva de creación de usuarios.

## 2 Qué cumple la historia

| Criterio | Implementación |
|---|---|
| Lista para Administrador y Auditor | GET /users y tarjetas con nombre, correo, teléfono y usuario |
| Cliente no ve Usuarios | Enlace condicionado por la sesión de login |
| Cliente no abre enlaces profundos | CanMatch y CanActivate redirigen a acceso-restringido |
| API rechaza acceso no autorizado | 401 sin credenciales, 403 para Cliente, rol comprobado en servidor |
| Carga de datos | Signal cargando y spinner con role status |
| Interrupción y reintento | Signal error, alerta, timeout y botón Reintentar |
| Objetos anidados seguros | Dirección y coordenadas modeladas y normalizadas ante valores nulos |
| Solo lectura | No hay botones de crear, editar ni borrar usuarios |

El documento adjunto menciona Fake Store API. Tu instrucción de crear el backend propio sustituye esa referencia. El contrato propio conserva Nombre como texto completo porque así está diseñada la entidad existente; no copiamos el objeto name de Fake Store. La dirección sí conserva una estructura anidada.

## 3 IDE y herramientas

Usa **Visual Studio Code**, tal como acordó el equipo. Instala C# Dev Kit de Microsoft y Angular Language Service. REST Client es opcional para ejecutar US11.http. No necesitas crear proyectos nuevos ni instalar un CLI de Angular global.

Instala el SDK de .NET 10, Git y Node.js compatible con Angular 22. Se verificó esta solución con Node 24.19.0 y SDK .NET 10.0.401. `package.json` ya solicita Angular 22.2 y TypeScript 6.0; no cambiamos esas versiones ni package-lock.json. Usa el lockfile con npm ci.

Verifica en la terminal:

```powershell
dotnet --list-sdks
node --version
npm --version
git --version
```

Fuentes oficiales para instalar y verificar requisitos:

- https://code.visualstudio.com/docs/languages/csharp
- https://dotnet.microsoft.com/download/dotnet/10.0
- https://angular.dev/reference/versions
- https://angular.dev/guide/routing/route-guards
- https://learn.microsoft.com/aspnet/core/security/authorization/roles?view=aspnetcore-10.0

## 4 Abrir el proyecto y crear tu rama

Abre una terminal en la carpeta donde guardas tus proyectos. Si todavía no clonaste el repositorio:

```powershell
git clone https://github.com/MariaIsabelValenciaResendiz/NEXORA-SP4.git
cd NEXORA-SP4
git fetch origin
git switch SP4
git pull --ff-only origin SP4
git switch -c Task-11-listar-usuarios
code .
```

Si ya lo tienes, abre la carpeta raíz NEXORA-SP4 en VS Code y revisa primero `git status`. Conserva o confirma cualquier trabajo pendiente antes de cambiar de rama. Con el árbol limpio ejecuta:

```powershell
git fetch origin
git switch SP4
git pull --ff-only origin SP4
git switch -c Task-11-listar-usuarios
```

Si esa rama ya existe, usa `git switch Task-11-listar-usuarios` y revisa su base antes de continuar. No necesitas recrear DEV, QA ni SP4; ya existen en el remoto. Los comandos de commit de esta guía se ejecutan siempre desde la raíz NEXORA-SP4.

## 5 Aplicar el código

Elige una forma de aplicar los mismos cambios:

**Manual:** en las secciones siguientes crea cada archivo marcado como nuevo y pega su contenido completo; para los existentes, modifica solo las partes indicadas o reemplaza el contenido completo si todavía coincide con la base revisada. Haz el commit al terminar cada capa.

**Con el parche del paquete:** extrae el ZIP fuera de tu repositorio. Desde la raíz del repositorio, reemplaza la ruta de ejemplo por la ubicación real de tu extracción:

```powershell
git apply --check "C:/Users/TU_USUARIO/Downloads/NEXORA_US11_Cambios/US11.patch"
git apply "C:/Users/TU_USUARIO/Downloads/NEXORA_US11_Cambios/US11.patch"
```

El parche agrega o modifica solo los archivos de US11. Si `--check` falla, tu base ya cambió: compara los archivos y aplica las adiciones conservando el trabajo del equipo. No fuerces el parche ni reemplaces toda la carpeta frontend. Después de aplicarlo puedes ejecutar los commits de cada capa en el orden de esta guía, ya que cada git add selecciona archivos específicos.

El ZIP también incluye `archivos/backend` y `archivos/frontend` con las rutas correspondientes. Son los archivos modificados completos para consultarlos; usa el parche para detectar diferencias con tu copia. No copies la carpeta `archivos` como un proyecto adicional y no combines la aplicación del parche con una segunda aplicación manual.

## 6 Flujo entre frontend y backend

La vista invoca UsuariosService.cargar. El ViewModel toma la sesión de login, envía GET /users con HttpClient y actualiza las Signals. En la API, el adaptador de autenticación comprueba las credenciales con IAccesoUsuarios y Authorize comprueba el rol. El controller delega a IListarUsuarios, el caso de uso consulta IConsultaUsuarios y el repositorio en memoria devuelve las entidades. Application las convierte al DTO sin contraseñas y Angular las normaliza para mostrarlas.

Solo API conoce HTTP y los middleware. Application conoce sus interfaces y Domain. Infrastructure implementa las interfaces. Domain no referencia proyectos externos. Frontend y backend siguen siendo las dos aplicaciones del monolito que describiste.

## 7 Implementar Domain

### 7.1 Modificar archivo existente

Ruta exacta: `backend/NEXORA.Domain/Usuario.cs`

Ya existe. Añade los datos que faltan para el directorio y conserva Id, Nombre, Contrasena, Rol y los constructores usados por el equipo. Nombre representa el nombre completo; NombreUsuario identifica la cuenta. No crees una segunda entidad Usuario en Entities.

Pega este contenido completo:

```csharp
namespace NEXORA.Domain;

public class Usuario
{
    public int Id { get; set; }
    public string Nombre { get; set; } = string.Empty;
    public string Contrasena { get; set; } = string.Empty;
    public string Rol { get; set; } = string.Empty;
    public string Correo { get; set; } = string.Empty;
    public string Telefono { get; set; } = string.Empty;
    public string NombreUsuario { get; set; } = string.Empty;
    public DireccionUsuario Direccion { get; set; } = new();

    public Usuario() { }

    public Usuario(int id, string nombre, string contrasena, string rol)
    {
        Id = id;
        Nombre = nombre;
        Contrasena = contrasena;
        Rol = rol;
    }
}
```

### 7.2 Crear archivo nuevo

Ruta exacta: `backend/NEXORA.Domain/DireccionUsuario.cs`

Crea este archivo junto a Usuario.cs. Sus clases representan dirección y coordenadas anidadas. Solo contienen datos; no importan HTTP, Angular ni repositorios. Los valores iniciales permiten representar una dirección todavía no registrada.

Pega este contenido completo:

```csharp
namespace NEXORA.Domain;

public class DireccionUsuario
{
    public string Ciudad { get; set; } = string.Empty;
    public string Calle { get; set; } = string.Empty;
    public int Numero { get; set; }
    public string CodigoPostal { get; set; } = string.Empty;
    public CoordenadasUsuario Geolocalizacion { get; set; } = new();
}

public class CoordenadasUsuario
{
    public string Latitud { get; set; } = string.Empty;
    public string Longitud { get; set; } = string.Empty;
}
```

Al terminar esta capa, desde la raíz del repositorio:

```powershell
git add backend/NEXORA.Domain/Usuario.cs backend/NEXORA.Domain/DireccionUsuario.cs
git commit -m "feat(domain): completa datos del directorio de usuarios"
```

## 8 Implementar Application

### 8.1 Crear archivo nuevo

Ruta exacta: `backend/NEXORA.Application/Interfaces/IConsultaUsuarios.cs`

Crea este puerto pequeño de lectura. Expone Listar y ObtenerPorId; el caso de uso no necesita permisos de escritura.

Pega este contenido completo:

```csharp
using NEXORA.Domain;

namespace NEXORA.Application.Interfaces;

public interface IConsultaUsuarios
{
    IReadOnlyList<Usuario> Listar();
    Usuario? ObtenerPorId(int id);
}
```

### 8.2 Crear archivo nuevo

Ruta exacta: `backend/NEXORA.Application/Interfaces/IAccesoUsuarios.cs`

Crea el puerto que permite comprobar credenciales contra los datos de NEXORA. La API conoce este contrato; Infrastructure decide cómo buscar las cuentas.

Pega este contenido completo:

```csharp
using NEXORA.Domain;

namespace NEXORA.Application.Interfaces;

public interface IAccesoUsuarios
{
    Usuario? Autenticar(string nombre, string contrasena);
}
```

### 8.3 Crear archivo nuevo

Ruta exacta: `backend/NEXORA.Application/Interfaces/IListarUsuarios.cs`

Crea la interfaz del caso de uso. El controller recibe esta interfaz mediante constructor, sin instanciar el caso de uso con new.

Pega este contenido completo:

```csharp
using NEXORA.Application.Models;

namespace NEXORA.Application.Interfaces;

public interface IListarUsuarios
{
    IReadOnlyList<UsuarioLectura> Ejecutar();
    UsuarioLectura? Buscar(int id);
}
```

### 8.4 Crear archivo nuevo

Ruta exacta: `backend/NEXORA.Application/Models/UsuarioLectura.cs`

Crea el DTO de respuesta. Es la forma de los datos que viajan al frontend. Omite Contrasena y Rol deliberadamente; esos datos no son necesarios para auditar el directorio. Usar un DTO evita devolver la entidad de autenticación completa.

Pega este contenido completo:

```csharp
using NEXORA.Domain;

namespace NEXORA.Application.Models;

public sealed record UsuarioLectura(
    int Id,
    string Nombre,
    string Correo,
    string Telefono,
    string NombreUsuario,
    DireccionUsuario Direccion);
```

### 8.5 Crear archivo nuevo

Ruta exacta: `backend/NEXORA.Application/UseCases/ListarUsuarios.cs`

Crea el caso de uso. Consulta IConsultaUsuarios y transforma las entidades en UsuarioLectura. Aquí se prepara la respuesta de lectura, fuera del controller. Buscar reutiliza el mismo contrato para el GET por ID que ya existía.

Pega este contenido completo:

```csharp
using NEXORA.Application.Interfaces;
using NEXORA.Application.Models;
using NEXORA.Domain;

namespace NEXORA.Application.UseCases;

public sealed class ListarUsuarios(IConsultaUsuarios repositorio) : IListarUsuarios
{
    public IReadOnlyList<UsuarioLectura> Ejecutar()
    {
        return repositorio.Listar().Select(Mapear).ToArray();
    }

    public UsuarioLectura? Buscar(int id)
    {
        var usuario = repositorio.ObtenerPorId(id);
        return usuario is null ? null : Mapear(usuario);
    }

    public static UsuarioLectura Mapear(Usuario usuario)
    {
        return new UsuarioLectura(
            usuario.Id,
            usuario.Nombre ?? string.Empty,
            usuario.Correo ?? string.Empty,
            usuario.Telefono ?? string.Empty,
            usuario.NombreUsuario ?? string.Empty,
            usuario.Direccion ?? new DireccionUsuario());
    }
}
```

Al terminar esta capa, desde la raíz del repositorio:

```powershell
git add backend/NEXORA.Application/Interfaces/IConsultaUsuarios.cs backend/NEXORA.Application/Interfaces/IAccesoUsuarios.cs backend/NEXORA.Application/Interfaces/IListarUsuarios.cs backend/NEXORA.Application/Models/UsuarioLectura.cs backend/NEXORA.Application/UseCases/ListarUsuarios.cs
git commit -m "feat(application): agrega puertos y caso de uso de lectura de usuarios"
```

## 9 Implementar Infrastructure

### 9.1 Modificar archivo existente

Ruta exacta: `backend/NEXORA.Infrastructure/UsuarioRepositoryMemoria.cs`

Modifica el repositorio existente, no crees una lista paralela de cuentas. Conserva las tres cuentas originales y sus credenciales; agrega los campos del directorio y una cuenta Auditor. Implementa las dos interfaces nuevas además de IUsuarioRepository. El candado protege la lista compartida durante accesos concurrentes. Sus datos se reinician al cerrar la API.

Pega este contenido completo:

```csharp
using NEXORA.Application;
using NEXORA.Application.Interfaces;
using NEXORA.Domain;

namespace NEXORA.Infrastructure;

public class UsuarioRepositoryMemoria : IUsuarioRepository, IConsultaUsuarios, IAccesoUsuarios
{
    private readonly object _candado = new();
    // Datos "crudos" — simulan la base de datos mientras no hay una real
    private readonly List<Usuario> _usuarios = new()
    {
        new Usuario(1, "María Isabel", "clave123", "admin")
        {
            Correo = "maria@nexora.mx", Telefono = "55 0102 7788", NombreUsuario = "maria.admin",
            Direccion = new DireccionUsuario
            {
                Ciudad = "San Juan del Río", Calle = "Centro", Numero = 10, CodigoPostal = "76800",
                Geolocalizacion = new CoordenadasUsuario { Latitud = "20.388", Longitud = "-99.996" }
            }
        },
        new Usuario(2, "Juan Pérez", "clave456", "cliente")
        {
            Correo = "juan@nexora.mx", Telefono = "55 0102 7790", NombreUsuario = "juan.p"
        },
        new Usuario(3, "Ana López", "clave789", "cliente")
        {
            Correo = "ana@nexora.mx", Telefono = "55 0102 7791", NombreUsuario = "ana.l"
        },
        new Usuario(4, "Laura Méndez", "auditor123", "auditor")
        {
            Correo = "laura@nexora.mx", Telefono = "55 0102 7792", NombreUsuario = "laura.m"
        }
    };

    public List<Usuario> ObtenerTodos()
    {
        lock (_candado) return _usuarios.ToList();
    }

    public IReadOnlyList<Usuario> Listar()
    {
        lock (_candado) return _usuarios.ToArray();
    }

    public Usuario? ObtenerPorId(int id)
    {
        lock (_candado) return _usuarios.FirstOrDefault(u => u.Id == id);
    }

    public Usuario? Autenticar(string nombre, string contrasena)
    {
        lock (_candado)
        {
            return _usuarios.FirstOrDefault(u =>
                (string.Equals(u.Nombre, nombre, StringComparison.OrdinalIgnoreCase) ||
                 string.Equals(u.NombreUsuario, nombre, StringComparison.OrdinalIgnoreCase)) &&
                u.Contrasena == contrasena);
        }
    }

    public void Agregar(Usuario usuario)
    {
        lock (_candado)
        {
            usuario.Id = _usuarios.Count > 0 ? _usuarios.Max(u => u.Id) + 1 : 1;
            _usuarios.Add(usuario);
        }
    }
}
```

Al terminar esta capa, desde la raíz del repositorio:

```powershell
git add backend/NEXORA.Infrastructure/UsuarioRepositoryMemoria.cs
git commit -m "feat(infrastructure): adapta repositorio en memoria para US11"
```

## 10 Implementar API

### 10.1 Crear archivo nuevo

Ruta exacta: `backend/NEXORA.API/Authentication/UsuariosBasicHandler.cs`

Crea el adaptador HTTP de autenticación. Decodifica el encabezado Authorization, consulta IAccesoUsuarios y construye la identidad con el rol que encontró en el servidor. No toma el rol de un encabezado inventado ni del JSON enviado por Angular. Este adaptador permite probar US11 con la sesión académica de Task-01-Login; no agrega una pantalla ni un endpoint de login.

Pega este contenido completo:

```csharp
using System.Net.Http.Headers;
using System.Security.Claims;
using System.Text;
using System.Text.Encodings.Web;
using Microsoft.AspNetCore.Authentication;
using Microsoft.Extensions.Options;
using NEXORA.Application.Interfaces;

namespace NEXORA.API.Authentication;

// Adaptador para la sesión académica existente. Usar HTTPS fuera de localhost.
public sealed class UsuariosBasicHandler(
    IOptionsMonitor<AuthenticationSchemeOptions> options,
    ILoggerFactory logger,
    UrlEncoder encoder,
    IAccesoUsuarios acceso) : AuthenticationHandler<AuthenticationSchemeOptions>(options, logger, encoder)
{
    public const string NombreEsquema = "UsuariosBasic";

    protected override Task<AuthenticateResult> HandleAuthenticateAsync()
    {
        var authorization = Request.Headers.Authorization.ToString();
        if (string.IsNullOrWhiteSpace(authorization))
            return Task.FromResult(AuthenticateResult.NoResult());

        if (!AuthenticationHeaderValue.TryParse(authorization, out var header) ||
            !string.Equals(header.Scheme, "Basic", StringComparison.OrdinalIgnoreCase) ||
            string.IsNullOrWhiteSpace(header.Parameter))
            return Task.FromResult(AuthenticateResult.Fail("Credenciales inválidas."));

        try
        {
            var credenciales = Encoding.UTF8.GetString(Convert.FromBase64String(header.Parameter));
            var separador = credenciales.IndexOf(':');
            if (separador <= 0)
                return Task.FromResult(AuthenticateResult.Fail("Credenciales inválidas."));

            var usuario = acceso.Autenticar(credenciales[..separador], credenciales[(separador + 1)..]);
            if (usuario is null)
                return Task.FromResult(AuthenticateResult.Fail("Credenciales inválidas."));

            var claims = new[]
            {
                new Claim(ClaimTypes.NameIdentifier, usuario.Id.ToString()),
                new Claim(ClaimTypes.Name, usuario.Nombre),
                new Claim(ClaimTypes.Role, usuario.Rol.Trim().ToLowerInvariant())
            };
            var principal = new ClaimsPrincipal(new ClaimsIdentity(claims, NombreEsquema));
            return Task.FromResult(AuthenticateResult.Success(new AuthenticationTicket(principal, NombreEsquema)));
        }
        catch (FormatException)
        {
            return Task.FromResult(AuthenticateResult.Fail("Credenciales inválidas."));
        }
    }

    protected override Task HandleChallengeAsync(AuthenticationProperties properties)
    {
        Response.StatusCode = StatusCodes.Status401Unauthorized;
        Response.Headers.WWWAuthenticate = "Basic realm=\"NEXORA Usuarios\", charset=\"UTF-8\"";
        return Task.CompletedTask;
    }
}
```

### 10.2 Modificar archivo existente

Ruta exacta: `backend/NEXORA.API/UsuariosController.cs`

Modifica este controller en su ubicación actual. El GET queda disponible en /users y en /api/usuarios; ambas rutas usan el mismo caso de uso y requieren admin o auditor. El GET por ID también queda protegido. El POST ya existente se limita a admin para impedir crear una cuenta privilegiada sin autorización; no agregamos una funcionalidad de creación a la pantalla. Las respuestas de lectura y registro omiten contraseñas.

Pega este contenido completo:

```csharp
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using NEXORA.Application;
using NEXORA.Application.Interfaces;
using NEXORA.API.Authentication;
using NEXORA.Domain;

namespace NEXORA.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class UsuariosController : ControllerBase
{
    private readonly UsuarioService _usuarioService;
    private readonly IListarUsuarios _listarUsuarios;

    public UsuariosController(UsuarioService usuarioService, IListarUsuarios listarUsuarios)
    {
        _usuarioService = usuarioService;
        _listarUsuarios = listarUsuarios;
    }

    [HttpGet]
    [HttpGet("/users")]
    [Authorize(AuthenticationSchemes = UsuariosBasicHandler.NombreEsquema, Roles = "admin,auditor")]
    [ResponseCache(NoStore = true, Location = ResponseCacheLocation.None)]
    public IActionResult ObtenerTodos()
    {
        return Ok(_listarUsuarios.Ejecutar());
    }

    [HttpGet("{id}")]
    [Authorize(AuthenticationSchemes = UsuariosBasicHandler.NombreEsquema, Roles = "admin,auditor")]
    public IActionResult ObtenerPorId(int id)
    {
        var usuario = _listarUsuarios.Buscar(id);
        if (usuario == null) return NotFound();
        return Ok(usuario);
    }

    [HttpPost]
    [Authorize(AuthenticationSchemes = UsuariosBasicHandler.NombreEsquema, Roles = "admin")]
    public IActionResult Registrar([FromBody] Usuario usuario)
    {
        _usuarioService.Registrar(usuario);
        return CreatedAtAction(nameof(ObtenerPorId), new { id = usuario.Id }, _listarUsuarios.Buscar(usuario.Id));
    }
}
```

### 10.3 Modificar archivo existente

Ruta exacta: `backend/NEXORA.API/Program.cs`

Modifica el registro de dependencias conservando todos los servicios del carrito y la política CORS. Se registra una única instancia del repositorio en memoria y se reutiliza para sus tres interfaces. Scoped creaba una lista nueva por petición; Singleton permite que la simulación conserve cuentas durante la ejecución. Registra el caso de uso por interfaz y los middleware de autenticación y autorización antes de MapControllers.

Pega este contenido completo:

```csharp
using NEXORA.Application.Interfaces;
using NEXORA.Application.UseCases;
using NEXORA.Infrastructure.Repositories;
using NEXORA.API.Authentication;
using Microsoft.AspNetCore.Authentication;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddSingleton<NEXORA.Infrastructure.UsuarioRepositoryMemoria>();
builder.Services.AddSingleton<NEXORA.Application.IUsuarioRepository>(services =>
    services.GetRequiredService<NEXORA.Infrastructure.UsuarioRepositoryMemoria>());
builder.Services.AddSingleton<IConsultaUsuarios>(services =>
    services.GetRequiredService<NEXORA.Infrastructure.UsuarioRepositoryMemoria>());
builder.Services.AddSingleton<IAccesoUsuarios>(services =>
    services.GetRequiredService<NEXORA.Infrastructure.UsuarioRepositoryMemoria>());
builder.Services.AddScoped<NEXORA.Application.UsuarioService>();
builder.Services.AddScoped<IListarUsuarios, ListarUsuarios>();

builder.Services.AddAuthentication()
    .AddScheme<AuthenticationSchemeOptions, UsuariosBasicHandler>(UsuariosBasicHandler.NombreEsquema, _ => { });
builder.Services.AddAuthorization();

builder.Services.AddControllers();
builder.Services.AddOpenApi();

builder.Services.AddCors(options =>
{
    options.AddPolicy("PermitirAngular", policy =>
        policy.WithOrigins("http://localhost:4200")
              .AllowAnyMethod()
              .AllowAnyHeader());
});

builder.Services.AddSingleton<IRepositorioCarrito, RepositorioCarritoMemoria>();
builder.Services.AddScoped<AgregarArticuloAlCarrito>();

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseHttpsRedirection();
app.UseCors("PermitirAngular");
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

app.Run();
```

### 10.4 Crear archivo nuevo

Ruta exacta: `backend/NEXORA.API/US11.http`

Crea un archivo de solicitudes separado para US11. En VS Code puedes usar REST Client y pulsar Send Request. Su sintaxis Basic usuario:contraseña es transformada por REST Client; al usar curl puedes emplear --user. Las credenciales incluidas son las cuentas demostrativas del repositorio.

Pega este contenido completo:

```http
@host = http://localhost:5043

### Administrador: 200, arreglo de usuarios SIN contrasena
GET {{host}}/users
Authorization: Basic maria.admin:clave123
Accept: application/json

### Auditor: 200
GET {{host}}/users
Authorization: Basic laura.m:auditor123
Accept: application/json

### Cliente: 403
GET {{host}}/users
Authorization: Basic juan.p:clave456

### Sin credenciales: 401
GET {{host}}/users

### Contraseña incorrecta: 401
GET {{host}}/users
Authorization: Basic maria.admin:incorrecta

### Ruta previa protegida: mismo resultado que /users
GET {{host}}/api/usuarios
Authorization: Basic laura.m:auditor123

### Usuario inexistente: 404
GET {{host}}/api/usuarios/9999
Authorization: Basic laura.m:auditor123
```

Al terminar esta capa, desde la raíz del repositorio:

```powershell
git add backend/NEXORA.API/Authentication/UsuariosBasicHandler.cs backend/NEXORA.API/UsuariosController.cs backend/NEXORA.API/Program.cs backend/NEXORA.API/US11.http
git commit -m "feat(api): expone directorio propio y protege acceso por rol"
```

## 11 Implementar Frontend Model y ViewModel

### 11.1 Crear archivo nuevo

Ruta exacta: `frontend/src/app/usuarios/models/usuario.model.ts`

Crea los modelos del módulo funcional usuarios. UsuarioLectura refleja el JSON de NEXORA; DireccionUsuario y CoordenadasUsuario conservan la anidación. UsuarioDirectorio añade solo datos de presentación. SesionUsuarios refleja la sesión actual de la rama de login; no sustituye el modelo de autenticación de esa rama.

Pega este contenido completo:

```typescript
export interface CoordenadasUsuario {
  latitud: string;
  longitud: string;
}

export interface DireccionUsuario {
  ciudad: string;
  calle: string;
  numero: number;
  codigoPostal: string;
  geolocalizacion: CoordenadasUsuario;
}

export interface UsuarioLectura {
  id: number;
  nombre: string;
  correo: string;
  telefono: string;
  nombreUsuario: string;
  direccion: DireccionUsuario;
}

export interface UsuarioDirectorio extends UsuarioLectura {
  iniciales: string;
  enlaceTelefono: string;
}

// Contrato ya utilizado por Task-01-Login, sin modificar su AuthService.
export interface SesionUsuarios {
  id: number;
  nombre: string;
  contrasena: string;
  rol: string;
}
```

### 11.2 Crear archivo nuevo

Ruta exacta: `frontend/src/app/usuarios/services/sesion-usuarios.service.ts`

Crea el adaptador a sessionStorage["usuario"]. Tolera JSON dañado, comprueba los campos necesarios y consulta el rol actual para menú y guards. Genera el encabezado Basic con UTF-8 para nombres con acentos. La comprobación local sirve para la navegación; el backend comprueba de nuevo credenciales y rol.

Pega este contenido completo:

```typescript
import { Injectable } from '@angular/core';
import { SesionUsuarios } from '../models/usuario.model';

@Injectable({ providedIn: 'root' })
export class SesionUsuariosService {
  obtener(): SesionUsuarios | null {
    try {
      const usuario: unknown = JSON.parse(sessionStorage.getItem('usuario') ?? 'null');
      if (!usuario || typeof usuario !== 'object') return null;
      const sesion = usuario as Partial<SesionUsuarios>;
      if (typeof sesion.id !== 'number' || sesion.id <= 0 ||
          typeof sesion.nombre !== 'string' || !sesion.nombre.trim() ||
          typeof sesion.contrasena !== 'string' || !sesion.contrasena ||
          typeof sesion.rol !== 'string') return null;
      return sesion as SesionUsuarios;
    } catch {
      return null;
    }
  }

  rol(): string {
    return this.obtener()?.rol.trim().toLowerCase() ?? '';
  }

  puedeConsultar(): boolean {
    return ['admin', 'administrador', 'auditor'].includes(this.rol());
  }

  autorizacion(): string | null {
    const sesion = this.obtener();
    if (!sesion) return null;
    const bytes = new TextEncoder().encode(`${sesion.nombre}:${sesion.contrasena}`);
    const base64 = btoa(Array.from(bytes, (byte) => String.fromCharCode(byte)).join(''));
    return `Basic ${base64}`;
  }
}
```

### 11.3 Crear archivo nuevo

Ruta exacta: `frontend/src/app/usuarios/services/usuarios.service.ts`

Crea el ViewModel. HttpClient consume la API propia, las Signals exponen lista, cargando y error. La normalización trata dirección o coordenadas nulas sin romper la vista. cargar sirve para la primera consulta y para Reintentar. El timeout de diez segundos evita una carga indefinida. Al destruir la vista cancela la petición y limpia su lista. La vista proporciona su propia instancia del service.

Pega este contenido completo:

```typescript
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable, OnDestroy, signal } from '@angular/core';
import { Subscription, finalize, map, timeout } from 'rxjs';
import { UsuarioDirectorio } from '../models/usuario.model';
import { SesionUsuariosService } from './sesion-usuarios.service';

const API_URL = 'http://localhost:5043/users';

@Injectable()
export class UsuariosService implements OnDestroy {
  private readonly lista = signal<UsuarioDirectorio[]>([]);
  private readonly enCarga = signal(false);
  private readonly mensajeError = signal('');
  private peticion?: Subscription;

  readonly usuarios = this.lista.asReadonly();
  readonly cargando = this.enCarga.asReadonly();
  readonly error = this.mensajeError.asReadonly();

  constructor(private readonly http: HttpClient, private readonly sesion: SesionUsuariosService) {}

  cargar(): void {
    this.peticion?.unsubscribe();
    this.lista.set([]);
    this.mensajeError.set('');
    const authorization = this.sesion.autorizacion();
    if (!this.sesion.puedeConsultar() || !authorization) {
      this.mensajeError.set('Tu sesión no tiene permiso para consultar usuarios.');
      return;
    }

    this.enCarga.set(true);
    this.peticion = this.http.get<unknown>(API_URL, { headers: { Authorization: authorization } }).pipe(
      timeout(10000),
      map((respuesta) => {
        if (!Array.isArray(respuesta)) throw new Error('Respuesta de usuarios inválida.');
        return respuesta.map((usuario) => this.mapear(usuario));
      }),
      finalize(() => this.enCarga.set(false)),
    ).subscribe({
      next: (usuarios) => this.lista.set(usuarios),
      error: (error: unknown) => this.mensajeError.set(this.describirError(error)),
    });
  }

  ngOnDestroy(): void {
    this.peticion?.unsubscribe();
    this.lista.set([]);
  }

  private describirError(error: unknown): string {
    if (error instanceof HttpErrorResponse && error.status === 401)
      return 'La sesión no es válida. Inicia sesión nuevamente.';
    if (error instanceof HttpErrorResponse && error.status === 403)
      return 'Tu perfil no tiene permisos para consultar usuarios.';
    return 'La conexión se interrumpió o la API no pudo responder. Intenta nuevamente.';
  }

  private mapear(valor: unknown): UsuarioDirectorio {
    const usuario = this.objeto(valor);
    const direccion = this.objeto(usuario['direccion']);
    const coordenadas = this.objeto(direccion['geolocalizacion']);
    const nombre = this.texto(usuario['nombre']) || 'Sin nombre';
    const telefono = this.texto(usuario['telefono']);
    return {
      id: typeof usuario['id'] === 'number' ? usuario['id'] : 0,
      nombre,
      correo: this.texto(usuario['correo']),
      telefono,
      nombreUsuario: this.texto(usuario['nombreUsuario']),
      iniciales: nombre.split(/\s+/).slice(0, 2).map((parte) => parte[0]).join('').toUpperCase(),
      enlaceTelefono: `tel:${telefono.replace(/[^\d+]/g, '')}`,
      direccion: {
        ciudad: this.texto(direccion['ciudad']),
        calle: this.texto(direccion['calle']),
        numero: typeof direccion['numero'] === 'number' ? direccion['numero'] : 0,
        codigoPostal: this.texto(direccion['codigoPostal']),
        geolocalizacion: {
          latitud: this.texto(coordenadas['latitud']),
          longitud: this.texto(coordenadas['longitud']),
        },
      },
    };
  }

  private objeto(valor: unknown): Record<string, unknown> {
    return valor && typeof valor === 'object' ? valor as Record<string, unknown> : {};
  }

  private texto(valor: unknown): string {
    return typeof valor === 'string' ? valor.trim() : '';
  }
}
```

### 11.4 Crear archivo nuevo

Ruta exacta: `frontend/src/app/usuarios/guards/usuarios.guard.ts`

Crea los guards funcionales. CanMatch evita seleccionar la ruta y CanActivate protege su activación. Devuelven un UrlTree hacia acceso-restringido cuando falta una sesión autorizada. Un Cliente que escriba /usuarios directamente no descarga el directorio.

Pega este contenido completo:

```typescript
import { inject } from '@angular/core';
import { CanActivateFn, CanMatchFn, Router } from '@angular/router';
import { SesionUsuariosService } from '../services/sesion-usuarios.service';

const comprobarAcceso = () => inject(SesionUsuariosService).puedeConsultar()
  ? true
  : inject(Router).createUrlTree(['/acceso-restringido']);

export const usuariosGuard: CanActivateFn = comprobarAcceso;
export const usuariosMatchGuard: CanMatchFn = comprobarAcceso;
```

### 11.5 Crear archivo nuevo

Ruta exacta: `frontend/src/app/usuarios/services/usuarios.service.spec.ts`

Crea estas pruebas del ViewModel. Verifican carga, contrato HTTP, anidación nula, Auditor, error y reintento, Cliente, 403 y respuesta inválida usando HttpTestingController, sin consumir un servidor externo.

Pega este contenido completo:

```typescript
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { UsuariosService } from './usuarios.service';

describe('US11 UsuariosService', () => {
  let servicio: UsuariosService;
  let http: HttpTestingController;

  beforeEach(() => {
    sessionStorage.clear();
    sessionStorage.setItem('usuario', JSON.stringify({
      id: 1, nombre: 'María Isabel', contrasena: 'clave123', rol: 'admin',
    }));
    TestBed.configureTestingModule({
      providers: [UsuariosService, provideHttpClient(), provideHttpClientTesting()],
    });
    servicio = TestBed.inject(UsuariosService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    http.verify();
    sessionStorage.clear();
  });

  it('consume la API propia, muestra carga y tolera datos anidados nulos', () => {
    servicio.cargar();
    expect(servicio.cargando()).toBe(true);
    const peticion = http.expectOne('http://localhost:5043/users');
    expect(peticion.request.method).toBe('GET');
    expect(peticion.request.headers.get('Authorization')).toMatch(/^Basic /);
    peticion.flush([{ id: 1, nombre: 'Ana López', correo: 'ana@nexora.mx', direccion: null }]);
    expect(servicio.cargando()).toBe(false);
    expect(servicio.usuarios()[0].iniciales).toBe('AL');
    expect(servicio.usuarios()[0].direccion.geolocalizacion.latitud).toBe('');
    expect(servicio.error()).toBe('');
  });

  it('permite al auditor consultar usuarios', () => {
    sessionStorage.setItem('usuario', JSON.stringify({ id: 4, nombre: 'Laura Méndez', contrasena: 'auditor123', rol: 'auditor' }));
    servicio.cargar();
    http.expectOne('http://localhost:5043/users').flush([]);
    expect(servicio.error()).toBe('');
  });

  it('permite reintentar después de un fallo sin conservar datos anteriores', () => {
    servicio.cargar();
    http.expectOne('http://localhost:5043/users').flush('Error', { status: 503, statusText: 'Unavailable' });
    expect(servicio.error()).toContain('conexión');
    expect(servicio.cargando()).toBe(false);
    servicio.cargar();
    expect(servicio.error()).toBe('');
    http.expectOne('http://localhost:5043/users').flush([]);
    expect(servicio.usuarios()).toEqual([]);
  });

  it('el cliente no inicia la petición aunque cambie el rol demo del carrito', () => {
    sessionStorage.setItem('usuario', JSON.stringify({ id: 2, nombre: 'Juan Pérez', contrasena: 'clave456', rol: 'cliente' }));
    sessionStorage.setItem('nexora-rol-demo', 'Auditor');
    servicio.cargar();
    http.expectNone('http://localhost:5043/users');
    expect(servicio.error()).toContain('permiso');
  });

  it('informa cuando la API rechaza el rol', () => {
    servicio.cargar();
    http.expectOne('http://localhost:5043/users').flush(null, { status: 403, statusText: 'Forbidden' });
    expect(servicio.error()).toContain('permisos');
    expect(servicio.usuarios()).toEqual([]);
  });

  it('rechaza una respuesta que no sea una lista', () => {
    servicio.cargar();
    http.expectOne('http://localhost:5043/users').flush({ mensaje: 'No es un arreglo' });
    expect(servicio.error()).not.toBe('');
    expect(servicio.cargando()).toBe(false);
  });
});
```

### 11.6 Crear archivo nuevo

Ruta exacta: `frontend/src/app/usuarios/guards/usuarios.guard.spec.ts`

Crea estas pruebas de integración de rutas y menú. Comprueban enlace profundo, sesión dañada, ocultar Usuarios al Cliente y mostrarlo al Admin.

Pega este contenido completo:

```typescript
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { routes } from '../../app.routes';

describe('US11 protección de rutas y menú', () => {
  beforeEach(() => {
    sessionStorage.clear();
    TestBed.configureTestingModule({
      providers: [provideRouter(routes), provideHttpClient(), provideHttpClientTesting()],
    });
  });

  afterEach(() => {
    TestBed.inject(HttpTestingController).verify();
    sessionStorage.clear();
  });

  it('bloquea un enlace profundo para Cliente sin pedir datos a la API', async () => {
    sessionStorage.setItem('usuario', JSON.stringify({ id: 2, nombre: 'Juan Pérez', contrasena: 'clave456', rol: 'cliente' }));
    const harness = await RouterTestingHarness.create('/usuarios');
    expect(TestBed.inject(Router).url).toBe('/acceso-restringido');
    expect(harness.routeNativeElement?.textContent).toContain('Acceso restringido');
    TestBed.inject(HttpTestingController).expectNone('http://localhost:5043/users');
  });

  it('bloquea una sesión dañada sin fallar', async () => {
    sessionStorage.setItem('usuario', '{invalido');
    await RouterTestingHarness.create('/usuarios');
    expect(TestBed.inject(Router).url).toBe('/acceso-restringido');
  });

  it('oculta Usuarios para Cliente en el menú principal', async () => {
    sessionStorage.setItem('usuario', JSON.stringify({ id: 2, nombre: 'Juan Pérez', contrasena: 'clave456', rol: 'cliente' }));
    const harness = await RouterTestingHarness.create('/');
    expect(harness.routeNativeElement?.querySelector('a[href="/usuarios"]')).toBeNull();
  });

  it('muestra Usuarios para Admin en el menú principal', async () => {
    sessionStorage.setItem('usuario', JSON.stringify({ id: 1, nombre: 'María Isabel', contrasena: 'clave123', rol: 'admin' }));
    const harness = await RouterTestingHarness.create('/');
    expect(harness.routeNativeElement?.querySelector('a[href="/usuarios"]')).not.toBeNull();
  });
});
```

Al terminar esta capa, desde la raíz del repositorio:

```powershell
git add frontend/src/app/usuarios/models/usuario.model.ts frontend/src/app/usuarios/services/sesion-usuarios.service.ts frontend/src/app/usuarios/services/usuarios.service.ts frontend/src/app/usuarios/guards/usuarios.guard.ts frontend/src/app/usuarios/services/usuarios.service.spec.ts frontend/src/app/usuarios/guards/usuarios.guard.spec.ts
git commit -m "feat(frontend): agrega modelo viewmodel y permisos de US11"
```

## 12 Implementar Frontend View e integración

### 12.1 Crear archivo nuevo

Ruta exacta: `frontend/src/app/usuarios/components/usuarios-lista/usuarios-lista.ts`

Crea el componente standalone. Solo inyecta el ViewModel y el service de sesión e inicia la carga en OnInit. No contiene peticiones HTTP ni reglas de negocio.

Pega este contenido completo:

```typescript
import { Component, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SesionUsuariosService } from '../../services/sesion-usuarios.service';
import { UsuariosService } from '../../services/usuarios.service';

@Component({
  selector: 'app-usuarios-lista',
  imports: [RouterLink],
  providers: [UsuariosService],
  templateUrl: './usuarios-lista.html',
  styleUrl: './usuarios-lista.scss',
})
export class UsuariosListaComponent implements OnInit {
  protected readonly vm = inject(UsuariosService);
  protected readonly sesion = inject(SesionUsuariosService);

  ngOnInit(): void {
    this.vm.cargar();
  }
}
```

### 12.2 Crear archivo nuevo

Ruta exacta: `frontend/src/app/usuarios/components/usuarios-lista/usuarios-lista.html`

Crea la vista. Renderiza carga, alerta con Reintentar, lista vacía o tarjetas. Muestra nombre, usuario, correo y teléfono. Los enlaces de contacto y el control Ver dirección hacen la lista interactiva sin agregar edición ni eliminación. La navegación usa solamente rutas que existen en SP4; no agrega un botón de Historial sin funcionalidad.

Pega este contenido completo:

```html
<div class="app-shell">
  <header class="topbar">
    <div class="brand-lockup" aria-label="NEXORA">
      <span class="brand-mark">N</span><span class="brand-name">NEXORA</span>
    </div>
    <span class="role-badge">{{ sesion.rol() }}</span>
  </header>

  <main class="screen-content" [attr.aria-busy]="vm.cargando()">
    <h1>Usuarios</h1>
    @if (vm.cargando()) {
      <div class="users-feedback" role="status" aria-live="polite">
        <span class="spinner" aria-hidden="true"></span>
        <p>Cargando usuarios…</p>
      </div>
    } @else if (vm.error()) {
      <div class="users-feedback" role="alert">
        <span class="error-mark" aria-hidden="true">!</span>
        <h2>No pudimos cargar usuarios</h2>
        <p>{{ vm.error() }}</p>
        <button class="primary-button retry-button" type="button" (click)="vm.cargar()">Reintentar</button>
      </div>
    } @else if (vm.usuarios().length === 0) {
      <div class="users-feedback" role="status"><h2>No hay usuarios registrados</h2></div>
    } @else {
      <div class="users-list">
        @for (usuario of vm.usuarios(); track $index) {
          <article class="user-card">
            <span class="user-avatar" aria-hidden="true">{{ usuario.iniciales }}</span>
            <div class="user-info">
              <h2>{{ usuario.nombre }}</h2>
              <p class="username">&#64;{{ usuario.nombreUsuario || 'Sin usuario' }}</p>
              <div class="user-contact">
                @if (usuario.correo) {
                  <a [href]="'mailto:' + usuario.correo">{{ usuario.correo }}</a>
                } @else { <span>Sin correo</span> }
                @if (usuario.telefono) {
                  <a [href]="usuario.enlaceTelefono">{{ usuario.telefono }}</a>
                } @else { <span>Sin teléfono</span> }
              </div>
              <details>
                <summary>Ver dirección</summary>
                @if (usuario.direccion.ciudad || usuario.direccion.calle) {
                  <p>{{ usuario.direccion.calle }} {{ usuario.direccion.numero || '' }}</p>
                  <p>{{ usuario.direccion.ciudad }} {{ usuario.direccion.codigoPostal }}</p>
                } @else { <p>Sin dirección registrada</p> }
              </details>
            </div>
          </article>
        }
      </div>
    }
  </main>

  <nav class="bottom-nav users-nav" aria-label="Navegación de usuarios">
    <a routerLink="/"><span class="nav-icon">H</span><span>Tienda</span></a>
    <a routerLink="/usuarios" class="active" aria-current="page"><span class="nav-icon">U</span><span>Usuarios</span></a>
  </nav>
</div>
```

### 12.3 Crear archivo nuevo

Ruta exacta: `frontend/src/app/usuarios/components/usuarios-lista/usuarios-lista.scss`

Crea estilos específicos del directorio con los colores y tarjetas del mockup P25 y el estado de error P27. Reutiliza app-shell, topbar y bottom-nav del estilo global existente. El spinner representa la carga de usuarios; no copiamos los filtros de productos que aparecen en P26.

Pega este contenido completo:

```scss
.users-list { display: grid; gap: 16px; padding-top: 8px; }
.user-card { display: flex; align-items: flex-start; gap: 12px; padding: 18px 14px; border: 1px solid #dce4e2; border-radius: 20px; }
.user-avatar { display: grid; flex: 0 0 46px; height: 46px; place-items: center; border-radius: 50%; background: #dfebe8; color: #4b817d; font-size: .75rem; font-weight: 700; }
.user-info { flex: 1; min-width: 0; }
.user-info h2 { margin: 0; font-size: .92rem; }
.username { margin: 6px 0 12px; color: #627276; font-size: .75rem; }
.user-contact { display: flex; flex-wrap: wrap; justify-content: space-between; gap: 8px; font-size: .73rem; }
.user-contact a { color: #4b676d; overflow-wrap: anywhere; }
details { margin-top: 12px; color: #627276; font-size: .73rem; }
summary { cursor: pointer; }
details p { margin: 8px 0 0; overflow-wrap: anywhere; }
.users-feedback { display: flex; flex: 1; flex-direction: column; justify-content: center; align-items: center; gap: 14px; padding: 30px 0; text-align: center; }
.users-feedback h2 { margin: 0; font-size: 1rem; }
.users-feedback p { margin: 0; color: #627276; font-size: .82rem; line-height: 1.5; }
.retry-button { width: auto; min-width: 155px; padding: 0 22px; }
.error-mark { display: grid; width: 82px; height: 82px; place-items: center; border-radius: 50%; background: #f5e1e0; color: #9a5657; font-size: 2rem; }
.spinner { width: 44px; height: 44px; border: 4px solid #dfebe8; border-top-color: #4b817d; border-radius: 50%; animation: girar 1s linear infinite; }
.users-nav { grid-template-columns: repeat(2, 1fr); }
.users-nav a { display: flex; flex-direction: column; justify-content: center; align-items: center; gap: 4px; color: #6c7b7e; font-size: .75rem; text-decoration: none; }
.users-nav a.active { color: #4b817d; }
@keyframes girar { to { transform: rotate(360deg); } }
@media (prefers-reduced-motion: reduce) { .spinner { animation: none; } }
```

### 12.4 Crear archivo nuevo

Ruta exacta: `frontend/src/app/usuarios/components/acceso-restringido/acceso-restringido.ts`

Crea una vista de acceso restringido con enlace de vuelta a la tienda, para la protección solicitada en US11.

Pega este contenido completo:

```typescript
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-acceso-restringido',
  imports: [RouterLink],
  template: `
    <div class="app-shell">
      <main class="screen-content">
        <h1>Acceso restringido</h1>
        <p role="alert">Tu perfil no tiene permisos para abrir esta sección.</p>
        <a routerLink="/">Volver a la tienda</a>
      </main>
    </div>
  `,
})
export class AccesoRestringidoComponent {}
```

### 12.5 Modificar archivo existente

Ruta exacta: `frontend/src/app/app.routes.ts`

Modifica el arreglo vacío de SP4. La ruta inicial sigue mostrando el detalle del carrito; añade usuarios con sus guards y acceso-restringido. Si al integrar ya hay otras rutas del equipo, conserva esas entradas y agrega solamente las de US11.

Pega este contenido completo:

```typescript
import { Routes } from '@angular/router';
import { ProductoDetalleComponent } from './carrito/components/producto-detalle/producto-detalle';
import { usuariosGuard, usuariosMatchGuard } from './usuarios/guards/usuarios.guard';

export const routes: Routes = [
  { path: '', pathMatch: 'full', component: ProductoDetalleComponent },
  {
    path: 'usuarios',
    canMatch: [usuariosMatchGuard],
    canActivate: [usuariosGuard],
    loadComponent: () => import('./usuarios/components/usuarios-lista/usuarios-lista')
      .then((modulo) => modulo.UsuariosListaComponent),
  },
  {
    path: 'acceso-restringido',
    loadComponent: () => import('./usuarios/components/acceso-restringido/acceso-restringido')
      .then((modulo) => modulo.AccesoRestringidoComponent),
  },
];
```

### 12.6 Modificar archivo existente

Ruta exacta: `frontend/src/app/app.ts`

Modifica el componente raíz para importar RouterOutlet. El detalle existente se renderiza ahora desde la ruta inicial. No crees app.module.ts.

Pega este contenido completo:

```typescript
import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  imports: [RouterOutlet],
  selector: 'app-root',
  styleUrl: './app.scss',
  templateUrl: './app.html',
})
export class App {}
```

### 12.7 Modificar archivo existente

Ruta exacta: `frontend/src/app/app.html`

Modifica la plantilla raíz para usar router-outlet. Dejar el detalle fijo impediría mostrar usuarios aunque cambiara la URL.

Pega este contenido completo:

```html
<router-outlet />
```

### 12.8 Modificar archivo existente

Ruta exacta: `frontend/src/app/carrito/components/producto-detalle/producto-detalle.ts`

Añade RouterLink a los imports e inyecta SesionUsuariosService. Las acciones y servicios del carrito se mantienen. Estas son las únicas líneas funcionales nuevas en este componente.

Pega este contenido completo:

```typescript
import { CurrencyPipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CarritoService } from '../../services/carrito.service';
import { RolUsuario } from '../../models/articulo-carrito.model';
import { RouterLink } from '@angular/router';
import { SesionUsuariosService } from '../../../usuarios/services/sesion-usuarios.service';

type Pantalla = 'tienda' | 'carrito' | 'cuenta';

@Component({
  selector: 'app-producto-detalle',
  imports: [CurrencyPipe, FormsModule, RouterLink],
  templateUrl: './producto-detalle.html',
})
export class ProductoDetalleComponent {
  protected readonly carritoService = inject(CarritoService);
  protected readonly sesionUsuarios = inject(SesionUsuariosService);
  protected readonly pantalla = signal<Pantalla>('tienda');
  protected readonly cantidad = signal(1);
  protected readonly mensaje = signal('');
  protected readonly error = signal('');
  protected readonly cargando = signal(false);

  protected cambiarPantalla(pantalla: Pantalla): void {
    this.pantalla.set(pantalla);
    this.mensaje.set('');
    this.error.set('');
  }

  protected actualizarRol(event: Event): void {
    const rol = (event.target as HTMLSelectElement).value as RolUsuario;
    this.carritoService.cambiarRol(rol);
  }

  protected cambiarCantidad(delta: number): void {
    this.cantidad.update((cantidad) => Math.max(1, cantidad + delta));
  }

  protected agregarAlCarrito(): void {
    this.mensaje.set('');
    this.error.set('');
    this.cargando.set(true);

    try {
      this.carritoService.agregar(this.carritoService.producto, this.cantidad()).subscribe({
        next: (articulo) => {
          this.mensaje.set(`OK  Producto añadido. Cantidad: ${articulo.cantidad}`);
          this.cargando.set(false);
        },
        error: () => {
          this.error.set('No se pudo agregar el producto. Revisa que la API de NEXORA esté disponible.');
          this.cargando.set(false);
        },
      });
    } catch (exception) {
      this.error.set(exception instanceof Error ? exception.message : 'Cantidad no válida.');
      this.cargando.set(false);
    }
  }
}
```

### 12.9 Modificar archivo existente

Ruta exacta: `frontend/src/app/carrito/components/producto-detalle/producto-detalle.html`

Añade el enlace Usuarios condicionado por la sesión y la clase de cuatro columnas. Conserva los controles existentes de tienda, carrito y cuenta. El selector de rol demo no otorga acceso al directorio.

Pega este contenido completo:

```html
<div class="app-shell">
  <header class="topbar">
    <div class="brand-lockup" aria-label="NEXORA">
      <span class="brand-mark">N</span>
      <span class="brand-name">NEXORA</span>
    </div>
    <span class="role-badge">{{ carritoService.rol() }}</span>
  </header>

  <main class="screen-content">
    @if (pantalla() === 'tienda') {
      <section class="detail-screen" aria-labelledby="detail-title">
        <h1 id="detail-title">Detalle</h1>
        <div class="product-image">
          <img [src]="carritoService.producto.imagen" [alt]="carritoService.producto.titulo" />
        </div>
        <div class="product-heading">
          <h2>{{ carritoService.producto.titulo }}</h2>
          <span class="product-price">{{ carritoService.producto.precio | currency:'USD' }}</span>
        </div>
        <span class="category-badge">ACCESORIOS</span>
        <p class="description">{{ carritoService.producto.descripcion }}</p>

        <div class="detail-feedback">
          @if (mensaje()) { <p class="success" role="status">{{ mensaje() }}</p> }
          @if (error()) { <p class="error" role="alert">{{ error() }}</p> }
        </div>

        @if (carritoService.esCliente()) {
          <div class="purchase-actions">
            <div class="quantity-stepper" aria-label="Cantidad del producto">
              <button type="button" aria-label="Disminuir cantidad" (click)="cambiarCantidad(-1)">−</button>
              <span aria-live="polite">{{ cantidad() }}</span>
              <button type="button" aria-label="Aumentar cantidad" (click)="cambiarCantidad(1)">+</button>
            </div>
            <button class="primary-button" type="button" (click)="agregarAlCarrito()" [disabled]="cargando()">
              {{ cargando() ? 'Agregando…' : 'Añadir al carrito' }}
            </button>
          </div>
        }
      </section>
    } @else if (pantalla() === 'carrito') {
      <section class="cart-screen" aria-labelledby="cart-title">
        <h1 id="cart-title">Mi carrito</h1>
        @if (carritoService.carrito().length === 0) {
          <div class="empty-cart">
            <span class="empty-count">0</span>
            <h2>Tu carrito está vacío</h2>
            <p>Explora el catálogo y agrega productos.</p>
            <button class="primary-button explore-button" type="button" (click)="cambiarPantalla('tienda')">Explorar tienda</button>
          </div>
        } @else {
          <div class="cart-list">
            @for (item of carritoService.carrito(); track item.productoId) {
              <article class="cart-item">
                <img [src]="item.imagen" [alt]="item.titulo" />
                <div class="cart-item-info">
                  <h2>{{ item.titulo }}</h2>
                  <p>{{ item.precio | currency:'USD' }}</p>
                  <span class="item-quantity">Cantidad: {{ item.cantidad }}</span>
                </div>
              </article>
            }
          </div>
          <div class="cart-total">
            <span>Total</span>
            <strong>{{ carritoService.totalCarrito() | currency:'USD' }}</strong>
          </div>
          <button class="primary-button checkout-button" type="button" disabled>Proceder al pago</button>
        }
      </section>
    } @else {
      <section class="account-screen" aria-labelledby="account-title">
        <h1 id="account-title">Mi cuenta</h1>
        <div class="profile-heading">
          <span class="avatar">CD</span>
          <h2>Cliente Demo</h2>
          <p>cliente.demo&#64;nexora.mx</p>
        </div>
        <div class="account-row"><span>Perfil</span><strong>{{ carritoService.rol() }}</strong></div>
        <div class="account-row"><span>Carrito local</span><strong>{{ carritoService.cantidadTotal() }} productos</strong></div>
        <div class="account-row"><span>Sesión</span><strong>Activa</strong></div>
        <label class="demo-role-label" for="role">Cambiar rol de demostración</label>
        <select id="role" [value]="carritoService.rol()" (change)="actualizarRol($event)">
          <option value="Cliente">Cliente</option>
          <option value="Auditor">Auditor</option>
        </select>
      </section>
    }
  </main>

  <nav class="bottom-nav" [class.with-users]="sesionUsuarios.puedeConsultar()" aria-label="Navegación principal">
    <button type="button" [class.active]="pantalla() === 'tienda'" (click)="cambiarPantalla('tienda')">
      <span class="nav-icon">H</span><span>Tienda</span>
    </button>
    <button type="button" [class.active]="pantalla() === 'carrito'" (click)="cambiarPantalla('carrito')">
      <span class="nav-icon">C</span><span>Carrito@if (carritoService.cantidadTotal() > 0) { <small>{{ carritoService.cantidadTotal() }}</small> }</span>
    </button>
    <button type="button" [class.active]="pantalla() === 'cuenta'" (click)="cambiarPantalla('cuenta')">
      <span class="nav-icon">U</span><span>Cuenta</span>
    </button>
    @if (sesionUsuarios.puedeConsultar()) {
      <a routerLink="/usuarios"><span class="nav-icon">U</span><span>Usuarios</span></a>
    }
  </nav>
</div>
```

### 12.10 Modificar archivo existente

Ruta exacta: `frontend/src/app/carrito/components/producto-detalle/producto-detalle.scss`

Añade dos reglas para el enlace Usuarios y las cuatro columnas. Se conserva el resto del diseño que ya usa SP4.

Pega este contenido completo:

```scss
body {
  display: block;
  min-height: 100vh;
  color: #283b40;
  font-family: Arial, Helvetica, sans-serif;
}

.app-shell {
  display: flex;
  flex-direction: column;
  width: 100%;
  max-width: 440px;
  min-height: 100dvh;
  margin: 0 auto;
  background: #fff;
  box-shadow: 0 10px 50px #273b401a;
}

.topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 64px;
  padding: 12px 20px;
}

.brand-lockup { display: flex; align-items: center; gap: 9px; }
.brand-mark {
  display: grid;
  width: 36px;
  height: 36px;
  place-items: center;
  border-radius: 50%;
  background: #344e59;
  color: #fff;
  font-size: 1.25rem;
  font-weight: 700;
}
.brand-name { color: #344e59; font-size: .8rem; font-weight: 700; letter-spacing: .23em; }
.role-badge, .category-badge {
  border-radius: 999px;
  font-size: .62rem;
  font-weight: 700;
  letter-spacing: .16em;
}
.role-badge { padding: 8px 18px; background: #f0e9da; color: #4d5351; text-transform: uppercase; }
.screen-content { display: flex; flex: 1; flex-direction: column; padding: 12px 20px 18px; }
h1 { margin: 0 0 12px; color: #293c41; font-size: 1.35rem; font-weight: 700; }
.detail-screen, .cart-screen, .account-screen { display: flex; flex: 1; flex-direction: column; }
.product-image {
  display: grid;
  min-height: 185px;
  max-height: 230px;
  place-items: center;
  overflow: hidden;
  border-radius: 18px;
  background: #f0e8d8;
}
.product-image img { width: 100%; height: 100%; max-height: 210px; object-fit: contain; }
.product-heading { display: flex; align-items: baseline; justify-content: space-between; gap: 12px; margin-top: 14px; }
.product-heading h2 { margin: 0; color: #263a3f; font-size: 1rem; letter-spacing: .04em; }
.product-price { color: #4e827e; font-size: .95rem; font-weight: 700; white-space: nowrap; }
.category-badge { align-self: flex-start; margin-top: 9px; padding: 9px 16px; background: #e2eaec; color: #39545b; }
.description { margin: 13px 0 0; color: #718084; font-size: .78rem; line-height: 1.55; }
.detail-feedback { min-height: 52px; margin-top: auto; display: flex; align-items: flex-end; }
.success, .error { width: 100%; margin: 0; padding: 12px 14px; border-radius: 12px; font-size: .74rem; font-weight: 600; }
.success { background: #e1eee6; color: #47735d; }
.error { background: #f5e1e0; color: #9a5657; }
.purchase-actions { padding-top: 12px; }
.quantity-stepper { display: flex; align-items: center; width: 110px; height: 40px; margin-bottom: 12px; padding: 0 8px; border: 1px solid #d9e2df; border-radius: 14px; color: #31464b; }
.quantity-stepper button { flex: 1; padding: 0; border: 0; background: transparent; color: #31464b; font-size: 1.05rem; cursor: pointer; }
.quantity-stepper span { min-width: 25px; text-align: center; font-size: .85rem; }
.primary-button {
  min-height: 44px;
  width: 100%;
  border: 0;
  border-radius: 13px;
  background: #4b817d;
  color: #fff;
  font-size: .82rem;
  font-weight: 700;
  letter-spacing: .04em;
  cursor: pointer;
}
.primary-button:disabled { background: #a7b8b5; cursor: not-allowed; }
.bottom-nav {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  min-height: 68px;
  border-top: 1px solid #dce3e1;
  background: #fff;
}
.bottom-nav button { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 3px; border: 0; background: transparent; color: #6c7b7e; font-size: .68rem; cursor: pointer; }
.bottom-nav button.active { color: #4b817d; }
.bottom-nav.with-users { grid-template-columns: repeat(4, 1fr); }
.bottom-nav > a { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 3px; color: #6c7b7e; font-size: .68rem; text-decoration: none; }
.nav-icon { font-size: .78rem; font-weight: 700; }
.bottom-nav small { display: inline-grid; min-width: 15px; height: 15px; margin-left: 3px; place-items: center; border-radius: 50%; background: #4b817d; color: #fff; font-size: .58rem; }
.cart-screen h1, .account-screen h1 { margin-bottom: 18px; }
.empty-cart { display: flex; flex: 1; flex-direction: column; align-items: center; justify-content: center; text-align: center; }
.empty-count { display: grid; width: 82px; height: 82px; place-items: center; border-radius: 50%; background: #e4ecee; color: #344e59; font-size: 1.7rem; font-weight: 700; }
.empty-cart h2 { margin: 18px 0 6px; font-size: 1rem; }
.empty-cart p { margin: 0 0 24px; color: #7b898c; font-size: .75rem; }
.explore-button { width: auto; min-width: 160px; padding: 0 22px; }
.cart-list { display: flex; flex-direction: column; gap: 12px; }
.cart-item { display: flex; align-items: center; gap: 12px; min-height: 116px; padding: 10px; border: 1px solid #dce4e2; border-radius: 20px; }
.cart-item img { width: 76px; height: 76px; border-radius: 17px; background: #e1ece9; object-fit: contain; }
.cart-item-info h2 { margin: 0 0 7px; color: #293c41; font-size: .82rem; }
.cart-item-info p { margin: 0 0 8px; color: #4b817d; font-size: .75rem; font-weight: 700; }
.item-quantity { color: #627276; font-size: .72rem; }
.cart-total { display: flex; justify-content: space-between; margin-top: auto; padding: 20px 0 14px; color: #607074; font-size: .82rem; }
.cart-total strong { color: #293c41; font-size: 1.1rem; }
.checkout-button { margin-bottom: 2px; }
.profile-heading { display: flex; flex-direction: column; align-items: center; padding: 25px 0 28px; text-align: center; }
.avatar { display: grid; width: 76px; height: 76px; place-items: center; border-radius: 50%; background: #dfebe8; color: #4b817d; font-size: 1.15rem; font-weight: 700; }
.profile-heading h2 { margin: 10px 0 4px; font-size: 1rem; }
.profile-heading p { margin: 0; color: #788689; font-size: .72rem; }
.account-row { display: flex; justify-content: space-between; margin-bottom: 10px; padding: 14px 12px; border: 1px solid #dce4e2; border-radius: 12px; color: #718084; font-size: .76rem; }
.account-row strong { color: #34464a; font-size: .72rem; }
.demo-role-label { margin: 14px 0 7px; color: #718084; font-size: .7rem; }
.account-screen select { min-height: 42px; border: 1px solid #d9e2df; border-radius: 11px; background: #fff; padding: 0 12px; color: #34464a; }

@media (min-width: 500px) {
  body { min-height: 100vh; padding: 24px 0; background: #f2f1ed; }
  .app-shell { min-height: calc(100dvh - 48px); border: 6px solid #293b40; border-radius: 34px; overflow: hidden; }
}
```

### 12.11 Modificar archivo existente

Ruta exacta: `frontend/src/app/app.spec.ts`

Adapta la prueba existente del detalle al RouterOutlet. Usa RouterTestingHarness para abrir la ruta inicial y comprobar que sigue mostrando Bolso Nómada.

Pega este contenido completo:

```typescript
import { TestBed } from '@angular/core/testing';
import { App } from './app';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { RouterTestingHarness } from '@angular/router/testing';
import { routes } from './app.routes';

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [provideRouter(routes), provideHttpClient(), provideHttpClientTesting()],
    })
      .compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('should render the US09 product detail', async () => {
    const harness = await RouterTestingHarness.create('/');
    expect(harness.routeNativeElement?.querySelector('h2')?.textContent).toContain('Bolso Nómada');
  });
});
```

Al terminar esta capa, desde la raíz del repositorio:

```powershell
git add frontend/src/app/usuarios/components/usuarios-lista/usuarios-lista.ts frontend/src/app/usuarios/components/usuarios-lista/usuarios-lista.html frontend/src/app/usuarios/components/usuarios-lista/usuarios-lista.scss frontend/src/app/usuarios/components/acceso-restringido/acceso-restringido.ts frontend/src/app/app.routes.ts frontend/src/app/app.ts frontend/src/app/app.html frontend/src/app/carrito/components/producto-detalle/producto-detalle.ts frontend/src/app/carrito/components/producto-detalle/producto-detalle.html frontend/src/app/carrito/components/producto-detalle/producto-detalle.scss frontend/src/app/app.spec.ts
git commit -m "feat(frontend): integra directorio de usuarios con rutas protegidas"
```

## 13 Ejecutar backend y frontend

En VS Code abre dos terminales. Mantén ambos procesos abiertos mientras pruebas.

**Terminal 1**, desde la raíz NEXORA-SP4:

```powershell
dotnet restore backend/NEXORA.slnx
dotnet build backend/NEXORA.slnx
dotnet run --project backend/NEXORA.API --launch-profile http
```

El perfil http existente abre la API en `http://localhost:5043`. No uses el perfil https en esta demo sin ajustar también la URL del ViewModel y confiar el certificado. `app.MapOpenApi()` ofrece el documento de OpenAPI en desarrollo; esta base no incluye una interfaz Swagger UI.

**Terminal 2**, desde la misma raíz:

```powershell
cd frontend
npm ci
npm start
```

Abre `http://localhost:4200`. La vista inicial sigue siendo la del carrito de SP4. `/usuarios` se abrirá solamente con una sesión Admin o Auditor. El endpoint backend es `/users`, mientras la ruta de Angular es `/usuarios`: son direcciones diferentes y tienen funciones diferentes.

## 14 Probar mientras el equipo integra el login

SP4 todavía no trae la pantalla de US01. Por esa razón, que no aparezca Usuarios al abrir una copia limpia es el comportamiento correcto: aún no existe una sesión autorizada. No uses el selector Cliente/Auditor del carrito para probar permisos de usuarios.

Para pruebas de desarrollo puedes colocar una sesión de una cuenta demostrativa ya existente. Abre las herramientas de desarrollo del navegador en localhost:4200 y, en Consola, ejecuta uno de estos fragmentos. La API sigue verificando las credenciales; modificar solo el rol de un Cliente no da acceso a los datos.

**Administrador**:

```javascript
sessionStorage.setItem('usuario', JSON.stringify({
  id: 1, nombre: 'María Isabel', contrasena: 'clave123', rol: 'admin'
}));
location.assign('/usuarios');
```

**Auditor**:

```javascript
sessionStorage.setItem('usuario', JSON.stringify({
  id: 4, nombre: 'Laura Méndez', contrasena: 'auditor123', rol: 'auditor'
}));
location.assign('/usuarios');
```

**Cliente**:

```javascript
sessionStorage.setItem('usuario', JSON.stringify({
  id: 2, nombre: 'Juan Pérez', contrasena: 'clave456', rol: 'cliente'
}));
location.assign('/usuarios');
```

El último caso debe redirigirte a `/acceso-restringido`. Vuelve a `/` y comprueba que no existe el enlace Usuarios. Para limpiar la sesión de prueba usa `sessionStorage.removeItem('usuario')` y recarga. Estos fragmentos son preparación manual de pruebas; no son una implementación de US01.

Para probar error y reintento, abre la lista con Admin, detén la API y recarga `/usuarios`. Verás el estado de error. Vuelve a ejecutar el backend y pulsa Reintentar. Para observar el spinner, usa Network, Slow 3G en las herramientas del navegador y recarga con la API activa. El tiempo máximo de espera de una petición es diez segundos.

Abre `backend/NEXORA.API/US11.http` con REST Client para las pruebas de la API. Un navegador que abra /users sin Authorization recibe 401; eso no significa que el servidor esté fallando. Desde PowerShell, usando curl.exe:

```powershell
curl.exe --user "maria.admin:clave123" http://localhost:5043/users
curl.exe -i --user "laura.m:auditor123" http://localhost:5043/users
curl.exe -i --user "juan.p:clave456" http://localhost:5043/users
curl.exe -i http://localhost:5043/users
```

Las respuestas esperadas son 200, 200, 403 y 401, respectivamente. Las cuentas de prueba están definidas en el repositorio en memoria, no en Fake Store.

## 15 Verificar antes de subir

Desde la raíz:

```powershell
dotnet build backend/NEXORA.slnx
cd frontend
npm run build
npm test -- --watch=false
cd ..
git diff --check
git status
```

Verificación realizada en esta entrega:

| Verificación | Resultado |
|---|---|
| Build de los cuatro proyectos .NET 10 | Correcto, cero errores y cero advertencias |
| Build de Angular | Correcto |
| Tests de Angular | 12 aprobados en 3 archivos |
| GET real de Admin y Auditor | 200 y cuatro cuentas |
| GET real de Cliente | 403 |
| GET real sin sesión o clave incorrecta | 401 |
| Respuestas sin campo contrasena | Correcto |
| CORS y preflight desde localhost:4200 | Correcto |
| Alias /api/usuarios y detalle protegidos | Correcto |
| POST anónimo bloqueado | Correcto |
| Carrito existente GET /api/carrito/cliente-demo | Continúa respondiendo 200 |
| Rol falso enviado por Cliente | Continúa bloqueado con 403 |

Se verificó el renderizado funcional mediante las pruebas Angular; no se completó una revisión visual en Chromium por falta de un navegador ejecutable en el entorno. Revisa en tu navegador las tarjetas, el spinner y el botón de reintento con las instrucciones anteriores.

## 16 Cómo aplicar SOLID en esta historia

S: Usuario almacena datos, el repositorio accede a la lista, ListarUsuarios prepara la lectura, el adaptador atiende autenticación HTTP, el controller atiende solicitudes y UsuariosService mantiene el estado de presentación.

O: los puertos permiten incorporar un repositorio de base de datos o cambiar el adaptador de autenticación. La configuración de DI y las rutas son puntos de composición que necesariamente se actualizan para registrar una funcionalidad nueva. Agregar funcionalidad no implica que nunca se pueda editar ningún archivo.

L: otra implementación de IConsultaUsuarios debe devolver una lista y null ante un ID inexistente respetando el mismo contrato. Esa implementación podrá reemplazar la de memoria sin cambiar ListarUsuarios; sus errores de acceso se atenderán mediante la API y el estado de error del frontend.

I: IConsultaUsuarios solo tiene lectura; IAccesoUsuarios solo comprueba credenciales; IListarUsuarios expone el caso de uso. Se conserva IUsuarioRepository por compatibilidad con el servicio existente, sin imponer sus métodos de escritura al directorio.

D: ListarUsuarios recibe IConsultaUsuarios y UsuariosController recibe IListarUsuarios. Ninguno construye UsuarioRepositoryMemoria con new. API registra la implementación concreta porque Program es el punto de composición. En Angular, los services se obtienen por inyección y el componente delega en su ViewModel.

## 17 Subir correctamente a GitHub

Todos los cambios de esta entrega están en una rama local de trabajo; no fueron enviados al GitHub del equipo. Las instrucciones siguientes son para ejecutarlas desde tu cuenta con acceso de colaboración. Mantén la rama individual como destino del push.

Si también quieres conservar la guía en el repositorio, copia este archivo a `docs/US11_Guia.md` y registra un commit opcional:

```powershell
git add docs/US11_Guia.md
git commit -m "docs(us11): agrega guia de ejecucion y verificacion"
```

Revisa qué commits y archivos subirás y que SP4 no haya recibido cambios nuevos desde que empezaste:

```powershell
git fetch origin
git log --oneline origin/SP4..HEAD
git diff --stat origin/SP4...HEAD
git log --oneline HEAD..origin/SP4
```

Si la última orden muestra commits, con el árbol limpio integra SP4 en tu rama individual:

```powershell
git merge origin/SP4
```

Resuelve cualquier conflicto conservando las funcionalidades de ambas historias, ejecuta las verificaciones otra vez y termina el merge con `git add` de los archivos resueltos y `git commit` cuando Git lo solicite. No borres el código del compañero para resolver un conflicto.

Una vez verificado:

```powershell
git push -u origin Task-11-listar-usuarios
```

Si GitHub rechaza el push por permisos, la propietaria debe darte acceso de colaborador o el equipo debe acordar el flujo mediante fork; cambiar de rama no concede permisos. Para la autenticación usa la cuenta de GitHub configurada en tu equipo. No compartas claves ni tokens por el chat.

En GitHub abre el repositorio, pulsa Compare & pull request y configura:

- **Base:** SP4.
- **Compare:** Task-11-listar-usuarios.
- **Título:** feat(usuarios): implementa US11 con API propia y directorio protegido.

La descripción debe explicar el endpoint, el directorio de lectura, el bloqueo de Cliente, carga/error/reintento, el DTO sin contraseña y las verificaciones. También debe indicar que el adaptador Basic es para la sesión académica existente y que la rama de login todavía requiere integración. El orden de creación main → DEV → QA → SP4 sirve para establecer las bases; tu PR vuelve a SP4. La promoción posterior entre las ramas del equipo corresponde a su proceso de integración.

No subas node_modules, dist, bin ni obj, ni crees otra carpeta frontend dentro de frontend. El ZIP no contiene dependencias compiladas ni una copia de .git.

## 18 Puntos de integración con US01

Cuando el equipo combine las ramas, Program.cs debe conservar los registros de usuarios y de carrito y la configuración CORS. UsuariosController.cs debe conservar el método Login de US01 además de los métodos protegidos de US11. UsuarioRepositoryMemoria.cs debe conservar cualquier método ObtenerPorCredenciales agregado por US01 y los métodos nuevos de US11, trabajando sobre la misma lista. No reemplaces esos archivos por una versión de una sola rama.

En Angular conserva AuthService y el componente Login del compañero. Combina las rutas con una decisión explícita sobre la página inicial: US11 deja el detalle como raíz para respetar SP4, mientras Task-01-Login usa Login como raíz y navega a / al terminar. Al integrarlo, la navegación tras iniciar sesión debe ir a la tienda y no otra vez al mismo Login. Ese ajuste pertenece a la integración de US01, no a esta entrega.

El adaptador de US11 espera la sesión que hoy guarda AuthService. Si US01 cambia el formato o deja de almacenar contrasena para usar un token, actualiza SesionUsuariosService y reemplaza UsuariosBasicHandler por el esquema de autenticación común. Conserva las comprobaciones de autorización en el servidor. Los guards de Angular por sí solos no protegen un endpoint REST.
