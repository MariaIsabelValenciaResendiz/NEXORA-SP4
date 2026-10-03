using NEXORA.Domain.Entities;

namespace NEXORA.Application.Interfaces;

public interface IGestionarCarrito
{
    IReadOnlyCollection<ArticuloCarrito> Obtener(string clienteId);
    ArticuloCarrito Agregar(string clienteId, ArticuloCarrito articulo);
    bool ActualizarCantidad(string clienteId, int productoId, int cantidad);
    bool EliminarArticulo(string clienteId, int productoId);
}
