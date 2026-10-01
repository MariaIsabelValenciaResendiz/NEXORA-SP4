export interface Usuario {
  id: number;
  nombre: string;
  contrasena: string;
  rol: string;
}

export interface LoginRequest {
  nombre: string;
  contrasena: string;
}