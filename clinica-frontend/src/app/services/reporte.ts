import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api';
import {
  RankingMedico,
  ReporteFiltros,
  TasaCancelacion,
  TurnosPorEspecialidad,
  TurnosPorSede,
} from '../models/reporte';

@Injectable({
  providedIn: 'root',
})
export class ReporteService {
  private api = inject(ApiService);

  turnosPorEspecialidad(filtros: ReporteFiltros = {}): Observable<TurnosPorEspecialidad[]> {
    return this.api.get<TurnosPorEspecialidad[]>('/reportes/turnos-por-especialidad', {
      fecha_desde: filtros.fecha_desde,
      fecha_hasta: filtros.fecha_hasta,
    });
  }

  turnosPorSede(filtros: ReporteFiltros = {}): Observable<TurnosPorSede[]> {
    return this.api.get<TurnosPorSede[]>('/reportes/turnos-por-sede', {
      fecha_desde: filtros.fecha_desde,
      fecha_hasta: filtros.fecha_hasta,
    });
  }

  rankingMedicos(filtros: ReporteFiltros = {}): Observable<RankingMedico[]> {
    return this.api.get<RankingMedico[]>('/reportes/ranking-medicos', {
      fecha_desde: filtros.fecha_desde,
      fecha_hasta: filtros.fecha_hasta,
    });
  }

  tasaCancelacion(filtros: ReporteFiltros = {}): Observable<TasaCancelacion> {
    return this.api.get<TasaCancelacion>('/reportes/tasa-cancelacion', {
      fecha_desde: filtros.fecha_desde,
      fecha_hasta: filtros.fecha_hasta,
    });
  }
}
