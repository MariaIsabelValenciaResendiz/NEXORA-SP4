import { CurrencyPipe } from '@angular/common';
import { Component, OnInit, inject, output } from '@angular/core';
import { Producto } from '../../../models/producto.model';
import { ProductoService } from '../../../services/producto.service';

@Component({
  selector: 'app-catalogo',
  imports: [CurrencyPipe],
  templateUrl: './catalogo.html',
})
export class CatalogoComponent implements OnInit {
  protected readonly productoService = inject(ProductoService);
  readonly productoSeleccionado = output<Producto>();

  ngOnInit(): void {
    this.productoService.cargar();
  }

  protected verProducto(producto: Producto): void {
    this.productoSeleccionado.emit(producto);
  }

  protected usarImagenAlternativa(event: Event): void {
    const imagen = event.target as HTMLImageElement;
    imagen.src = '/productos/producto-placeholder.svg';
  }
}
