import { computed, inject, Injectable, signal } from '@angular/core';
import { catchError, map, Observable, of, tap, throwError } from 'rxjs';
import { ApiError, ApiService } from './api';
import { Notificacion, NotificacionLeida } from '../models/notificacion';

@Injectable({
  providedIn: 'root',
})
export class NotificacionService {
  private api = inject(ApiService);
  private readonly _notificaciones = signal<Notificacion[]>([]);
  private readonly _cargando = signal(false);
  private readonly _error = signal('');

  readonly notificaciones = this._notificaciones.asReadonly();
  readonly cargando = this._cargando.asReadonly();
  readonly error = this._error.asReadonly();
  readonly noLeidas = computed(
    () => this._notificaciones().filter((notificacion) => !notificacion.leida).length,
  );

  listar(): Observable<Notificacion[]> {
    this._cargando.set(true);
    this._error.set('');

    return this.api.get<Notificacion[]>('/notificaciones').pipe(
      map((filas) => this.ordenar(filas)),
      tap((filas) => {
        this._notificaciones.set(filas);
        this._cargando.set(false);
      }),
      catchError((e: ApiError) => {
        this._error.set(e?.mensaje || 'No se pudieron cargar las notificaciones');
        this._cargando.set(false);
        return throwError(() => e);
      }),
    );
  }

  refrescar(): void {
    this.listar().subscribe({ error: () => undefined });
  }

  marcarLeida(id: number): Observable<NotificacionLeida> {
    const actual = this._notificaciones().find((notificacion) => notificacion.id === id);

    if (actual?.leida) {
      return of({ id, leida: 1 });
    }

    if (actual) {
      this._notificaciones.update((filas) =>
        filas.map((notificacion) =>
          notificacion.id === id ? { ...notificacion, leida: 1 } : notificacion,
        ),
      );
    }

    return this.api.patch<NotificacionLeida>(`/notificaciones/${id}/leer`).pipe(
      catchError((e: ApiError) => {
        if (actual) {
          this._notificaciones.update((filas) =>
            filas.map((notificacion) =>
              notificacion.id === id ? { ...notificacion, leida: actual.leida } : notificacion,
            ),
          );
        }
        return throwError(() => e);
      }),
    );
  }

  limpiar(): void {
    this._notificaciones.set([]);
    this._cargando.set(false);
    this._error.set('');
  }

  private ordenar(filas: Notificacion[]): Notificacion[] {
    return [...filas].sort((a, b) => this.tiempo(b.fecha) - this.tiempo(a.fecha));
  }

  private tiempo(fecha: string): number {
    const valor = new Date(fecha).getTime();
    return Number.isNaN(valor) ? 0 : valor;
  }
}
