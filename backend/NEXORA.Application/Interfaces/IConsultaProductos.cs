using NEXORA.Domain;

namespace NEXORA.Application.Interfaces;

public interface IConsultaProductos
{
    IReadOnlyList<Producto> ObtenerTodos();
}
