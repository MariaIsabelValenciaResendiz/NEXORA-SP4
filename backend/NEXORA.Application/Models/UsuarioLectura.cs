using NEXORA.Domain;

namespace NEXORA.Application.Models;

public sealed record UsuarioLectura(
    int Id,
    string Nombre,
    string Correo,
    string Telefono,
    string NombreUsuario,
    DireccionUsuario Direccion);
