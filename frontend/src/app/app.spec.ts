import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { App } from './app';

describe('App', () => {
  let httpTesting: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    })
      .compileComponents();

    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpTesting.verify());

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    httpTesting.expectOne('http://localhost:5043/api/productos').flush([]);

    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('should render products returned by the NEXORA API', () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();

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
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('#catalog-title')?.textContent).toContain('Catálogo');
    expect(compiled.querySelector('.product-card-title')?.textContent).toContain('Bolso Nómada');
  });

  it('should show an error and retry the catalog request', () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();

    httpTesting.expectOne('http://localhost:5043/api/productos').flush('Error', {
      status: 503,
      statusText: 'Service Unavailable',
    });
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.error-status')?.textContent).toContain('No pudimos cargar');

    (compiled.querySelector('.retry-button') as HTMLButtonElement).click();
    fixture.detectChanges();
    httpTesting.expectOne('http://localhost:5043/api/productos').flush([]);
  });
});
