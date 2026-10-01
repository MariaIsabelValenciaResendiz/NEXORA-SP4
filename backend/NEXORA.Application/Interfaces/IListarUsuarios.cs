using NEXORA.Application.Models;

namespace NEXORA.Application.Interfaces;

public interface IListarUsuarios
{
    IReadOnlyList<UsuarioLectura> Ejecutar();
    UsuarioLectura? Buscar(int id);
}
