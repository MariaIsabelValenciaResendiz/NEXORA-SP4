import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, tap, throwError } from 'rxjs';
import { Usuario, LoginRequest } from '../models/usuario.model';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private apiUrl = 'http://localhost:5043/api/usuarios';
  private usuarioActual: Usuario | null = null;

  constructor(private http: HttpClient) {}

  login(nombre: string, contrasena: string): Observable<Usuario> {
    const request: LoginRequest = { nombre, contrasena };

    return this.http.post<Usuario>(`${this.apiUrl}/login`, request).pipe(
      tap((usuario) => {
        this.usuarioActual = usuario;
        sessionStorage.setItem('usuario', JSON.stringify(usuario));
      }),
      catchError((error) => {
        return throwError(() => error);
      })
    );
  }

  obtenerUsuarioActual(): Usuario | null {
    if (this.usuarioActual) return this.usuarioActual;

    const guardado = sessionStorage.getItem('usuario');
    if (guardado) {
      this.usuarioActual = JSON.parse(guardado);
      return this.usuarioActual;
    }
    return null;
  }

  cerrarSesion(): void {
    this.usuarioActual = null;
    sessionStorage.removeItem('usuario');
  }
}