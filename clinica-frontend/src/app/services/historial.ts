import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api';
import { Historial, HistorialPayload } from '../models/historial';

@Injectable({
  providedIn: 'root',
})
export class HistorialService {
  private api = inject(ApiService);

  crear(datos: HistorialPayload): Observable<Historial> {
    return this.api.post<Historial>('/historial', datos);
  }

  consultarPorPaciente(idPaciente: number): Observable<Historial[]> {
    return this.api.get<Historial[]>(`/historial/paciente/${idPaciente}`);
  }
}
