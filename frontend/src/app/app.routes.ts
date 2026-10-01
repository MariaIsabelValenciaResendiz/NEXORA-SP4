import { Routes } from '@angular/router';
import { ProductoCrear } from './components/producto-crear/producto-crear';
import { ProductoDetalleComponent } from './carrito/components/producto-detalle/producto-detalle';

export const routes: Routes = [
  {
    path: '',
    component: ProductoDetalleComponent
  },
  {
    path: 'productos/nuevo',
    component: ProductoCrear
  }
];