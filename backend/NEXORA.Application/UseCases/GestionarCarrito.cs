using NEXORA.Application.Interfaces;
using NEXORA.Domain.Entities;

namespace NEXORA.Application.UseCases;

public sealed class GestionarCarrito(
    IRepositorioCarrito repositorio,
    IAgregarArticuloAlCarrito agregarArticulo) : IGestionarCarrito
{
    public IReadOnlyCollection<ArticuloCarrito> Obtener(string clienteId)
    {
        ValidarCliente(clienteId);
        return repositorio.ObtenerPorCliente(clienteId);
    }

    public ArticuloCarrito Agregar(string clienteId, ArticuloCarrito articulo)
    {
        ValidarCliente(clienteId);
        ArgumentNullException.ThrowIfNull(articulo);
        return agregarArticulo.Ejecutar(clienteId, articulo);
    }

    public bool ActualizarCantidad(string clienteId, int productoId, int cantidad)
    {
        ValidarCliente(clienteId);
        if (productoId <= 0) throw new ArgumentOutOfRangeException(nameof(productoId));
        if (cantidad <= 0) throw new ArgumentOutOfRangeException(nameof(cantidad));

        return repositorio.ActualizarCantidad(clienteId, productoId, cantidad);
    }

    public bool EliminarArticulo(string clienteId, int productoId)
    {
        ValidarCliente(clienteId);
        if (productoId <= 0) throw new ArgumentOutOfRangeException(nameof(productoId));

        return repositorio.EliminarArticulo(clienteId, productoId);
    }

    private static void ValidarCliente(string clienteId)
    {
        if (string.IsNullOrWhiteSpace(clienteId))
            throw new ArgumentException("El identificador del cliente es obligatorio.", nameof(clienteId));
    }
}
