export interface Notificacion {
  id: number;
  tipo: string;
  mensaje: string;
  leida: number;
  fecha: string;
}

export interface NotificacionLeida {
  id: number;
  leida: number;
}
