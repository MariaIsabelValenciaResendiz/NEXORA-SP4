namespace NEXORA.Domain;

public class Producto
{
    public int Id { get; set; }
    public string Titulo { get; set; } = string.Empty;
    public decimal Precio { get; set; }
    public string Descripcion { get; set; } = string.Empty;
    public string ImagenUrl { get; set; } = string.Empty;
    public string Categoria { get; set; } = string.Empty;

    public Producto() { }

    public Producto(
        int id,
        string titulo,
        decimal precio,
        string descripcion,
        string imagenUrl,
        string categoria)
    {
        Id = id;
        Titulo = titulo;
        Precio = precio;
        Descripcion = descripcion;
        ImagenUrl = imagenUrl;
        Categoria = categoria;
    }
}