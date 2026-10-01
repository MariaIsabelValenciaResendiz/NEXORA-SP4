import { CurrencyPipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CarritoService } from '../../services/carrito.service';
import { RolUsuario } from '../../models/articulo-carrito.model';

type Pantalla = 'tienda' | 'carrito' | 'cuenta';

@Component({
  selector: 'app-producto-detalle',
  imports: [CurrencyPipe, FormsModule],
  templateUrl: './producto-detalle.html',
})
export class ProductoDetalleComponent {
  protected readonly carritoService = inject(CarritoService);
  protected readonly pantalla = signal<Pantalla>('tienda');
  protected readonly cantidad = signal(1);
  protected readonly mensaje = signal('');
  protected readonly error = signal('');
  protected readonly cargando = signal(false);

  protected cambiarPantalla(pantalla: Pantalla): void {
    this.pantalla.set(pantalla);
    this.mensaje.set('');
    this.error.set('');
  }

  protected actualizarRol(event: Event): void {
    const rol = (event.target as HTMLSelectElement).value as RolUsuario;
    this.carritoService.cambiarRol(rol);
  }

  protected cambiarCantidad(delta: number): void {
    this.cantidad.update((cantidad) => Math.max(1, cantidad + delta));
  }

  protected agregarAlCarrito(): void {
    this.mensaje.set('');
    this.error.set('');
    this.cargando.set(true);

    try {
      this.carritoService.agregar(this.carritoService.producto, this.cantidad()).subscribe({
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
}
