import { inject, Injectable } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { ApiService } from './api';
import { SessionService } from './session.service';
import { AuthResponse, LoginRequest, RegistroForm, RegistroRequest } from '../models/auth';
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