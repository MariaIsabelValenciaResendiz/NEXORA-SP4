import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { ProductoService } from './producto.service';

describe('ProductoService', () => {
  let servicio: ProductoService;
  let httpTesting: HttpTestingController;

  beforeEach(() => {
    sessionStorage.setItem('usuario', JSON.stringify({
      id: 2,
      nombre: 'Juan Pérez',
      contrasena: 'clave456',
      rol: 'cliente',
    }));

    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });

    servicio = TestBed.inject(ProductoService);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTesting.verify();
    sessionStorage.clear();
  });

  it('should add a registered product to an already loaded catalog', () => {
    servicio.cargar();
    httpTesting.expectOne('http://localhost:5043/api/productos').flush([
      {
        id: 1,
        titulo: 'Bolso Nómada',
        precio: 58,
        descripcion: 'Diseño sobrio y resistente.',
        imagenUrl: '/productos/bolso-nomada.svg',
        categoria: 'Accesorios',
      },
    ]);

    servicio.registrar({
      titulo: 'Producto nuevo',
      precio: 25,
      descripcion: 'Producto registrado desde Task 06.',
      imagenUrl: 'https://example.com/producto.svg',
      categoria: 'Ropa',
    }).subscribe();

    httpTesting.expectOne('http://localhost:5043/api/productos').flush({
      id: 2,
      titulo: 'Producto nuevo',
      precio: 25,
      descripcion: 'Producto registrado desde Task 06.',
      imagenUrl: 'https://example.com/producto.svg',
      categoria: 'Ropa',
    });

    expect(servicio.productos().map((producto) => producto.titulo)).toEqual([
      'Bolso Nómada',
      'Producto nuevo',
    ]);

    servicio.cargar();
    httpTesting.expectNone('http://localhost:5043/api/productos');
  });
});
