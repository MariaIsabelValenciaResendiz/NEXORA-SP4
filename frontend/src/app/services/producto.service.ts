import { HttpClient } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { finalize, Observable } from 'rxjs';
import { NuevoProducto, Producto } from '../models/producto.model';

@Injectable({
  providedIn: 'root',
})
export class ProductoService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = 'http://localhost:5043/api/productos';
  private readonly productosEstado = signal<Producto[]>([]);
  private readonly cargandoEstado = signal(false);
  private readonly errorEstado = signal('');
  private readonly categoriaEstado = signal('Todos');

  readonly categorias = ['Todos', 'Ropa', 'Accesorios'] as const;
  readonly productos = this.productosEstado.asReadonly();
  readonly cargando = this.cargandoEstado.asReadonly();
  readonly error = this.errorEstado.asReadonly();
  readonly categoriaSeleccionada = this.categoriaEstado.asReadonly();
  readonly productosFiltrados = computed(() => {
    const categoria = this.categoriaEstado();
    if (categoria === 'Todos') return this.productosEstado();

    return this.productosEstado().filter(
      (producto) => producto.categoria.toLocaleLowerCase() === categoria.toLocaleLowerCase(),
    );
  });

  cargar(forzar = false): void {
    if (this.cargandoEstado() || (!forzar && this.productosEstado().length > 0)) return;

    this.cargandoEstado.set(true);
    this.errorEstado.set('');

    this.http
      .get<Producto[]>(this.apiUrl)
      .pipe(finalize(() => this.cargandoEstado.set(false)))
      .subscribe({
        next: (productos) => this.productosEstado.set(productos),
        error: () => {
          this.productosEstado.set([]);
          this.errorEstado.set('No pudimos cargar el catálogo. Verifica tu conexión e intenta nuevamente.');
        },
      });
  }

  reintentar(): void {
    this.cargar(true);
  }

  seleccionarCategoria(categoria: string): void {
    this.categoriaEstado.set(categoria);
  }

  registrar(producto: NuevoProducto): Observable<Producto> {
    return this.http.post<Producto>(this.apiUrl, producto);
  }
}
