import { CurrencyPipe, UpperCasePipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { Observable } from 'rxjs';
import { CatalogoComponent } from '../../../catalogo/components/catalogo/catalogo';
import { Producto } from '../../../models/producto.model';
import { CarritoService } from '../../services/carrito.service';
import { RouterLink } from '@angular/router';
import { SesionUsuariosService } from '../../../usuarios/services/sesion-usuarios.service';

type Pantalla = 'catalogo' | 'detalle' | 'carrito' | 'cuenta';

@Component({
  selector: 'app-producto-detalle',
  imports: [CatalogoComponent, CurrencyPipe, RouterLink, UpperCasePipe],
  templateUrl: './producto-detalle.html',
})
export class ProductoDetalleComponent {
  protected readonly carritoService = inject(CarritoService);
  protected readonly sesionUsuarios = inject(SesionUsuariosService);
  protected readonly pantalla = signal<Pantalla>('catalogo');
  protected readonly cantidad = signal(1);
  protected readonly mensaje = signal('');
  protected readonly error = signal('');
  protected readonly cargando = signal(false);
  protected readonly cargandoCarrito = signal(false);
  protected readonly errorCargaCarrito = signal('');
  protected readonly errorCarrito = signal('');
  protected readonly productoEnOperacion = signal<number | null>(null);

  protected cambiarPantalla(pantalla: Pantalla): void {
    this.pantalla.set(pantalla);
    this.mensaje.set('');
    this.error.set('');
    if (pantalla === 'carrito' && this.carritoService.esCliente()) {
      this.cargarCarrito();
    }
  }

  protected reintentarCargarCarrito(): void {
    this.cargarCarrito();
  }

  protected cambiarCantidadArticulo(productoId: number, cantidadActual: number, delta: number): void {
    const cantidadNueva = cantidadActual + delta;
    if (cantidadNueva <= 0) {
      this.eliminarArticulo(productoId);
      return;
    }

    this.ejecutarCambio(
      productoId,
      () => this.carritoService.actualizarCantidad(productoId, cantidadNueva),
      'No se pudo actualizar la cantidad. Intenta nuevamente.',
    );
  }

  protected eliminarArticulo(productoId: number): void {
    this.ejecutarCambio(
      productoId,
      () => this.carritoService.eliminarArticulo(productoId),
      'No se pudo eliminar el producto. Intenta nuevamente.',
    );
  }

  protected verDetalle(producto: Producto): void {
    this.carritoService.seleccionarProducto(producto);
    this.cambiarPantalla('detalle');
  }

  protected cambiarCantidad(delta: number): void {
    this.cantidad.update((cantidad) => Math.max(1, cantidad + delta));
  }

  protected agregarAlCarrito(): void {
    this.mensaje.set('');
    this.error.set('');
    this.cargando.set(true);

    try {
      this.carritoService.agregar(this.carritoService.producto(), this.cantidad()).subscribe({
        next: (articulo) => {
          this.mensaje.set(`OK  Producto añadido. Cantidad: ${articulo.cantidad}`);
          this.cargando.set(false);
        },
        error: () => {
          this.error.set('No se pudo agregar el producto. Revisa que la API de NEXORA esté disponible.');
          this.cargando.set(false);
        },
      });
    } catch (exception) {
      this.error.set(exception instanceof Error ? exception.message : 'Cantidad no válida.');
      this.cargando.set(false);
    }
  }

  private cargarCarrito(): void {
    this.cargandoCarrito.set(true);
    this.errorCargaCarrito.set('');
    this.errorCarrito.set('');

    try {
      this.carritoService.cargarCarrito().subscribe({
        next: () => this.cargandoCarrito.set(false),
        error: () => {
          this.errorCargaCarrito.set('No se pudo cargar el carrito. Revisa la conexión e intenta nuevamente.');
          this.cargandoCarrito.set(false);
        },
      });
    } catch {
      this.errorCargaCarrito.set('La sesión no es válida. Inicia sesión nuevamente.');
      this.cargandoCarrito.set(false);
    }
  }

  private ejecutarCambio(
    productoId: number,
    ejecutar: () => Observable<void>,
    mensajeError: string,
  ): void {
    this.errorCarrito.set('');
    this.productoEnOperacion.set(productoId);

    try {
      ejecutar().subscribe({
        next: () => this.productoEnOperacion.set(null),
        error: () => {
          this.errorCarrito.set(mensajeError);
          this.productoEnOperacion.set(null);
        },
      });
    } catch {
      this.errorCarrito.set(mensajeError);
      this.productoEnOperacion.set(null);
    }
  }
}
