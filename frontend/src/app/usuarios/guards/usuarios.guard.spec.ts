import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { routes } from '../../app.routes';

describe('US11 protección de rutas y menú', () => {
  beforeEach(() => {
    sessionStorage.clear();
    TestBed.configureTestingModule({
      providers: [provideRouter(routes), provideHttpClient(), provideHttpClientTesting()],
    });
  });

  afterEach(() => {
    TestBed.inject(HttpTestingController).verify();
    sessionStorage.clear();
  });

  it('bloquea un enlace profundo para Cliente sin pedir datos a la API', async () => {
    sessionStorage.setItem('usuario', JSON.stringify({ id: 2, nombre: 'Juan Pérez', contrasena: 'clave456', rol: 'cliente' }));
    const harness = await RouterTestingHarness.create('/usuarios');
    expect(TestBed.inject(Router).url).toBe('/acceso-restringido');
    expect(harness.routeNativeElement?.textContent).toContain('Acceso restringido');
    TestBed.inject(HttpTestingController).expectNone('http://localhost:5043/users');
  });

  it('bloquea una sesión dañada sin fallar', async () => {
    sessionStorage.setItem('usuario', '{invalido');
    await RouterTestingHarness.create('/usuarios');
    expect(TestBed.inject(Router).url).toBe('/acceso-restringido');
  });

  it('oculta Usuarios para Cliente en el menú principal', async () => {
    sessionStorage.setItem('usuario', JSON.stringify({ id: 2, nombre: 'Juan Pérez', contrasena: 'clave456', rol: 'cliente' }));
    const harness = await RouterTestingHarness.create('/producto-detalle');
    responderCatalogoVacio();
    expect(harness.routeNativeElement?.querySelector('a[href="/usuarios"]')).toBeNull();
  });

  it('muestra Usuarios para Admin en el menú principal', async () => {
    sessionStorage.setItem('usuario', JSON.stringify({ id: 1, nombre: 'María Isabel', contrasena: 'clave123', rol: 'admin' }));
    const harness = await RouterTestingHarness.create('/producto-detalle');
    responderCatalogoVacio();
    expect(harness.routeNativeElement?.querySelector('a[href="/usuarios"]')).not.toBeNull();
  });
});

function responderCatalogoVacio(): void {
  const peticion = TestBed.inject(HttpTestingController).expectOne('http://localhost:5043/api/productos');
  expect(peticion.request.headers.get('Authorization')).toMatch(/^Basic /);
  peticion.flush([]);
}
