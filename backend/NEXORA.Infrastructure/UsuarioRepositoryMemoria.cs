using NEXORA.Application;
using NEXORA.Application.Interfaces;
using NEXORA.Domain;

namespace NEXORA.Infrastructure;

public class UsuarioRepositoryMemoria : IUsuarioRepository, IConsultaUsuarios, IAccesoUsuarios
{
    private readonly object _candado = new();
    // Datos "crudos" — simulan la base de datos mientras no hay una real
    private readonly List<Usuario> _usuarios = new()
    {
        new Usuario(1, "María Isabel", "clave123", "admin")
        {
            Correo = "maria@nexora.mx", Telefono = "55 0102 7788", NombreUsuario = "maria.admin",
            Direccion = new DireccionUsuario
            {
                Ciudad = "San Juan del Río", Calle = "Centro", Numero = 10, CodigoPostal = "76800",
                Geolocalizacion = new CoordenadasUsuario { Latitud = "20.388", Longitud = "-99.996" }
            }
        },
        new Usuario(2, "Juan Pérez", "clave456", "cliente")
        {
            Correo = "juan@nexora.mx", Telefono = "55 0102 7790", NombreUsuario = "juan.p"
        },
        new Usuario(3, "Ana López", "clave789", "cliente")
        {
            Correo = "ana@nexora.mx", Telefono = "55 0102 7791", NombreUsuario = "ana.l"
        },
        new Usuario(4, "Laura Méndez", "auditor123", "auditor")
        {
            Correo = "laura@nexora.mx", Telefono = "55 0102 7792", NombreUsuario = "laura.m"
        }
    };

    public List<Usuario> ObtenerTodos()
    {
        lock (_candado) return _usuarios.ToList();
    }

    public IReadOnlyList<Usuario> Listar()
    {
        lock (_candado) return _usuarios.ToArray();
    }

    public Usuario? ObtenerPorId(int id)
    {
        lock (_candado) return _usuarios.FirstOrDefault(u => u.Id == id);
    }

    public Usuario? Autenticar(string nombre, string contrasena)
    {
        lock (_candado)
        {
            return _usuarios.FirstOrDefault(u =>
                (string.Equals(u.Nombre, nombre, StringComparison.OrdinalIgnoreCase) ||
                 string.Equals(u.NombreUsuario, nombre, StringComparison.OrdinalIgnoreCase)) &&
                u.Contrasena == contrasena);
        }
    }

    public void Agregar(Usuario usuario)
    {
        lock (_candado)
        {
            usuario.Id = _usuarios.Count > 0 ? _usuarios.Max(u => u.Id) + 1 : 1;
            _usuarios.Add(usuario);
        }
    }

    public Usuario? ObtenerPorCredenciales(
    string nombre,
    string contrasena)
{
    lock (_candado)
    {
        return _usuarios.FirstOrDefault(u =>
            u.Nombre == nombre &&
            u.Contrasena == contrasena);
    }
}
}
