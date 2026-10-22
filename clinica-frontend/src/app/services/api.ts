import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { ApiResponse } from '../models/api';

export type QueryParams = Record<string, string | number | boolean | null | undefined>;

/** Error normalizado que los componentes pueden mostrar directamente. */
export class ApiError extends Error {
  readonly codigo: number;
  readonly mensaje: string;

  constructor(codigo: number, mensaje: string) {
    super(mensaje);
    this.name = 'ApiError';
    this.codigo = codigo;
    // `mensaje` queda como alias accesible de `message` (Error) para que los
    // componentes lean siempre `error.mensaje`.
    this.mensaje = mensaje;
  }
}

/**
 * Capa única de HTTP. Toda llamada al backend pasa por acá:
 * - Apunta a `environment.apiUrl` (única fuente de verdad del puerto).
 * - Desempaqueta `datos` del envelope `{ codigo, estado, datos }`.
 * - Convierte cualquier error (HTTP o estado != 'ok') a `ApiError` con el
 *   mensaje del backend, que viaja en el campo `estado`.
 */
@Injectable({ providedIn: 'root' })
export class ApiService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  get<T>(path: string, params?: QueryParams): Observable<T> {
    return this.request<T>('GET', path, undefined, params);
  }

  post<T>(path: string, body?: unknown, params?: QueryParams): Observable<T> {
    return this.request<T>('POST', path, body, params);
  }

  put<T>(path: string, body?: unknown, params?: QueryParams): Observable<T> {
    return this.request<T>('PUT', path, body, params);
  }

  patch<T>(path: string, body?: unknown, params?: QueryParams): Observable<T> {
    return this.request<T>('PATCH', path, body, params);
  }

  delete<T>(path: string, params?: QueryParams): Observable<T> {
    return this.request<T>('DELETE', path, undefined, params);
  }

  private request<T>(
    method: string,
    path: string,
    body?: unknown,
    params?: QueryParams,
  ): Observable<T> {
    const url = path.startsWith('http') ? path : `${this.apiUrl}${path}`;
    return this.http.request<ApiResponse<T>>(method, url, {
      body,
      params: this.crearParams(params),
    }).pipe(
      map((resp) => {
        if (resp.codigo >= 400 || resp.estado !== 'ok') {
          throw new ApiError(resp.codigo, resp.estado);
        }
        return resp.datos;
      }),
      catchError((err: unknown) => throwError(() => this.aApiError(err))),
    );
  }

  private crearParams(params?: QueryParams): HttpParams | undefined {
    if (!params) {
      return undefined;
    }

    let httpParams = new HttpParams();
    for (const [clave, valor] of Object.entries(params)) {
      if (valor !== undefined && valor !== null && valor !== '') {
        httpParams = httpParams.set(clave, String(valor));
      }
    }
    return httpParams;
  }

  private aApiError(err: unknown): ApiError {
    if (err instanceof ApiError) {
      return err;
    }
    if (err instanceof HttpErrorResponse) {
      // El backend siempre responde con el envelope, incluso en errores.
      const body = err.error as Partial<ApiResponse<unknown>> | null;
      if (body && typeof body.estado === 'string' && typeof body.codigo === 'number') {
        return new ApiError(body.codigo, body.estado);
      }
      return new ApiError(err.status, this.mensajeSegunStatus(err.status));
    }
    return new ApiError(0, 'Error inesperado');
  }

  private mensajeSegunStatus(status: number): string {
    switch (status) {
      case 0:
        return 'No se pudo conectar con el servidor';
      case 401:
        return 'Sesión no válida o vencida';
      case 403:
        return 'No tiene permisos para realizar esta acción';
      case 404:
        return 'Recurso no encontrado';
      case 500:
        return 'Error interno del servidor';
      default:
        return 'Ocurrió un error inesperado';
    }
  }
}