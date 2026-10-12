import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Usuario } from '../models/usuario';

const TOKEN_KEY = 'token';
const USUARIO_KEY = 'usuario';

/**
 * Única fuente de verdad de la sesión: token y usuario actual.
 *
 * Separado de `AuthService` (que hace login/registro) por composición:
 * así el interceptor, los guards y futuros servicios reutilizan la sesión
 * sin heredar nada ni acoplarse a la autenticación.
 */
@Injectable({ providedIn: 'root' })
export class SessionService {
  private usuarioSubject = new BehaviorSubject<Usuario | null>(this.loadUsuario());
  private loggedInSubject = new BehaviorSubject<boolean>(this.hasToken());

  readonly usuario$: Observable<Usuario | null> = this.usuarioSubject.asObservable();
  readonly loggedIn$: Observable<boolean> = this.loggedInSubject.asObservable();

  guardarSesion(token: string, usuario: Usuario): void {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USUARIO_KEY, JSON.stringify(usuario));
    this.usuarioSubject.next(usuario);
    this.loggedInSubject.next(true);
  }

  actualizarUsuario(usuario: Usuario): void {
    localStorage.setItem(USUARIO_KEY, JSON.stringify(usuario));
    this.usuarioSubject.next(usuario);
  }

  limpiarSesion(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USUARIO_KEY);
    this.usuarioSubject.next(null);
    this.loggedInSubject.next(false);
  }

  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  getUsuario(): Usuario | null {
    return this.usuarioSubject.value;
  }

  estaAutenticado(): boolean {
    return this.hasToken();
  }

  private hasToken(): boolean {
    return !!localStorage.getItem(TOKEN_KEY);
  }

  private loadUsuario(): Usuario | null {
    const raw = localStorage.getItem(USUARIO_KEY);
    if (!raw) {
      return null;
    }
    try {
      return JSON.parse(raw) as Usuario;
    } catch {
      return null;
    }
  }
}