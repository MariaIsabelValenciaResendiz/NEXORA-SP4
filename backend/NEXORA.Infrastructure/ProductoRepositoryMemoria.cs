using NEXORA.Application;
using NEXORA.Domain;

namespace NEXORA.Infrastructure;

public class ProductoRepositoryMemoria : IProductoRepository
{
    private static readonly List<Producto> _productos = new();

    public void Agregar(Producto producto)
    {
        producto.Id = _productos.Count > 0
            ? _productos.Max(p => p.Id) + 1
            : 1;

        _productos.Add(producto);
    }
}