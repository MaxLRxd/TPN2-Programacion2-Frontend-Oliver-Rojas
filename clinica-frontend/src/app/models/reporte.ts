export interface ReporteFiltros {
  fecha_desde?: string;
  fecha_hasta?: string;
}

export interface TurnosPorEspecialidad {
  id: number;
  descripcion: string;
  cantidad: number;
}

export interface TurnosPorSede {
  id: number;
  nombre: string;
  cantidad: number;
}

export interface RankingMedico {
  id: number;
  nombre: string;
  apellido: string;
  cantidad_atendidos: number;
}

export interface TasaCancelacion {
  total_turnos: number;
  total_cancelados: number;
  tasa_cancelacion: number;
}
