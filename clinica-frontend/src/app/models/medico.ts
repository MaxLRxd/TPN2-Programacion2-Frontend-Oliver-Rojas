import { Especialidad } from './especialidad';

export interface Medico {
  id: number;
  nombre: string;
  apellido: string;
  especialidades: Especialidad[];
}

export interface MedicoFiltros {
  especialidad?: number;
  sede?: number;
}
