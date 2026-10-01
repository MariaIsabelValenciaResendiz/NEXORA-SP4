export interface Producto {
  id: number;
  titulo: string;
  precio: number;
  descripcion: string;
  imagenUrl: string;
  categoria: string;
}

export interface NuevoProducto {
  titulo: string;
  precio: number;
  descripcion: string;
  imagenUrl: string;
  categoria: string;
}