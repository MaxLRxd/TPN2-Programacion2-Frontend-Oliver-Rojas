import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api';
import { Turno, TurnoEstado, TurnoPayload } from '../models/turno';

@Injectable({
  providedIn: 'root',
})
export class TurnoService {
  private api = inject(ApiService);

  crear(datos: TurnoPayload): Observable<Turno> {
    return this.api.post<Turno>('/turnos', datos);
  }

  cancelar(id: number): Observable<TurnoEstado> {
    return this.api.patch<TurnoEstado>(`/turnos/${id}/cancelar`);
  }

  atender(id: number): Observable<TurnoEstado> {
    return this.api.patch<TurnoEstado>(`/turnos/${id}/atender`);
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
