using NEXORA.Domain;

namespace NEXORA.Application.Interfaces;

public interface IConsultaUsuarios
{
    IReadOnlyList<Usuario> Listar();
    Usuario? ObtenerPorId(int id);
}
