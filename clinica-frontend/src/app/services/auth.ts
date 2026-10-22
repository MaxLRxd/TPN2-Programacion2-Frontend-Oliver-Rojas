import { inject, Injectable } from '@angular/core';
import { catchError, map, Observable, of, tap } from 'rxjs';
import { ApiError, ApiService } from './api';
import { SessionService } from './session.service';
import {
  AuthResponse,
  LoginRequest,
  PerfilPacienteRequest,
  RegistroForm,
  RegistroRequest,
} from '../models/auth';
import { Usuario } from '../models/usuario';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private api = inject(ApiService);
  private sesion = inject(SessionService);

  readonly usuario$ = this.sesion.usuario$;
  readonly loggedIn$ = this.sesion.loggedIn$;

  login(datos: LoginRequest): Observable<AuthResponse> {
    return this.api
      .post<AuthResponse>('/auth/login', datos)
      .pipe(tap((resp) => this.sesion.guardarSesion(resp.token, resp.usuario)));
  }

  registro(datos: RegistroForm): Observable<Usuario> {
    return this.api.post<Usuario>('/auth/registro', this.toRegistroRequest(datos));
  }

  cargarPerfil(): Observable<Usuario> {
    return this.api
      .get<Usuario>('/auth/perfil')
      .pipe(tap((usuario) => this.sesion.actualizarUsuario(usuario)));
  }

  actualizarPerfil(datos: PerfilPacienteRequest): Observable<Usuario> {
    return this.api
      .patch<Usuario>('/auth/perfil', datos)
      .pipe(tap((usuario) => this.sesion.actualizarUsuario(usuario)));
  }

  /**
   * Reconstruye la sesión al arrancar la app si hay token pero no usuario.
   * Si el token está vencido (401), limpia la sesión.
   */
  rehidratarSesion(): Observable<void> {
    if (!this.sesion.estaAutenticado() || this.sesion.getUsuario()) {
      return of(void 0);
    }
    return this.cargarPerfil().pipe(
      map(() => void 0),
      catchError((e: ApiError) => {
        if (e?.codigo === 401) {
          this.logout();
        }
        return of(void 0);
      }),
    );
  }

  logout(): void {
    this.sesion.limpiarSesion();
  }

  getToken(): string | null {
    return this.sesion.getToken();
  }

  isLoggedIn(): boolean {
    return this.sesion.estaAutenticado();
  }

  getUsuario(): Usuario | null {
    return this.sesion.getUsuario();
  }

  /** Traduce de camelCase (UI) al snake_case que espera el backend. */
  private toRegistroRequest(datos: RegistroForm): RegistroRequest {
    return {
      nombre: datos.nombre,
      apellido: datos.apellido,
      dni: datos.dni,
      email: datos.email,
      password: datos.password,
      fecha_nacimiento: datos.fechaNacimiento,
      id_cobertura: datos.coberturaId,
    };
  }
}