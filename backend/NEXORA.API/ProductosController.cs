using Microsoft.AspNetCore.Mvc;
using NEXORA.Application;
using NEXORA.Domain;

namespace NEXORA.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ProductosController : ControllerBase
{
    private readonly ProductoService _productoService;

    public ProductosController(ProductoService productoService)
    {
        _productoService = productoService;
    }

    [HttpPost]
    public IActionResult Registrar([FromBody] Producto producto)
    {
        var productoRegistrado = _productoService.Registrar(producto);

        return Created(
            $"/api/productos/{productoRegistrado.Id}",
            productoRegistrado
        );
    }
}