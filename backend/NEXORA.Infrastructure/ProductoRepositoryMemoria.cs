using NEXORA.Application;
using NEXORA.Application.Interfaces;
using NEXORA.Domain;

namespace NEXORA.Infrastructure;

public class ProductoRepositoryMemoria : IProductoRepository, IConsultaProductos
{
    private readonly object _candado = new();
    private readonly List<Producto> _productos =
    [
        new Producto(
            1,
            "Bolso Nómada",
            58.00m,
            "Diseño sobrio con compartimentos amplios y acabados resistentes para uso diario.",
            "/productos/bolso-nomada.svg",
            "Accesorios"),
        new Producto(
            2,
            "Unidad Nova",
            74.90m,
            "Calzado urbano ligero con una silueta limpia y materiales pensados para el uso cotidiano.",
            "/productos/unidad-nova.svg",
            "Ropa"),
        new Producto(
            3,
            "Aro Alba",
            31.50m,
            "Accesorio minimalista de acabado mate para complementar estilos casuales y formales.",
            "/productos/aro-alba.svg",
            "Accesorios"),
        new Producto(
            4,
            "Suéter Lino",
            46.00m,
            "Prenda suave de corte relajado y tono neutro para combinar durante todo el año.",
            "/productos/sueter-lino.svg",
            "Ropa")
    ];

    public void Agregar(Producto producto)
    {
        lock (_candado)
        {
            producto.Id = _productos.Count > 0
                ? _productos.Max(p => p.Id) + 1
                : 1;

            _productos.Add(producto);
        }
    }

    public IReadOnlyList<Producto> ObtenerTodos()
    {
        lock (_candado)
        {
            return _productos.ToArray();
        }
    }
}
