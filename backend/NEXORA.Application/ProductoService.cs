using NEXORA.Domain;

namespace NEXORA.Application;

public class ProductoService
{
    private readonly IProductoRepository _productoRepository;

    public ProductoService(IProductoRepository productoRepository)
    {
        _productoRepository = productoRepository;
    }

    public Producto Registrar(Producto producto)
    {
        _productoRepository.Agregar(producto);
        return producto;
    }
}