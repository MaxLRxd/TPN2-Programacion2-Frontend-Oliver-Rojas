import { TestBed } from '@angular/core/testing';

import { SessionService } from './session.service';

describe('SessionService', () => {
  let service: SessionService;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({});
    service = TestBed.inject(SessionService);
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('se crea', () => {
    expect(service).toBeTruthy();
  });

  it('guarda la sesión (token + usuario)', () => {
    service.guardarSesion('jwt-123', { id: 2, nombre: 'Franco', rol: 'paciente' });
    expect(service.getToken()).toBe('jwt-123');
    expect(service.getUsuario()?.id).toBe(2);
    expect(service.estaAutenticado()).toBe(true);
  });

  it('actualiza el usuario sin tocar el token', () => {
    service.guardarSesion('jwt', { id: 1 });
    service.actualizarUsuario({ id: 2, dni: '36000960' });
    expect(service.getToken()).toBe('jwt');
    expect(service.getUsuario()?.dni).toBe('36000960');
  });

  it('limpia la sesión', () => {
    service.guardarSesion('jwt', { id: 1 });
    service.limpiarSesion();
    expect(service.getToken()).toBeNull();
    expect(service.getUsuario()).toBeNull();
    expect(service.estaAutenticado()).toBe(false);
  });
});