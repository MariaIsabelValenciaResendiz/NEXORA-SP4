import { Injectable } from '@angular/core';
import { SesionUsuarios } from '../models/usuario.model';

@Injectable({ providedIn: 'root' })
export class SesionUsuariosService {
  obtener(): SesionUsuarios | null {
    try {
      const usuario: unknown = JSON.parse(sessionStorage.getItem('usuario') ?? 'null');
      if (!usuario || typeof usuario !== 'object') return null;
      const sesion = usuario as Partial<SesionUsuarios>;
      if (typeof sesion.id !== 'number' || sesion.id <= 0 ||
          typeof sesion.nombre !== 'string' || !sesion.nombre.trim() ||
          typeof sesion.contrasena !== 'string' || !sesion.contrasena ||
          typeof sesion.rol !== 'string') return null;
      return sesion as SesionUsuarios;
    } catch {
      return null;
    }
  }

  rol(): string {
    return this.obtener()?.rol.trim().toLowerCase() ?? '';
  }

  puedeConsultar(): boolean {
    return ['admin', 'administrador', 'auditor'].includes(this.rol());
  }

  autorizacion(): string | null {
    const sesion = this.obtener();
    if (!sesion) return null;
    const bytes = new TextEncoder().encode(`${sesion.nombre}:${sesion.contrasena}`);
    const base64 = btoa(Array.from(bytes, (byte) => String.fromCharCode(byte)).join(''));
    return `Basic ${base64}`;
  }
}
