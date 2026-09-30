using NEXORA.Domain;

namespace NEXORA.Application;

public class UsuarioService
{
    private readonly IUsuarioRepository _usuarioRepository;

    public UsuarioService(IUsuarioRepository usuarioRepository)
    {
        _usuarioRepository = usuarioRepository;
    }

    public List<Usuario> ObtenerTodos()
    {
        return _usuarioRepository.ObtenerTodos();
    }

    public Usuario? ObtenerPorId(int id)
    {
        return _usuarioRepository.ObtenerPorId(id);
    }

    public void Registrar(Usuario usuario)
    {
        _usuarioRepository.Agregar(usuario);
    }
}