using NEXORA.Domain.Entities;
using NEXORA.Application.Interfaces;

namespace NEXORA.Application.UseCases;

public sealed class AgregarArticuloAlCarrito(
    IRepositorioCarrito repositorio)
    : IAgregarArticuloAlCarrito
{
    public ArticuloCarrito Ejecutar(
        string clienteId,
        ArticuloCarrito articulo)
    {
        if (string.IsNullOrWhiteSpace(clienteId))
            throw new ArgumentException("El identificador del cliente es obligatorio.", nameof(clienteId));

        return repositorio.AgregarOIncrementar(clienteId, articulo);
    }
}
