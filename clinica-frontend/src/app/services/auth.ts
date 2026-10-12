import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment';
import { AuthResponse, LoginRequest, RegistroRequest, Usuario } from '../models/auth';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/auth`;

  private usuarioSubject = new BehaviorSubject<Usuario | null>(this.loadUsuario());
  usuario$ = this.usuarioSubject.asObservable();

  private loggedInSubject = new BehaviorSubject<boolean>(this.hasToken());
  loggedIn$ = this.loggedInSubject.asObservable();

  login(data: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, data).pipe(
      tap((resp) => {
        if (resp.token) {
          localStorage.setItem('token', resp.token);
        }
        if (resp.usuario) {
          localStorage.setItem('usuario', JSON.stringify(resp.usuario));
          this.usuarioSubject.next(resp.usuario);
        } else {
          this.cargarPerfil().subscribe();
        }
        this.loggedInSubject.next(true);
      })
    );
  }

  registro(data: RegistroRequest): Observable<any> {
    return this.http.post(`${this.apiUrl}/registro`, data);
  }

  cargarPerfil(): Observable<Usuario> {
    return this.http.get<Usuario>(`${this.apiUrl}/perfil`).pipe(
      tap((u) => {
        localStorage.setItem('usuario', JSON.stringify(u));
        this.usuarioSubject.next(u);
      })
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
    if (!s) return null;
    try {
      return JSON.parse(s) as Usuario;
    } catch {
      return null;
    }
  }
}

