import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { UsuariosService } from './usuarios.service';

describe('US11 UsuariosService', () => {
  let servicio: UsuariosService;
  let http: HttpTestingController;

  beforeEach(() => {
    sessionStorage.clear();
    sessionStorage.setItem('usuario', JSON.stringify({
      id: 1, nombre: 'María Isabel', contrasena: 'clave123', rol: 'admin',
    }));
    TestBed.configureTestingModule({
      providers: [UsuariosService, provideHttpClient(), provideHttpClientTesting()],
    });
    servicio = TestBed.inject(UsuariosService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    http.verify();
    sessionStorage.clear();
  });

  it('consume la API propia, muestra carga y tolera datos anidados nulos', () => {
    servicio.cargar();
    expect(servicio.cargando()).toBe(true);
    const peticion = http.expectOne('http://localhost:5043/users');
    expect(peticion.request.method).toBe('GET');
    expect(peticion.request.headers.get('Authorization')).toMatch(/^Basic /);
    peticion.flush([{ id: 1, nombre: 'Ana López', correo: 'ana@nexora.mx', direccion: null }]);
    expect(servicio.cargando()).toBe(false);
    expect(servicio.usuarios()[0].iniciales).toBe('AL');
    expect(servicio.usuarios()[0].direccion.geolocalizacion.latitud).toBe('');
    expect(servicio.error()).toBe('');
  });

  it('permite al auditor consultar usuarios', () => {
    sessionStorage.setItem('usuario', JSON.stringify({ id: 4, nombre: 'Laura Méndez', contrasena: 'auditor123', rol: 'auditor' }));
    servicio.cargar();
    http.expectOne('http://localhost:5043/users').flush([]);
    expect(servicio.error()).toBe('');
  });

  it('permite reintentar después de un fallo sin conservar datos anteriores', () => {
    servicio.cargar();
    http.expectOne('http://localhost:5043/users').flush('Error', { status: 503, statusText: 'Unavailable' });
    expect(servicio.error()).toContain('conexión');
    expect(servicio.cargando()).toBe(false);
    servicio.cargar();
    expect(servicio.error()).toBe('');
    http.expectOne('http://localhost:5043/users').flush([]);
    expect(servicio.usuarios()).toEqual([]);
  });

  it('el cliente no inicia la petición aunque cambie el rol demo del carrito', () => {
    sessionStorage.setItem('usuario', JSON.stringify({ id: 2, nombre: 'Juan Pérez', contrasena: 'clave456', rol: 'cliente' }));
    sessionStorage.setItem('nexora-rol-demo', 'Auditor');
    servicio.cargar();
    http.expectNone('http://localhost:5043/users');
    expect(servicio.error()).toContain('permiso');
  });

  it('informa cuando la API rechaza el rol', () => {
    servicio.cargar();
    http.expectOne('http://localhost:5043/users').flush(null, { status: 403, statusText: 'Forbidden' });
    expect(servicio.error()).toContain('permisos');
    expect(servicio.usuarios()).toEqual([]);
  });

  it('rechaza una respuesta que no sea una lista', () => {
    servicio.cargar();
    http.expectOne('http://localhost:5043/users').flush({ mensaje: 'No es un arreglo' });
    expect(servicio.error()).not.toBe('');
    expect(servicio.cargando()).toBe(false);
  });
});
