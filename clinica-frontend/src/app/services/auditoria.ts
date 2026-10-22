import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AuditoriaFiltros, AuditoriaRegistro } from '../models/auditoria';
import { ApiService } from './api';

@Injectable({
  providedIn: 'root',
})
export class AuditoriaService {
  private api = inject(ApiService);

  listar(filtros: AuditoriaFiltros = {}): Observable<AuditoriaRegistro[]> {
    return this.api.get<AuditoriaRegistro[]>('/auditoria', {
      id_usuario: filtros.id_usuario,
      entidad: filtros.entidad,
      fecha_desde: filtros.fecha_desde,
      fecha_hasta: filtros.fecha_hasta,
    });
  }
}
