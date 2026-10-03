import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { App } from './app';
import { routes } from './app.routes';

describe('App', () => {
  let httpTesting: HttpTestingController;

  beforeEach(async () => {
    sessionStorage.clear();

    await TestBed.configureTestingModule({
      imports: [App],
      providers: [provideRouter(routes), provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpTesting.verify());

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();

    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should redirect unauthenticated users to login', async () => {
    const harness = await RouterTestingHarness.create('/producto-detalle');

    expect(harness.routeNativeElement?.querySelector('.login-form')).toBeTruthy();
  });

  it('should render products and preserve the product detail flow', async () => {
    guardarSesionCliente();
    const harness = await RouterTestingHarness.create('/producto-detalle');
    const request = httpTesting.expectOne('http://localhost:5043/api/productos');
    expect(request.request.headers.get('Authorization')).toMatch(/^Basic /);
    request.flush([
      {
        id: 1,
        titulo: 'Bolso Nómada',
        precio: 58,
        descripcion: 'Diseño sobrio y resistente.',
        imagenUrl: '/productos/bolso-nomada.svg',
        categoria: 'Accesorios',
      },
    ]);
    harness.detectChanges();

    expect(harness.routeNativeElement?.querySelector('#catalog-title')?.textContent).toContain('Catálogo');
    expect(harness.routeNativeElement?.querySelector('.product-card-title')?.textContent).toContain('Bolso Nómada');

    (harness.routeNativeElement?.querySelector('.product-card') as HTMLButtonElement).click();
    harness.detectChanges();
    expect(harness.routeNativeElement?.querySelector('#detail-title')?.textContent).toContain('Detalle');
    expect(harness.routeNativeElement?.querySelector('.product-heading h2')?.textContent).toContain('Bolso Nómada');
  });

  it('should show an error and retry the catalog request', async () => {
    guardarSesionCliente();
    const harness = await RouterTestingHarness.create('/producto-detalle');

    httpTesting.expectOne('http://localhost:5043/api/productos').flush('Error', {
      status: 503,
      statusText: 'Service Unavailable',
    });
    harness.detectChanges();

    expect(harness.routeNativeElement?.querySelector('.error-status')?.textContent).toContain('No pudimos cargar');

    (harness.routeNativeElement?.querySelector('.retry-button') as HTMLButtonElement).click();
    harness.detectChanges();
    httpTesting.expectOne('http://localhost:5043/api/productos').flush([]);
  });

  it('should use the authenticated administrator role and hide purchase controls', async () => {
    guardarSesion('admin');
    const harness = await RouterTestingHarness.create('/producto-detalle');

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
    harness.detectChanges();

    (harness.routeNativeElement?.querySelector('.product-card') as HTMLButtonElement).click();
    harness.detectChanges();

    expect(harness.routeNativeElement?.querySelector('.role-badge')?.textContent).toContain('Administrador');
    expect(harness.routeNativeElement?.querySelector('.purchase-actions')).toBeNull();
    expect(harness.routeNativeElement?.querySelector('.bottom-nav')?.textContent).not.toContain('Carrito');
  });

  it('should update and remove cart items through the NEXORA API', async () => {
    guardarSesionCliente();
    const harness = await RouterTestingHarness.create('/producto-detalle');

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
    harness.detectChanges();

    (harness.routeNativeElement?.querySelector('.product-card') as HTMLButtonElement).click();
    harness.detectChanges();
    (harness.routeNativeElement?.querySelector('.primary-button') as HTMLButtonElement).click();
    const agregar = httpTesting.expectOne('http://localhost:5043/api/carrito/2/articulos');
    expect(agregar.request.method).toBe('POST');
    expect(agregar.request.headers.get('Authorization')).toMatch(/^Basic /);
    agregar.flush({ productoId: 1, titulo: 'Bolso Nómada', precio: 58, imagen: '/productos/bolso-nomada.svg', cantidad: 1 });
    harness.detectChanges();

    const botonCarrito = [...(harness.routeNativeElement?.querySelectorAll('.bottom-nav button') ?? [])]
      .find((boton) => boton.textContent?.includes('Carrito')) as HTMLButtonElement;
    botonCarrito.click();
    harness.detectChanges();
    const cargar = httpTesting.expectOne('http://localhost:5043/api/carrito/2');
    expect(cargar.request.method).toBe('GET');
    cargar.flush([{ productoId: 1, titulo: 'Bolso Nómada', precio: 58, imagen: '/productos/bolso-nomada.svg', cantidad: 1 }]);
    harness.detectChanges();

    (harness.routeNativeElement?.querySelector('.item-increase') as HTMLButtonElement).click();
    const actualizar = httpTesting.expectOne('http://localhost:5043/api/carrito/2/articulos/1');
    expect(actualizar.request.method).toBe('PUT');
    expect(actualizar.request.body).toEqual({ cantidad: 2 });
    harness.detectChanges();
    expect(harness.routeNativeElement?.querySelector('.item-quantity')?.textContent).toContain('116.00');
    actualizar.flush(null, { status: 204, statusText: 'No Content' });
    harness.detectChanges();
    expect(harness.routeNativeElement?.querySelector('.item-quantity')?.textContent).toContain('116.00');

    (harness.routeNativeElement?.querySelector('.item-remove') as HTMLButtonElement).click();
    const eliminar = httpTesting.expectOne('http://localhost:5043/api/carrito/2/articulos/1');
    expect(eliminar.request.method).toBe('DELETE');
    harness.detectChanges();
    expect(harness.routeNativeElement?.textContent).toContain('Tu carrito está vacío, explora el catálogo');
    eliminar.flush(null, { status: 204, statusText: 'No Content' });
    harness.detectChanges();

    expect(harness.routeNativeElement?.textContent).toContain('Tu carrito está vacío, explora el catálogo');
    expect((harness.routeNativeElement?.querySelector('.checkout-button') as HTMLButtonElement).disabled).toBe(true);
  });
});

function guardarSesionCliente(): void {
  guardarSesion('cliente');
}

function guardarSesion(rol: string): void {
  sessionStorage.setItem('usuario', JSON.stringify({
    id: 2,
    nombre: 'Juan Pérez',
    contrasena: 'clave456',
    rol,
  }));
}
