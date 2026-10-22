export interface DisponibilidadFiltros {
  id_medico: number;
  id_especialidad: number;
  id_sede: number;
}

export interface DisponibilidadHorariosFiltros extends DisponibilidadFiltros {
  fecha: string;
}

export type FechaDisponible = string;

export type HoraDisponible = string;
