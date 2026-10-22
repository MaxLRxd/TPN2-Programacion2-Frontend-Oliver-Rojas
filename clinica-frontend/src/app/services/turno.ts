import { inject, Injectable } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { ApiService } from './api';
import { NotificacionService } from './notificacion';
import { Turno, TurnoEstado, TurnoPayload } from '../models/turno';

@Injectable({
  providedIn: 'root',
})
export class TurnoService {
  private api = inject(ApiService);
  private notificaciones = inject(NotificacionService);

  crear(datos: TurnoPayload): Observable<Turno> {
    return this.api
      .post<Turno>('/turnos', datos)
      .pipe(tap(() => this.notificaciones.refrescar()));
  }

  cancelar(id: number): Observable<TurnoEstado> {
    return this.api
      .patch<TurnoEstado>(`/turnos/${id}/cancelar`)
      .pipe(tap(() => this.notificaciones.refrescar()));
  }

  atender(id: number): Observable<TurnoEstado> {
    return this.api
      .patch<TurnoEstado>(`/turnos/${id}/atender`)
      .pipe(tap(() => this.notificaciones.refrescar()));
  }

  listarPorPaciente(): Observable<Turno[]> {
    return this.api.get<Turno[]>('/turnos/paciente');
  }

  listarPorMedico(fecha: string): Observable<Turno[]> {
    return this.api.get<Turno[]>('/turnos/medico', { fecha });
  }

  listarPorSede(fecha: string): Observable<Turno[]> {
    return this.api.get<Turno[]>('/turnos/sede', { fecha });
  }
}
