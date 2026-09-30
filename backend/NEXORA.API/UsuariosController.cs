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
