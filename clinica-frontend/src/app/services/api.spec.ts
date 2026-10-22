import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../environments/environment';
import { ApiService } from './api';

describe('ApiService', () => {
  let service: ApiService;
  let httpMock: HttpTestingController;
  const base = environment.apiUrl;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(ApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('se crea', () => {
    expect(service).toBeTruthy();
  });

  it('desempaqueta datos del envelope en GET', async () => {
    const p = firstValueFrom(service.get<{ id: number; nombre: string }[]>('/coberturas'));
    const req = httpMock.expectOne(`${base}/coberturas`);
    expect(req.request.method).toBe('GET');
    req.flush({ codigo: 200, estado: 'ok', datos: [{ id: 1, nombre: 'Jerarquicos' }] });
    await expect(p).resolves.toEqual([{ id: 1, nombre: 'Jerarquicos' }]);
  });

  it('agrega query params y omite los vacios', async () => {
    const p = firstValueFrom(
      service.get<unknown[]>('/medicos', {
        especialidad: 1,
        sede: undefined,
        nombre: '',
      }),
    );
    const req = httpMock.expectOne(
      (r) => r.url === `${base}/medicos` && r.params.get('especialidad') === '1',
    );
    expect(req.request.params.has('sede')).toBe(false);
    expect(req.request.params.has('nombre')).toBe(false);
    req.flush({ codigo: 200, estado: 'ok', datos: [] });
    await expect(p).resolves.toEqual([]);
  });

  it('envía el body en POST', async () => {
    const p = firstValueFrom(
      service.post<{ id: number }>('/auth/login', { dni: '1', password: 'x' }),
    );
    const req = httpMock.expectOne(`${base}/auth/login`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ dni: '1', password: 'x' });
    req.flush({ codigo: 200, estado: 'ok', datos: { id: 1 } });
    await expect(p).resolves.toEqual({ id: 1 });
  });

  it('lanza ApiError con el mensaje del backend (campo estado) en un error HTTP', async () => {
    const p = firstValueFrom(service.post('/auth/login', { dni: '1', password: 'mala' }));
    const req = httpMock.expectOne(`${base}/auth/login`);
    req.flush(
      { codigo: 401, estado: 'Credenciales invalidas', datos: null },
      { status: 401, statusText: 'Unauthorized' },
    );
    await expect(p).rejects.toMatchObject({
      codigo: 401,
      mensaje: 'Credenciales invalidas',
    });
  });

  it('lanza ApiError si una respuesta contiene estado != ok', async () => {
    const p = firstValueFrom(service.get('/coberturas'));
    const req = httpMock.expectOne(`${base}/coberturas`);
    req.flush({ codigo: 500, estado: 'Error interno del servidor', datos: null });
    await expect(p).rejects.toMatchObject({
      codigo: 500,
      mensaje: 'Error interno del servidor',
    });
  });
});