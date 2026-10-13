import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, provideRouter, UrlTree } from '@angular/router';

import { rolGuard } from './rol-guard';
import { AuthService } from '../services/auth';
import { Usuario } from '../models/usuario';

describe('rolGuard', () => {
  let auth: { getUsuario: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    auth = { getUsuario: vi.fn() };
    TestBed.configureTestingModule({
      providers: [provideRouter([]), { provide: AuthService, useValue: auth }],
    });
  });

  function ejecutar(roles: string[] | undefined, usuario: Usuario | null) {
    auth.getUsuario.mockReturnValue(usuario);
    const route = { data: roles ? { roles } : {} } as unknown as ActivatedRouteSnapshot;
    return TestBed.runInInjectionContext(() => rolGuard(route, {} as never));
  }

  it('permite el acceso si la ruta no restringe roles', () => {
    expect(ejecutar(undefined, { id: 1, rol: 'paciente' })).toBe(true);
  });

  it('permite cuando `data.roles` viene en mayúsculas (bug histórico)', () => {
    expect(ejecutar(['ADMIN'], { id: 1, rol: 'admin' })).toBe(true);
  });

  it('permite cuando el rol del usuario viene en mayúsculas', () => {
    expect(ejecutar(['admin'], { id: 1, rol: 'ADMIN' })).toBe(true);
  });

  it('redirige a /login si no hay sesión', () => {
    const resultado = ejecutar(['admin'], null);
    expect((resultado as UrlTree).toString()).toBe('/login');
  });

  it('redirige a /acceso-denegado si el rol no corresponde', () => {
    const resultado = ejecutar(['admin'], { id: 1, rol: 'paciente' });
    expect((resultado as UrlTree).toString()).toBe('/acceso-denegado');
  });
});
