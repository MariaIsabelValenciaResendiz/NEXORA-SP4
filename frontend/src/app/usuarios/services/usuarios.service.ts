import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable, OnDestroy, signal } from '@angular/core';
import { Subscription, finalize, map, timeout } from 'rxjs';
import { UsuarioDirectorio } from '../models/usuario.model';
import { SesionUsuariosService } from './sesion-usuarios.service';

const API_URL = 'http://localhost:5043/users';

@Injectable()
export class UsuariosService implements OnDestroy {
  private readonly lista = signal<UsuarioDirectorio[]>([]);
  private readonly enCarga = signal(false);
  private readonly mensajeError = signal('');
  private peticion?: Subscription;

  readonly usuarios = this.lista.asReadonly();
  readonly cargando = this.enCarga.asReadonly();
  readonly error = this.mensajeError.asReadonly();

  constructor(private readonly http: HttpClient, private readonly sesion: SesionUsuariosService) {}

  cargar(): void {
    this.peticion?.unsubscribe();
    this.lista.set([]);
    this.mensajeError.set('');
    const authorization = this.sesion.autorizacion();
    if (!this.sesion.puedeConsultar() || !authorization) {
      this.mensajeError.set('Tu sesión no tiene permiso para consultar usuarios.');
      return;
    }

    this.enCarga.set(true);
    this.peticion = this.http.get<unknown>(API_URL, { headers: { Authorization: authorization } }).pipe(
      timeout(10000),
      map((respuesta) => {
        if (!Array.isArray(respuesta)) throw new Error('Respuesta de usuarios inválida.');
        return respuesta.map((usuario) => this.mapear(usuario));
      }),
      finalize(() => this.enCarga.set(false)),
    ).subscribe({
      next: (usuarios) => this.lista.set(usuarios),
      error: (error: unknown) => this.mensajeError.set(this.describirError(error)),
    });
  }

  ngOnDestroy(): void {
    this.peticion?.unsubscribe();
    this.lista.set([]);
  }

  private describirError(error: unknown): string {
    if (error instanceof HttpErrorResponse && error.status === 401)
      return 'La sesión no es válida. Inicia sesión nuevamente.';
    if (error instanceof HttpErrorResponse && error.status === 403)
      return 'Tu perfil no tiene permisos para consultar usuarios.';
    return 'La conexión se interrumpió o la API no pudo responder. Intenta nuevamente.';
  }

  private mapear(valor: unknown): UsuarioDirectorio {
    const usuario = this.objeto(valor);
    const direccion = this.objeto(usuario['direccion']);
    const coordenadas = this.objeto(direccion['geolocalizacion']);
    const nombre = this.texto(usuario['nombre']) || 'Sin nombre';
    const telefono = this.texto(usuario['telefono']);
    return {
      id: typeof usuario['id'] === 'number' ? usuario['id'] : 0,
      nombre,
      correo: this.texto(usuario['correo']),
      telefono,
      nombreUsuario: this.texto(usuario['nombreUsuario']),
      iniciales: nombre.split(/\s+/).slice(0, 2).map((parte) => parte[0]).join('').toUpperCase(),
      enlaceTelefono: `tel:${telefono.replace(/[^\d+]/g, '')}`,
      direccion: {
        ciudad: this.texto(direccion['ciudad']),
        calle: this.texto(direccion['calle']),
        numero: typeof direccion['numero'] === 'number' ? direccion['numero'] : 0,
        codigoPostal: this.texto(direccion['codigoPostal']),
        geolocalizacion: {
          latitud: this.texto(coordenadas['latitud']),
          longitud: this.texto(coordenadas['longitud']),
        },
      },
    };
  }

  private objeto(valor: unknown): Record<string, unknown> {
    return valor && typeof valor === 'object' ? valor as Record<string, unknown> : {};
  }

  private texto(valor: unknown): string {
    return typeof valor === 'string' ? valor.trim() : '';
  }
}
