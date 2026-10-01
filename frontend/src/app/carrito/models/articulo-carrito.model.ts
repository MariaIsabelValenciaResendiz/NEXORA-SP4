export interface ArticuloCarrito {
  productoId: number;
  titulo: string;
  precio: number;
  imagen: string;
  cantidad: number;
}

export interface ProductoDetalle {
  id: number;
  titulo: string;
  descripcion: string;
  precio: number;
  imagen: string;
  categoria: string;
}

export type RolUsuario = 'Cliente' | 'Auditor';
