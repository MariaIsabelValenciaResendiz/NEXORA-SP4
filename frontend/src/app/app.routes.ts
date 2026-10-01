import { Routes } from '@angular/router';
import { Login } from './components/login/login';
import { ProductoDetalleComponent } from './carrito/components/producto-detalle/producto-detalle';

export const routes: Routes = [
  { path: '', component: Login },
  { path: 'login', component: Login },
  { path: 'producto-detalle', component: ProductoDetalleComponent }
];