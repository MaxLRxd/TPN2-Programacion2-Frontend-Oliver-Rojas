import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../environments/environment';
import { Notificacion } from '../models/notificacion';
import { NotificacionService } from './notificacion';

describe('NotificacionService', () => {
  let service: NotificacionService;
  let httpMock: HttpTestingController;
  const base = environment.apiUrl;

  const notificaciones: Notificacion[] = [
    {
      id: 1,
      tipo: 'turno',
      mensaje: 'Notificación anterior',
      leida: 1,
      fecha: '2026-10-20T10:00:00.000Z',
    },
    {
      id: 2,
      tipo: 'turno',
      mensaje: 'Notificación reciente',
      leida: 0,
      fecha: '2026-10-22T10:00:00.000Z',
    },
  ];

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(NotificacionService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('se crea', () => {
    expect(service).toBeTruthy();
  });

  it('ordena de la más reciente a la más antigua y cuenta las no leídas', async () => {
    const p = firstValueFrom(service.listar());
    const req = httpMock.expectOne(`${base}/notificaciones`);
    expect(req.request.method).toBe('GET');
    req.flush({ codigo: 200, estado: 'ok', datos: notificaciones });

    await expect(p).resolves.toEqual([notificaciones[1], notificaciones[0]]);
    expect(service.notificaciones()[0].id).toBe(2);
    expect(service.noLeidas()).toBe(1);
    expect(service.cargando()).toBe(false);
  });

  it('guarda el mensaje de error si falla la carga', async () => {
    const p = firstValueFrom(service.listar());
    const req = httpMock.expectOne(`${base}/notificaciones`);
    req.flush(
      { codigo: 500, estado: 'Error interno del servidor', datos: null },
      { status: 500, statusText: 'Server Error' },
    );

    await expect(p).rejects.toMatchObject({ codigo: 500 });
    expect(service.error()).toBe('Error interno del servidor');
    expect(service.cargando()).toBe(false);
  });

  it('marca como leída de forma optimista y actualiza el contador', async () => {
    const carga = firstValueFrom(service.listar());
    httpMock
      .expectOne(`${base}/notificaciones`)
      .flush({ codigo: 200, estado: 'ok', datos: notificaciones });
    await carga;

    const p = firstValueFrom(service.marcarLeida(2));
    expect(service.noLeidas()).toBe(0);

    const req = httpMock.expectOne(`${base}/notificaciones/2/leer`);
    expect(req.request.method).toBe('PATCH');
    req.flush({ codigo: 200, estado: 'ok', datos: { id: 2, leida: 1 } });

    await expect(p).resolves.toEqual({ id: 2, leida: 1 });
    expect(service.noLeidas()).toBe(0);
  });

  it('revierte el cambio optimista si falla el backend', async () => {
    const carga = firstValueFrom(service.listar());
    httpMock
      .expectOne(`${base}/notificaciones`)
      .flush({ codigo: 200, estado: 'ok', datos: notificaciones });
    await carga;

    const p = firstValueFrom(service.marcarLeida(2));
    expect(service.noLeidas()).toBe(0);

    const req = httpMock.expectOne(`${base}/notificaciones/2/leer`);
    req.flush(
      { codigo: 403, estado: 'No tiene permisos', datos: null },
      { status: 403, statusText: 'Forbidden' },
    );

    await expect(p).rejects.toMatchObject({ codigo: 403 });
    expect(service.noLeidas()).toBe(1);
  });

  it('no hace una petición si la notificación ya estaba leída', async () => {
    const carga = firstValueFrom(service.listar());
    httpMock
      .expectOne(`${base}/notificaciones`)
      .flush({ codigo: 200, estado: 'ok', datos: notificaciones });
    await carga;

    await expect(firstValueFrom(service.marcarLeida(1))).resolves.toEqual({ id: 1, leida: 1 });
    httpMock.expectNone(`${base}/notificaciones/1/leer`);
  });

  it('limpia el estado al cerrar sesión', async () => {
    const carga = firstValueFrom(service.listar());
    httpMock
      .expectOne(`${base}/notificaciones`)
      .flush({ codigo: 200, estado: 'ok', datos: notificaciones });
    await carga;

    service.limpiar();

    expect(service.notificaciones()).toEqual([]);
    expect(service.noLeidas()).toBe(0);
    expect(service.error()).toBe('');
  });
});
