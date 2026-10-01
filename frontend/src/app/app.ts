import { Component } from '@angular/core';
import { ProductoDetalleComponent } from './carrito/components/producto-detalle/producto-detalle';

@Component({
  imports: [ProductoDetalleComponent],
  selector: 'app-root',
  styleUrl: './app.scss',
  templateUrl: './app.html',
})
export class App {}
