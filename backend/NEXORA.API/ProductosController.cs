using Microsoft.AspNetCore.Mvc;
using NEXORA.Application;
using NEXORA.Application.UseCases;
using NEXORA.Domain;

namespace NEXORA.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ProductosController : ControllerBase
{
    private readonly ProductoService _productoService;
    private readonly ListarProductos _listarProductos;

    public ProductosController(ProductoService productoService, ListarProductos listarProductos)
    {
        _productoService = productoService;
        _listarProductos = listarProductos;
    }

    [HttpGet]
    public ActionResult<IReadOnlyList<Producto>> ObtenerTodos()
    {
        return Ok(_listarProductos.Ejecutar());
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
