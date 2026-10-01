namespace NEXORA.Domain.Entities;

public sealed class ArticuloCarrito
{
    public int ProductoId { get; private set; }
    public string Titulo { get; private set; }
    public decimal Precio { get; private set; }
    public string Imagen { get; private set; }
    public int Cantidad { get; private set; }

    public ArticuloCarrito(int productoId, string titulo, decimal precio, string imagen, int cantidad)
    {
        if (productoId <= 0) throw new ArgumentOutOfRangeException(nameof(productoId));
        if (string.IsNullOrWhiteSpace(titulo)) throw new ArgumentException("El título es obligatorio.", nameof(titulo));
        if (precio < 0) throw new ArgumentOutOfRangeException(nameof(precio));
        if (cantidad <= 0) throw new ArgumentOutOfRangeException(nameof(cantidad));

        ProductoId = productoId;
        Titulo = titulo;
        Precio = precio;
        Imagen = imagen ?? string.Empty;
        Cantidad = cantidad;
    }

    public void IncrementarCantidad(int cantidad)
    {
        if (cantidad <= 0) throw new ArgumentOutOfRangeException(nameof(cantidad));
        Cantidad += cantidad;
    }
}
