import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../environments/environment';
import { CoberturaService } from './cobertura';

describe('CoberturaService', () => {
  let service: CoberturaService;
  let httpMock: HttpTestingController;
  const base = environment.apiUrl;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(CoberturaService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('se crea', () => {
    expect(service).toBeTruthy();
  });

  it('obtenerCoberturas devuelve el array desde datos del envelope', async () => {
    const p = firstValueFrom(service.obtenerCoberturas());
    const req = httpMock.expectOne(`${base}/coberturas`);
    expect(req.request.method).toBe('GET');
    req.flush({
      codigo: 200,
      estado: 'ok',
      datos: [{ id: 1, nombre: 'Jerarquicos' }],
    });
    await expect(p).resolves.toEqual([{ id: 1, nombre: 'Jerarquicos' }]);
  });
});