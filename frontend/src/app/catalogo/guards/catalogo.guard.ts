import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { SesionUsuariosService } from '../../usuarios/services/sesion-usuarios.service';

export const catalogoGuard: CanActivateFn = () => {
  const sesion = inject(SesionUsuariosService);
  return sesion.puedeConsultarCatalogo()
    ? true
    : inject(Router).createUrlTree(['/login']);
};
