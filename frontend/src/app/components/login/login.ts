import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './login.html',
  styleUrl: './login.scss'
})
export class Login {
  nombre = '';
  contrasena = '';

  errorNombre = '';
  errorContrasena = '';
  mensajeGeneral = '';

  cargando = false;

  constructor(private authService: AuthService, private router: Router) {}

  iniciarSesion(): void {
    this.errorNombre = '';
    this.errorContrasena = '';
    this.mensajeGeneral = '';

    // Escenario 3: sin conexión
    if (!navigator.onLine) {
      this.mensajeGeneral = 'Sin conexión. Revisa tu red.';
      return;
    }

    // Validación de campos vacíos
    let valido = true;
    if (!this.nombre.trim()) {
      this.errorNombre = 'Revisa este campo';
      valido = false;
    }
    if (!this.contrasena.trim()) {
      this.errorContrasena = 'Revisa este campo';
      valido = false;
    }
    if (!valido) return;

    this.cargando = true;

    this.authService.login(this.nombre, this.contrasena).subscribe({
      next: (usuario) => {
        this.cargando = false;
        const rol = usuario.rol.trim().toLowerCase();

        if (['admin', 'administrador', 'cliente', 'auditor'].includes(rol)) {
          this.router.navigate(['/producto-detalle']);
        } else {
          this.mensajeGeneral = `Inicio de sesión correcto. Rol sin acceso al catálogo: ${usuario.rol}`;
        }
      },
      error: (err) => {
        this.cargando = false;
        if (err.status === 401) {
          this.mensajeGeneral = 'Usuario o contraseña inválidos';
        } else if (err.status === 0) {
          this.mensajeGeneral = 'Sin conexión. Revisa tu red.';
        } else {
          this.mensajeGeneral = 'Ocurrió un error. Intenta de nuevo.';
        }
      }
    });
  }
}
