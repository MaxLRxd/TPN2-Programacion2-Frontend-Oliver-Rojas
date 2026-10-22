import { TestBed } from '@angular/core/testing';
import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { Router } from '@angular/router';

import { tokenInterceptor } from './token-interceptor';
import { AuthService } from '../services/auth';

describe('tokenInterceptor', () => {
  let http: HttpClient;
  let httpMock: HttpTestingController;
  let auth: { getToken: ReturnType<typeof vi.fn>; logout: ReturnType<typeof vi.fn> };
  let router: { url: string; navigate: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    auth = { getToken: vi.fn(), logout: vi.fn() };
    router = { url: '/', navigate: vi.fn() };
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([tokenInterceptor])),
        provideHttpClientTesting(),
        { provide: AuthService, useValue: auth },
        { provide: Router, useValue: router },
      ],
    });
    http = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('agrega el header Authorization cuando hay token', () => {
    auth.getToken.mockReturnValue('jwt-123');
    http.get('/api/x').subscribe();
    const req = httpMock.expectOne('/api/x');
    expect(req.request.headers.get('Authorization')).toBe('Bearer jwt-123');
    req.flush({});
  });

  it('no agrega el header si no hay token', () => {
    auth.getToken.mockReturnValue(null);
    http.get('/api/x').subscribe();
    const req = httpMock.expectOne('/api/x');
    expect(req.request.headers.has('Authorization')).toBe(false);
    req.flush({});
  });

  it('en 401 hace logout y redirige a /login', () => {
    http.get('/api/privado').subscribe({ error: () => {} });
    httpMock
      .expectOne('/api/privado')
      .flush({ estado: 'no autorizado' }, { status: 401, statusText: 'Unauthorized' });
    expect(auth.logout).toHaveBeenCalled();
    expect(router.navigate).toHaveBeenCalledWith(['/login']);
  });

  it('en 401 del login no hace logout (evita loops)', () => {
    http.post('/api/auth/login', {}).subscribe({ error: () => {} });
    httpMock
      .expectOne('/api/auth/login')
      .flush({ estado: 'Credenciales invalidas' }, { status: 401, statusText: 'Unauthorized' });
    expect(auth.logout).not.toHaveBeenCalled();
    expect(router.navigate).not.toHaveBeenCalled();
  });

  it('en 403 no redirige y re-emite el error para que la pantalla lo muestre', () => {
    let capturado: unknown;
    http.get('/api/privado').subscribe({ error: (error) => (capturado = error) });
    httpMock
      .expectOne('/api/privado')
      .flush({ estado: 'prohibido' }, { status: 403, statusText: 'Forbidden' });
    expect(router.navigate).not.toHaveBeenCalled();
    expect(capturado).toBeTruthy();
  });

  it('si ya está en /login no vuelve a redirigir', () => {
    router.url = '/login';
    http.get('/api/privado').subscribe({ error: () => {} });
    httpMock
      .expectOne('/api/privado')
      .flush({}, { status: 401, statusText: 'Unauthorized' });
    expect(router.navigate).not.toHaveBeenCalled();
  });
});
