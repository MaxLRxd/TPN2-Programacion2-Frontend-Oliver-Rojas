/**
 * Envelope de respuesta del backend:
 * { codigo, estado, datos }. Los errores viajan en `estado` (no `mensaje`).
 */
export interface ApiResponse<T> {
  codigo: number;
  estado: string;
  datos: T;
}