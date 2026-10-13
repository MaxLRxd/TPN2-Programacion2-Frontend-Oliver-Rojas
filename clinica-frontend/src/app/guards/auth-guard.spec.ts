import { TestBed } from '@angular/core/testing';
import { provideRouter, UrlTree } from '@angular/router';

import { authGuard } from './auth-guard';
import { AuthService } from '../services/auth';

describe('authGuard', () => {
  let auth: { isLoggedIn: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    auth = { isLoggedIn: vi.fn() };
    TestBed.configureTestingModule({
      providers: [provideRouter([]), { provide: AuthService, useValue: auth }],
    });
  });

  function ejecutar(logueado: boolean) {
    auth.isLoggedIn.mockReturnValue(logueado);
    return TestBed.runInInjectionContext(() => authGuard({} as never, {} as never));
  }

  it('permite el acceso con sesión', () => {
    expect(ejecutar(true)).toBe(true);
  });

  it('redirige a /login sin sesión', () => {
    const resultado = ejecutar(false);
    expect(resultado instanceof UrlTree).toBe(true);
    expect((resultado as UrlTree).toString()).toBe('/login');
  });
});
