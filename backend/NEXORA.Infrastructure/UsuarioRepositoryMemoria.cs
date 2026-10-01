using NEXORA.Application;
using NEXORA.Domain;

namespace NEXORA.Infrastructure;

public class UsuarioRepositoryMemoria : IUsuarioRepository
{
    // Datos "crudos" — simulan la base de datos mientras no hay una real
    private readonly List<Usuario> _usuarios = new()
    {
        new Usuario(1, "María Isabel", "clave123", "admin"),
        new Usuario(2, "Juan Pérez", "clave456", "cliente"),
        new Usuario(3, "Ana López", "clave789", "cliente")
    };

    public List<Usuario> ObtenerTodos()
    {
        return _usuarios;
    }

    public Usuario? ObtenerPorId(int id)
    {
        return _usuarios.FirstOrDefault(u => u.Id == id);
    }

    public void Agregar(Usuario usuario)
    {
        usuario.Id = _usuarios.Count > 0 ? _usuarios.Max(u => u.Id) + 1 : 1;
        _usuarios.Add(usuario);
    }

    public Usuario? ObtenerPorCredenciales(string nombre, string contrasena)
    {
        return _usuarios.FirstOrDefault(u => u.Nombre == nombre && u.Contrasena == contrasena);
    }
}