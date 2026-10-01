using NEXORA.Domain;

namespace NEXORA.Application;

public interface IProductoRepository
{
    void Agregar(Producto producto);
}