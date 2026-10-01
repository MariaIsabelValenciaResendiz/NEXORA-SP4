import { HttpClient } from '@angular/common/http';
import { Injectable, computed, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { ArticuloCarrito, ProductoDetalle, RolUsuario } from '../models/articulo-carrito.model';

const API_URL = 'http://localhost:5043/api/carrito';
const CLIENTE_ID = 'cliente-demo';
const SESSION_CART_KEY = 'nexora-carrito';
const SESSION_ROLE_KEY = 'nexora-rol-demo';

@Injectable({ providedIn: 'root' })
export class CarritoService {
  readonly producto: ProductoDetalle = {
    id: 1,
    titulo: 'Producto de ejemplo',
    descripcion: 'Producto de demostración para probar el flujo de agregado al carrito. Se conectará al catálogo cuando esté integrado.',
    precio: 29.99,
    imagen: '/producto-demo.svg',
  };

  private readonly articulos = signal<ArticuloCarrito[]>(this.leerCarrito());
  private readonly rolActual = signal<RolUsuario>(this.leerRol());
  readonly carrito = this.articulos.asReadonly();
  readonly cantidadTotal = computed(() => this.articulos().reduce((total, item) => total + item.cantidad, 0));
  readonly esCliente = computed(() => this.rolActual() === 'Cliente');
  readonly rol = this.rolActual.asReadonly();

  constructor(private readonly http: HttpClient) {}

  agregar(producto: ProductoDetalle, cantidad: number): Observable<ArticuloCarrito> {
    if (!Number.isInteger(cantidad) || cantidad <= 0) {
      throw new Error('La cantidad debe ser un número entero mayor que cero.');
    }

    return this.http.post<ArticuloCarrito>(`${API_URL}/${CLIENTE_ID}/articulos`, {
      productoId: producto.id,
      titulo: producto.titulo,
      precio: producto.precio,
      imagen: producto.imagen,
      cantidad,
    }).pipe(tap((articulo) => this.actualizarEstado(articulo)));
  }

  cambiarRol(rol: RolUsuario): void {
    this.rolActual.set(rol);
    sessionStorage.setItem(SESSION_ROLE_KEY, rol);
  }

  private actualizarEstado(articulo: ArticuloCarrito): void {
    const otrosArticulos = this.articulos().filter((item) => item.productoId !== articulo.productoId);
    const actualizados = [...otrosArticulos, articulo];
    this.articulos.set(actualizados);
    sessionStorage.setItem(SESSION_CART_KEY, JSON.stringify(actualizados));
  }

  private leerCarrito(): ArticuloCarrito[] {
    try {
      return JSON.parse(sessionStorage.getItem(SESSION_CART_KEY) ?? '[]') as ArticuloCarrito[];
    } catch {
      return [];
    }
  }

  private leerRol(): RolUsuario {
    return sessionStorage.getItem(SESSION_ROLE_KEY) === 'Auditor' ? 'Auditor' : 'Cliente';
  }
}
