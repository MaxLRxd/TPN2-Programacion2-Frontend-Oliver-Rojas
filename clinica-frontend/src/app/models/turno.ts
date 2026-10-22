export type EstadoTurno = 'confirmado' | 'cancelado' | 'atendido';

export interface Turno {
  id: number;
  fecha: string;
  hora: string;
  nota: string | null;
  estado: EstadoTurno;
  id_paciente?: number;
  id_cobertura?: number | null;
  id_medico?: number;
  id_especialidad?: number;
  id_sede?: number;
  paciente_nombre?: string;
  paciente_apellido?: string;
  paciente_fecha_nacimiento?: string | null;
  medico_nombre?: string;
  medico_apellido?: string;
  especialidad?: string;
  sede?: string;
}

export interface TurnoPayload {
  id_especialidad: number;
  id_sede: number;
  id_medico: number;
  fecha: string;
  hora: string;
  nota: string;
  id_paciente?: number;
}

export interface TurnoEstado {
  id: number;
  estado: EstadoTurno;
}
