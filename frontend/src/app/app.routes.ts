import { Routes } from '@angular/router';
import { ProductoDetalleComponent } from './carrito/components/producto-detalle/producto-detalle';
import { catalogoGuard } from './catalogo/guards/catalogo.guard';
import { Login } from './components/login/login';
import { ProductoCrear } from './components/producto-crear/producto-crear';
import { usuariosGuard, usuariosMatchGuard } from './usuarios/guards/usuarios.guard';

export const routes: Routes = [
  { path: '', pathMatch: 'full', component: Login },
  { path: 'login', component: Login },
  {
    path: 'producto-detalle',
    component: ProductoDetalleComponent,
    canActivate: [catalogoGuard],
  },
  {
    path: 'productos/nuevo',
    component: ProductoCrear,
  },
  {
    path: 'usuarios',
    canMatch: [usuariosMatchGuard],
    canActivate: [usuariosGuard],
    loadComponent: () =>
      import('./usuarios/components/usuarios-lista/usuarios-lista')
        .then((modulo) => modulo.UsuariosListaComponent),
  },
  {
    path: 'acceso-restringido',
    loadComponent: () =>
      import('./usuarios/components/acceso-restringido/acceso-restringido')
        .then((modulo) => modulo.AccesoRestringidoComponent),
  },
];
