import { HttpClient } from '@angular/common/http';
import { Injectable, computed, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { Producto } from '../../models/producto.model';
import { SesionUsuariosService } from '../../usuarios/services/sesion-usuarios.service';
import { ArticuloCarrito, ProductoDetalle, RolUsuario } from '../models/articulo-carrito.model';

const API_URL = 'http://localhost:5043/api/carrito';
const CLIENTE_ID = 'cliente-demo';
const SESSION_CART_KEY = 'nexora-carrito';

@Injectable({ providedIn: 'root' })
export class CarritoService {
  private readonly productoActual = signal<ProductoDetalle>({
    id: 1,
    titulo: 'Bolso Nómada',
    descripcion: 'Diseño sobrio con compartimentos amplios y acabados resistentes para uso diario.',
    precio: 58,
    imagen: '/productos/bolso-nomada.svg',
    categoria: 'Accesorios',
  });

  private readonly articulos = signal<ArticuloCarrito[]>(this.leerCarrito());
  readonly producto = this.productoActual.asReadonly();
  readonly carrito = this.articulos.asReadonly();
  readonly cantidadTotal = computed(() => this.articulos().reduce((total, item) => total + item.cantidad, 0));
  readonly totalCarrito = computed(() => this.articulos().reduce((total, item) => total + item.precio * item.cantidad, 0));
  readonly esCliente = (): boolean => this.sesion.rol() === 'cliente';
  readonly rol = (): RolUsuario => this.leerRol();

  constructor(
    private readonly http: HttpClient,
    private readonly sesion: SesionUsuariosService,
  ) {}

  seleccionarProducto(producto: Producto): void {
    this.productoActual.set({
      id: producto.id,
      titulo: producto.titulo,
      descripcion: producto.descripcion,
      precio: producto.precio,
      imagen: producto.imagenUrl,
      categoria: producto.categoria,
    });
  }

  agregar(producto: ProductoDetalle, cantidad: number): Observable<ArticuloCarrito> {
    if (!this.esCliente()) {
      throw new Error('Solo los clientes pueden añadir productos al carrito.');
    }

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
    const rol = this.sesion.rol();

    if (rol === 'admin' || rol === 'administrador') return 'Administrador';
    if (rol === 'auditor') return 'Auditor';
    return 'Cliente';
  }
}
