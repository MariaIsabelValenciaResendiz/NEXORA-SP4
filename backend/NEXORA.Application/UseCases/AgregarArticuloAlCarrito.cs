using NEXORA.Application.Interfaces;
using NEXORA.Domain.Entities;

namespace NEXORA.Application.UseCases;

public sealed class AgregarArticuloAlCarrito(
    IRepositorioCarrito repositorio)
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
