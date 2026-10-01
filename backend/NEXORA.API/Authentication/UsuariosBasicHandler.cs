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
