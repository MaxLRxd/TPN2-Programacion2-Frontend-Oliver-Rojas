export interface AgendaBase {
  id: number;
  fecha: string;
  hora_entrada: string;
  hora_salida: string;
  id_medico: number;
  id_especialidad: number;
  id_sede: number;
}

export interface Agenda extends AgendaBase {
  medico_nombre: string;
  medico_apellido: string;
  especialidad: string;
  sede: string;
}

export type AgendaCreada = AgendaBase;

export interface AgendaPayload {
  fecha: string;
  hora_entrada: string;
  hora_salida: string;
  id_medico?: number;
  id_especialidad: number;
  id_sede: number;
}

export interface AgendaFiltros {
  id_medico?: number;
  id_sede?: number;
  fecha?: string;
}
