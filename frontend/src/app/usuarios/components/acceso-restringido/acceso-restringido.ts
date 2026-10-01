import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-acceso-restringido',
  imports: [RouterLink],
  template: `
    <div class="app-shell">
      <main class="screen-content">
        <h1>Acceso restringido</h1>
        <p role="alert">Tu perfil no tiene permisos para abrir esta sección.</p>
        <a routerLink="/producto-detalle">Volver a la tienda</a>
      </main>
    </div>
  `,
})
export class AccesoRestringidoComponent {}
