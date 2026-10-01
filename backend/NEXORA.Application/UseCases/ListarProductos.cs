using NEXORA.Application.Interfaces;
using NEXORA.Domain;

namespace NEXORA.Application.UseCases;

public sealed class ListarProductos(IConsultaProductos repositorio)
{
    public IReadOnlyList<Producto> Ejecutar()
    {
        return repositorio.ObtenerTodos();
    }
}
