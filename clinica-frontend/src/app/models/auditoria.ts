export interface AuditoriaRegistro {
  id: number;
  id_usuario: number;
  nombre_usuario: string | null;
  accion: string;
  entidad: string;
  id_entidad: number | null;
  detalle: string | null;
  fecha: string;
}

export interface AuditoriaFiltros {
  id_usuario?: number;
  entidad?: string;
  fecha_desde?: string;
  fecha_hasta?: string;
}

export interface AuditoriaOpcionUsuario {
  id: number;
  nombre: string;
}
