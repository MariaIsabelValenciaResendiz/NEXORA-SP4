import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable, computed, signal } from '@angular/core';
import { Observable, catchError, tap, throwError } from 'rxjs';
import { Producto } from '../../models/producto.model';
import { SesionUsuariosService } from '../../usuarios/services/sesion-usuarios.service';
import { ArticuloCarrito, ProductoDetalle, RolUsuario } from '../models/articulo-carrito.model';

const API_URL = 'http://localhost:5043/api/carrito';
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

    const clienteId = this.obtenerClienteId();
    return this.http.post<ArticuloCarrito>(`${API_URL}/${clienteId}/articulos`, {
      productoId: producto.id,
      titulo: producto.titulo,
      precio: producto.precio,
      imagen: producto.imagen,
      cantidad,
    }, { headers: this.encabezadosAutorizados() })
      .pipe(tap((articulo) => this.actualizarEstado(articulo)));
  }

  cargarCarrito(): Observable<ArticuloCarrito[]> {
    const clienteId = this.obtenerClienteId();
    return this.http.get<ArticuloCarrito[]>(`${API_URL}/${clienteId}`, {
      headers: this.encabezadosAutorizados(),
    }).pipe(tap((articulos) => this.guardarEstado(articulos)));
  }

  actualizarCantidad(productoId: number, cantidad: number): Observable<void> {
    if (!Number.isInteger(cantidad) || cantidad <= 0) {
      throw new Error('La cantidad debe ser un número entero mayor que cero.');
    }

    const clienteId = this.obtenerClienteId();
    const estadoAnterior = this.articulos();
    this.reemplazarCantidad(productoId, cantidad);
    return this.http.put<void>(`${API_URL}/${clienteId}/articulos/${productoId}`, { cantidad }, {
      headers: this.encabezadosAutorizados(),
    }).pipe(catchError((error: unknown) => {
      this.guardarEstado(estadoAnterior);
      return throwError(() => error);
    }));
  }

  eliminarArticulo(productoId: number): Observable<void> {
    const clienteId = this.obtenerClienteId();
    const estadoAnterior = this.articulos();
    this.guardarEstado(estadoAnterior.filter((articulo) => articulo.productoId !== productoId));
    return this.http.delete<void>(`${API_URL}/${clienteId}/articulos/${productoId}`, {
      headers: this.encabezadosAutorizados(),
    }).pipe(catchError((error: unknown) => {
      this.guardarEstado(estadoAnterior);
      return throwError(() => error);
    }));
  }

  private actualizarEstado(articulo: ArticuloCarrito): void {
    const articulos = [...this.articulos()];
    const indice = articulos.findIndex((item) => item.productoId === articulo.productoId);
    if (indice < 0) articulos.push(articulo);
    else articulos[indice] = articulo;
    this.guardarEstado(articulos);
  }

  private reemplazarCantidad(productoId: number, cantidad: number): void {
    this.guardarEstado(this.articulos().map((articulo) =>
      articulo.productoId === productoId ? { ...articulo, cantidad } : articulo,
    ));
  }

  private guardarEstado(articulos: ArticuloCarrito[]): void {
    this.articulos.set(articulos);
    sessionStorage.setItem(SESSION_CART_KEY, JSON.stringify(articulos));
  }

  private obtenerClienteId(): string {
    const sesion = this.sesion.obtener();
    if (!sesion || this.sesion.rol() !== 'cliente') {
      throw new Error('Inicia sesión con una cuenta de cliente para administrar el carrito.');
    }
    return String(sesion.id);
  }

  private encabezadosAutorizados(): HttpHeaders {
    const autorizacion = this.sesion.autorizacion();
    if (!autorizacion) throw new Error('La sesión no es válida. Inicia sesión nuevamente.');
    return new HttpHeaders({ Authorization: autorizacion });
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
