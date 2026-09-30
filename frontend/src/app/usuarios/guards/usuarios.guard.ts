import { inject } from '@angular/core';
import { CanActivateFn, CanMatchFn, Router } from '@angular/router';
import { SesionUsuariosService } from '../services/sesion-usuarios.service';

const comprobarAcceso = () => inject(SesionUsuariosService).puedeConsultar()
  ? true
  : inject(Router).createUrlTree(['/acceso-restringido']);

export const usuariosGuard: CanActivateFn = comprobarAcceso;
export const usuariosMatchGuard: CanMatchFn = comprobarAcceso;
