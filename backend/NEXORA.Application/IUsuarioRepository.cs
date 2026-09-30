using NEXORA.Domain;

namespace NEXORA.Application;

public interface IUsuarioRepository
{
    List<Usuario> ObtenerTodos();
    Usuario? ObtenerPorId(int id);
    void Agregar(Usuario usuario);
}