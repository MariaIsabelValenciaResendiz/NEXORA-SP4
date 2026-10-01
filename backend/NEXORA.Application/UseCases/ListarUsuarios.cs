using NEXORA.Application.Interfaces;
using NEXORA.Application.Models;
using NEXORA.Domain;

namespace NEXORA.Application.UseCases;

public sealed class ListarUsuarios(IConsultaUsuarios repositorio) : IListarUsuarios
{
    public IReadOnlyList<UsuarioLectura> Ejecutar()
    {
        return repositorio.Listar().Select(Mapear).ToArray();
    }

    public UsuarioLectura? Buscar(int id)
    {
        var usuario = repositorio.ObtenerPorId(id);
        return usuario is null ? null : Mapear(usuario);
    }

    public static UsuarioLectura Mapear(Usuario usuario)
    {
        return new UsuarioLectura(
            usuario.Id,
            usuario.Nombre ?? string.Empty,
            usuario.Correo ?? string.Empty,
            usuario.Telefono ?? string.Empty,
            usuario.NombreUsuario ?? string.Empty,
            usuario.Direccion ?? new DireccionUsuario());
    }
}
