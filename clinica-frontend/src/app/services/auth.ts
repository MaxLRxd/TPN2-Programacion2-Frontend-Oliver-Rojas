import { inject, Injectable } from '@angular/core';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { ApiService } from './api';
import { AuthResponse, LoginRequest, RegistroRequest } from '../models/auth';
import { Usuario } from '../models/usuario';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private api = inject(ApiService);

  private usuarioSubject = new BehaviorSubject<Usuario | null>(this.loadUsuario());
  usuario$ = this.usuarioSubject.asObservable();

  private loggedInSubject = new BehaviorSubject<boolean>(this.hasToken());
  loggedIn$ = this.loggedInSubject.asObservable();

  login(data: LoginRequest): Observable<AuthResponse> {
    return this.api.post<AuthResponse>('/auth/login', data).pipe(
      tap((resp) => {
        localStorage.setItem('token', resp.token);
        localStorage.setItem('usuario', JSON.stringify(resp.usuario));
        this.usuarioSubject.next(resp.usuario);
        this.loggedInSubject.next(true);
      }),
    );
  }

  registro(data: RegistroRequest): Observable<Usuario> {
    return this.api.post<Usuario>('/auth/registro', data);
  }

  cargarPerfil(): Observable<Usuario> {
    return this.api.get<Usuario>('/auth/perfil').pipe(
      tap((u) => {
        localStorage.setItem('usuario', JSON.stringify(u));
        this.usuarioSubject.next(u);
      }),
    );
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    this.usuarioSubject.next(null);
    this.loggedInSubject.next(false);
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  isLoggedIn(): boolean {
    return this.hasToken();
  }

  getUsuario(): Usuario | null {
    return this.usuarioSubject.value;
  }

  private hasToken(): boolean {
    return !!localStorage.getItem('token');
  }

  private loadUsuario(): Usuario | null {
    const s = localStorage.getItem('usuario');
    if (!s) {
      return null;
    }
    try {
      return JSON.parse(s) as Usuario;
    } catch {
      return null;
    }
  }
}