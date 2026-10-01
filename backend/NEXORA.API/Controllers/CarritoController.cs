using Microsoft.AspNetCore.Mvc;
using NEXORA.Application.Interfaces;
using NEXORA.Application.UseCases;
using NEXORA.Domain.Entities;

namespace NEXORA.API.Controllers;

[ApiController]
[Route("api/carrito")]
public sealed class CarritoController(AgregarArticuloAlCarrito agregarArticulo, IRepositorioCarrito repositorio)
    : ControllerBase
{
    [HttpGet("{clienteId}")]
    public ActionResult<IReadOnlyCollection<ArticuloCarrito>> Obtener(string clienteId)
    {
        if (string.IsNullOrWhiteSpace(clienteId)) return BadRequest("El cliente es obligatorio.");
        return Ok(repositorio.ObtenerPorCliente(clienteId));
    }

    [HttpPost("{clienteId}/articulos")]
    public ActionResult<ArticuloCarrito> Agregar(
        string clienteId,
        [FromBody] AgregarArticuloRequest request)
    {
        try
        {
            var articulo = new ArticuloCarrito(
                request.ProductoId,
                request.Titulo,
                request.Precio,
                request.Imagen,
                request.Cantidad);

            var resultado = agregarArticulo.Ejecutar(clienteId, articulo);

            return Ok(resultado);
        }
        catch (ArgumentException exception)
        {
            return BadRequest(exception.Message);
        }
    }
}

public sealed record AgregarArticuloRequest(
    int ProductoId,
    string Titulo,
    decimal Precio,
    string Imagen,
    int Cantidad);
