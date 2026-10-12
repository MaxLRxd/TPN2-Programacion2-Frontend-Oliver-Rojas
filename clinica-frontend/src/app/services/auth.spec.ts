import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../environments/environment';
import { AuthService } from './auth';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;
  const base = environment.apiUrl;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  it('se crea', () => {
    expect(service).toBeTruthy();
  });

  it('login guarda token y usuario en localStorage', async () => {
    const p = firstValueFrom(service.login({ dni: '36000960', password: 'clave123' }));
    const req = httpMock.expectOne(`${base}/auth/login`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ dni: '36000960', password: 'clave123' });
    req.flush({
      codigo: 200,
      estado: 'ok',
      datos: {
        token: 'jwt-123',
        usuario: {
          id: 2,
          nombre: 'Franco',
          apellido: 'Friggeri',
          email: 'franco@mail.com',
          rol: 'paciente',
          id_sede: null,
          id_cobertura: 1,
        },
      },
    });
    await p;
    expect(localStorage.getItem('token')).toBe('jwt-123');
    expect(service.getToken()).toBe('jwt-123');
    expect(service.isLoggedIn()).toBe(true);
    expect(service.getUsuario()?.rol).toBe('paciente');
  });

  it('registro traduce a snake_case y crea el usuario', async () => {
    const p = firstValueFrom(
      service.registro({
        nombre: 'Franco',
        apellido: 'Friggeri',
        dni: '36000960',
        email: 'franco@mail.com',
        password: 'clave123',
        fechaNacimiento: '1998-03-14',
        coberturaId: 1,
      }),
    );
    const req = httpMock.expectOne(`${base}/auth/registro`);
    expect(req.request.method).toBe('POST');
    // el componente envía camelCase; el service lo traduce a snake_case
    expect(req.request.body).toEqual({
      nombre: 'Franco',
      apellido: 'Friggeri',
      dni: '36000960',
      email: 'franco@mail.com',
      password: 'clave123',
      fecha_nacimiento: '1998-03-14',
      id_cobertura: 1,
    });
    req.flush({
      codigo: 201,
      estado: 'ok',
      datos: { id: 5, nombre: 'Franco', apellido: 'Friggeri', rol: 'paciente' },
    });
    await expect(p).resolves.toMatchObject({ id: 5, rol: 'paciente' });
  });

  it('cargarPerfil actualiza el usuario almacenado', async () => {
    const p = firstValueFrom(service.cargarPerfil());
    const req = httpMock.expectOne(`${base}/auth/perfil`);
    expect(req.request.method).toBe('GET');
    req.flush({
      codigo: 200,
      estado: 'ok',
      datos: { id: 2, nombre: 'Franco', rol: 'paciente', dni: '36000960' },
    });
    await p;
    expect(service.getUsuario()?.dni).toBe('36000960');
    expect(JSON.parse(localStorage.getItem('usuario') || 'null')?.rol).toBe('paciente');
  });

  it('rehidrata el perfil si hay token pero no hay usuario', async () => {
    localStorage.setItem('token', 'jwt-viejo');
    const p = firstValueFrom(service.rehidratarSesion());
    const req = httpMock.expectOne(`${base}/auth/perfil`);
    req.flush({
      codigo: 200,
      estado: 'ok',
      datos: { id: 2, nombre: 'Franco', rol: 'paciente' },
    });
    await p;
    expect(service.getUsuario()?.nombre).toBe('Franco');
  });

  it('no hace nada al rehidratar si no hay token', async () => {
    await firstValueFrom(service.rehidratarSesion());
    httpMock.expectNone(`${base}/auth/perfil`);
  });

  it('no rehidrata si ya hay usuario guardado', async () => {
    service.login({ dni: '1', password: 'x' }).subscribe();
    httpMock
      .expectOne(`${base}/auth/login`)
      .flush({
        codigo: 200,
        estado: 'ok',
        datos: { token: 'jwt', usuario: { id: 2, nombre: 'Franco', rol: 'paciente' } },
      });
    await firstValueFrom(service.rehidratarSesion());
    httpMock.expectNone(`${base}/auth/perfil`);
  });

  it('limpia la sesión al rehidratar si el token venció (401)', async () => {
    localStorage.setItem('token', 'jwt-vencido');
    const p = firstValueFrom(service.rehidratarSesion());
    const req = httpMock.expectOne(`${base}/auth/perfil`);
    req.flush(
      { codigo: 401, estado: 'Token vencido', datos: null },
      { status: 401, statusText: 'Unauthorized' },
    );
    await p;
    expect(service.getToken()).toBeNull();
    expect(service.isLoggedIn()).toBe(false);
  });

  it('login con credenciales inválidas devuelve el mensaje del backend', async () => {
    const p = firstValueFrom(service.login({ dni: '1', password: 'mala' }));
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

  it('logout limpia la sesión', () => {
    localStorage.setItem('token', 'jwt-123');
    service.logout();
    expect(service.getToken()).toBeNull();
    expect(service.getUsuario()).toBeNull();
    expect(service.isLoggedIn()).toBe(false);
  });
});