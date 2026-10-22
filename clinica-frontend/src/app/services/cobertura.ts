import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api';
import { Cobertura, CoberturaPayload } from '../models/cobertura';

@Injectable({
  providedIn: 'root',
})
export class CoberturaService {
  private api = inject(ApiService);

  obtenerCoberturas(): Observable<Cobertura[]> {
    return this.api.get<Cobertura[]>('/coberturas');
  }

  crear(datos: CoberturaPayload): Observable<Cobertura> {
    return this.api.post<Cobertura>('/coberturas', datos);
  }

  actualizar(id: number, datos: CoberturaPayload): Observable<Cobertura> {
    return this.api.put<Cobertura>(`/coberturas/${id}`, datos);
  }

  eliminar(id: number): Observable<{ id: number }> {
    return this.api.delete<{ id: number }>(`/coberturas/${id}`);
  }
}