using NEXORA.Domain.Entities;

namespace NEXORA.Application.Interfaces;

public interface IRepositorioCarrito
{
    ArticuloCarrito AgregarOIncrementar(string clienteId, ArticuloCarrito articulo);
    IReadOnlyCollection<ArticuloCarrito> ObtenerPorCliente(string clienteId);
    bool ActualizarCantidad(string clienteId, int productoId, int cantidad);
    bool EliminarArticulo(string clienteId, int productoId);
}
