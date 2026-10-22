import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api';
import { Especialidad, EspecialidadPayload } from '../models/especialidad';

@Injectable({
  providedIn: 'root',
})
export class EspecialidadService {
  private api = inject(ApiService);

  listar(): Observable<Especialidad[]> {
    return this.api.get<Especialidad[]>('/especialidades');
  }

  crear(datos: EspecialidadPayload): Observable<Especialidad> {
    return this.api.post<Especialidad>('/especialidades', datos);
  }

  actualizar(id: number, datos: EspecialidadPayload): Observable<Especialidad> {
    return this.api.put<Especialidad>(`/especialidades/${id}`, datos);
  }

  eliminar(id: number): Observable<{ id: number }> {
    return this.api.delete<{ id: number }>(`/especialidades/${id}`);
  }
}
