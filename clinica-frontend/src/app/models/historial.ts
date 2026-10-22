export interface Historial {
  id: number;
  id_turno: number;
  id_medico: number;
  id_paciente: number;
  diagnostico: string;
  tratamiento: string | null;
  observaciones: string | null;
  fecha_registro: string;
}

export interface HistorialPayload {
  id_turno: number;
  diagnostico: string;
  tratamiento?: string | null;
  observaciones?: string | null;
}
