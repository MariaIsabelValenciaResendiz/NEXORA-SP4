export interface CoordenadasUsuario {
  latitud: string;
  longitud: string;
}

export interface DireccionUsuario {
  ciudad: string;
  calle: string;
  numero: number;
  codigoPostal: string;
  geolocalizacion: CoordenadasUsuario;
}

export interface UsuarioLectura {
  id: number;
  nombre: string;
  correo: string;
  telefono: string;
  nombreUsuario: string;
  direccion: DireccionUsuario;
}

export interface UsuarioDirectorio extends UsuarioLectura {
  iniciales: string;
  enlaceTelefono: string;
}

// Contrato ya utilizado por Task-01-Login, sin modificar su AuthService.
export interface SesionUsuarios {
  id: number;
  nombre: string;
  contrasena: string;
  rol: string;
}
