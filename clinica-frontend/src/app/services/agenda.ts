import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api';
import { Agenda, AgendaCreada, AgendaFiltros, AgendaPayload } from '../models/agenda';

@Injectable({
  providedIn: 'root',
})
export class AgendaService {
  private api = inject(ApiService);

  listar(filtros: AgendaFiltros = {}): Observable<Agenda[]> {
    return this.api.get<Agenda[]>('/agenda', {
      id_medico: filtros.id_medico,
      id_sede: filtros.id_sede,
      fecha: filtros.fecha,
    });
  }

  crear(datos: AgendaPayload): Observable<AgendaCreada> {
    return this.api.post<AgendaCreada>('/agenda', datos);
  }

  actualizar(id: number, datos: AgendaPayload): Observable<AgendaCreada> {
    return this.api.put<AgendaCreada>(`/agenda/${id}`, datos);
  }

  eliminar(id: number): Observable<{ id: number }> {
    return this.api.delete<{ id: number }>(`/agenda/${id}`);
  }
}
