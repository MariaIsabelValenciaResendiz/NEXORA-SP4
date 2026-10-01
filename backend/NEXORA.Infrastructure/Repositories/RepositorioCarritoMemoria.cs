using System.Collections.Concurrent;
using NEXORA.Application.Interfaces;
using NEXORA.Domain.Entities;

namespace NEXORA.Infrastructure.Repositories;

public sealed class RepositorioCarritoMemoria : IRepositorioCarrito
{
    private readonly ConcurrentDictionary<string, List<ArticuloCarrito>> _carritos = new();
    private readonly ConcurrentDictionary<string, object> _candados = new();

    public ArticuloCarrito AgregarOIncrementar(string clienteId, ArticuloCarrito articulo)
    {
        var carrito = _carritos.GetOrAdd(clienteId, _ => []);
        var candado = _candados.GetOrAdd(clienteId, _ => new object());

        lock (candado)
        {
            var existente = carrito.FirstOrDefault(item => item.ProductoId == articulo.ProductoId);
            if (existente is not null)
            {
                existente.IncrementarCantidad(articulo.Cantidad);
                return existente;
            }

            carrito.Add(articulo);
            return articulo;
        }
    }

    public IReadOnlyCollection<ArticuloCarrito> ObtenerPorCliente(string clienteId)
    {
        if (!_carritos.TryGetValue(clienteId, out var carrito)) return [];
        var candado = _candados.GetOrAdd(clienteId, _ => new object());
        lock (candado) return carrito.ToArray();
    }
}
