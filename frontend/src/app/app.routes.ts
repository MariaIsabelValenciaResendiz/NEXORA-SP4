import { Routes } from '@angular/router';
import { ProductoCrear } from './components/producto-crear/producto-crear';

export const routes: Routes = [
  {
    path: 'productos/nuevo',
    component: ProductoCrear
  }
];