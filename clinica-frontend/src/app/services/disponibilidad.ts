import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api';
import {
  DisponibilidadFiltros,
  DisponibilidadHorariosFiltros,
  FechaDisponible,
  HoraDisponible,
} from '../models/disponibilidad';

@Injectable({
  providedIn: 'root',
})
export class DisponibilidadService {
  private api = inject(ApiService);

  fechas(filtros: DisponibilidadFiltros): Observable<FechaDisponible[]> {
    return this.api.get<FechaDisponible[]>('/turnos/disponibilidad/fechas', {
      id_medico: filtros.id_medico,
      id_especialidad: filtros.id_especialidad,
      id_sede: filtros.id_sede,
    });
  }

  horarios(filtros: DisponibilidadHorariosFiltros): Observable<HoraDisponible[]> {
    return this.api.get<HoraDisponible[]>('/turnos/disponibilidad/horarios', {
      id_medico: filtros.id_medico,
      id_especialidad: filtros.id_especialidad,
      id_sede: filtros.id_sede,
      fecha: filtros.fecha,
    });
  }
}
