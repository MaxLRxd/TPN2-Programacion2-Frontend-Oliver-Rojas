import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api';
import { Sede, SedePayload } from '../models/sede';

@Injectable({
  providedIn: 'root',
})
export class SedeService {
  private api = inject(ApiService);

  listar(): Observable<Sede[]> {
    return this.api.get<Sede[]>('/sedes');
  }

  crear(datos: SedePayload): Observable<Sede> {
    return this.api.post<Sede>('/sedes', datos);
  }

  actualizar(id: number, datos: SedePayload): Observable<Sede> {
    return this.api.put<Sede>(`/sedes/${id}`, datos);
  }

  eliminar(id: number): Observable<{ id: number }> {
    return this.api.delete<{ id: number }>(`/sedes/${id}`);
  }
}
