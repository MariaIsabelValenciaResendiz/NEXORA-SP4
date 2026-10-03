using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using NEXORA.API.Authentication;
using NEXORA.Application.Interfaces;
using NEXORA.Application.UseCases;
using NEXORA.Domain.Entities;

namespace NEXORA.API.Controllers;

[ApiController]
[Route("api/carrito")]
[Authorize(AuthenticationSchemes = UsuariosBasicHandler.NombreEsquema, Roles = "cliente")]
public sealed class CarritoController(IGestionarCarrito carrito)
    : ControllerBase
{
    [HttpGet("{clienteId}")]
    public ActionResult<IReadOnlyCollection<ArticuloCarrito>> Obtener(string clienteId)
    {
        if (!EsCarritoDelUsuarioAutenticado(clienteId)) return Forbid();
        return Ok(carrito.Obtener(clienteId));
    }

    [HttpPost("{clienteId}/articulos")]
    public ActionResult<ArticuloCarrito> Agregar(
        string clienteId,
        [FromBody] AgregarArticuloRequest request)
    {
        if (!EsCarritoDelUsuarioAutenticado(clienteId)) return Forbid();

        try
        {
            var articulo = new ArticuloCarrito(
                request.ProductoId,
                request.Titulo,
                request.Precio,
                request.Imagen,
                request.Cantidad);

            var resultado = carrito.Agregar(clienteId, articulo);

            return Ok(resultado);
        }
        catch (ArgumentException exception)
        {
            return BadRequest(exception.Message);
        }
    }

    [HttpPut("{clienteId}/articulos/{productoId:int}")]
    public IActionResult ActualizarCantidad(
        string clienteId,
        int productoId,
        [FromBody] ActualizarCantidadRequest request)
    {
        if (!EsCarritoDelUsuarioAutenticado(clienteId)) return Forbid();

        try
        {
            return carrito.ActualizarCantidad(clienteId, productoId, request.Cantidad)
                ? NoContent()
                : NotFound();
        }
        catch (ArgumentOutOfRangeException exception)
        {
            return BadRequest(exception.Message);
        }
        catch (ArgumentException exception)
        {
            return BadRequest(exception.Message);
        }
    }

    [HttpDelete("{clienteId}/articulos/{productoId:int}")]
    public IActionResult EliminarArticulo(string clienteId, int productoId)
    {
        if (!EsCarritoDelUsuarioAutenticado(clienteId)) return Forbid();

        try
        {
            return carrito.EliminarArticulo(clienteId, productoId)
                ? NoContent()
                : NotFound();
        }
        catch (ArgumentOutOfRangeException exception)
        {
            return BadRequest(exception.Message);
        }
        catch (ArgumentException exception)
        {
            return BadRequest(exception.Message);
        }
    }

    private bool EsCarritoDelUsuarioAutenticado(string clienteId)
    {
        var usuarioId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        return !string.IsNullOrWhiteSpace(clienteId) &&
               string.Equals(clienteId, usuarioId, StringComparison.Ordinal);
    }
}

public sealed record AgregarArticuloRequest(
    int ProductoId,
    string Titulo,
    decimal Precio,
    string Imagen,
    int Cantidad);

public sealed record ActualizarCantidadRequest(int Cantidad);
