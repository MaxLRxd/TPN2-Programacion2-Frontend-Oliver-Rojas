import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api';
import { Medico, MedicoFiltros } from '../models/medico';

@Injectable({
  providedIn: 'root',
})
export class MedicoService {
  private api = inject(ApiService);

  listar(filtros: MedicoFiltros = {}): Observable<Medico[]> {
    return this.api.get<Medico[]>('/medicos', {
      especialidad: filtros.especialidad,
      sede: filtros.sede,
    });
  }
}
