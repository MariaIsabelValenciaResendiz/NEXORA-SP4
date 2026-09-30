namespace NEXORA.Domain;

public class Usuario
{
    public int Id { get; set; }
    public string Nombre { get; set; } = string.Empty;
    public string Contrasena { get; set; } = string.Empty;
    public string Rol { get; set; } = string.Empty;

    public Usuario() { }

    public Usuario(int id, string nombre, string contrasena, string rol)
    {
        Id = id;
        Nombre = nombre;
        Contrasena = contrasena;
        Rol = rol;
    }
}