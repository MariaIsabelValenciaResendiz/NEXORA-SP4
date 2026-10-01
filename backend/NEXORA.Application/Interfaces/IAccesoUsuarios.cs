using NEXORA.Domain;

namespace NEXORA.Application.Interfaces;

public interface IAccesoUsuarios
{
    Usuario? Autenticar(string nombre, string contrasena);
}
