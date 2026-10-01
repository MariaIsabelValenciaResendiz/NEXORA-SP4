import { Component, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SesionUsuariosService } from '../../services/sesion-usuarios.service';
import { UsuariosService } from '../../services/usuarios.service';

@Component({
  selector: 'app-usuarios-lista',
  imports: [RouterLink],
  providers: [UsuariosService],
  templateUrl: './usuarios-lista.html',
  styleUrl: './usuarios-lista.scss',
})
export class UsuariosListaComponent implements OnInit {
  protected readonly vm = inject(UsuariosService);
  protected readonly sesion = inject(SesionUsuariosService);

  ngOnInit(): void {
    this.vm.cargar();
  }
}
