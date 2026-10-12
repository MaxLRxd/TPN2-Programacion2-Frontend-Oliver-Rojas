/**
 * Usuario único para toda la app (sesión y "Mi perfil").
 * El backend envía los campos en snake_case y el rol en minúsculas
 * (paciente, medico, operador, admin).
 *
 * Según el endpoint, algunos campos pueden no venir
 * (login no trae dni; registro no trae telefono/id_sede), por eso son opcionales.
 */
export interface Usuario {
  id?: number;
  nombre?: string;
  apellido?: string;
  dni?: string;
  email?: string;
  telefono?: string | null;
  rol?: string;
  id_sede?: number | null;
  id_cobertura?: number | null;
  fecha_nacimiento?: string | null;
}