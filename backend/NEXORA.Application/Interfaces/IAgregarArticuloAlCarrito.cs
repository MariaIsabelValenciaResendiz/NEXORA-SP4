using NEXORA.Domain.Entities;

namespace NEXORA.Application.Interfaces;

public interface IAgregarArticuloAlCarrito
{
    ArticuloCarrito Ejecutar(string clienteId, ArticuloCarrito articulo);
}
