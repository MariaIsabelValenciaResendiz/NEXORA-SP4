namespace NEXORA.Domain;

public class DireccionUsuario
{
    public string Ciudad { get; set; } = string.Empty;
    public string Calle { get; set; } = string.Empty;
    public int Numero { get; set; }
    public string CodigoPostal { get; set; } = string.Empty;
    public CoordenadasUsuario Geolocalizacion { get; set; } = new();
}

public class CoordenadasUsuario
{
    public string Latitud { get; set; } = string.Empty;
    public string Longitud { get; set; } = string.Empty;
}
