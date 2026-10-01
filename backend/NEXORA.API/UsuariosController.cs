using Microsoft.AspNetCore.Mvc;
using NEXORA.Application;
using NEXORA.Domain;
using NEXORA.API;

namespace NEXORA.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class UsuariosController : ControllerBase
{
    private readonly UsuarioService _usuarioService;

    public UsuariosController(UsuarioService usuarioService)
    {
        _usuarioService = usuarioService;
    }

    [HttpGet]
    public IActionResult ObtenerTodos()
    {
        return Ok(_usuarioService.ObtenerTodos());
    }

    [HttpGet("{id}")]
    public IActionResult ObtenerPorId(int id)
    {
        var usuario = _usuarioService.ObtenerPorId(id);
        if (usuario == null) return NotFound();
        return Ok(usuario);
    }

    [HttpPost]
    public IActionResult Registrar([FromBody] Usuario usuario)
    {
        _usuarioService.Registrar(usuario);
        return CreatedAtAction(nameof(ObtenerPorId), new { id = usuario.Id }, usuario);
    }

    [HttpPost("login")]
    public IActionResult Login([FromBody] LoginRequest request)
{
    var usuario = _usuarioService.IniciarSesion(request.Nombre, request.Contrasena);

    if (usuario == null)
        return Unauthorized(new { mensaje = "Usuario o contraseña inválidos" });

    return Ok(usuario);
}
}