import { Usuario } from './usuario';

export interface LoginRequest {
  dni: string;
  password: string;
}

/** El backend espera snake_case: fecha_nacimiento e id_cobertura. */
export interface RegistroRequest {
  nombre: string;
  apellido: string;
  dni: string;
  email: string;
  password: string;
  fecha_nacimiento: string;
  id_cobertura: number;
  telefono?: string;
  id_sede?: number;
}

export interface AuthResponse {
  token: string;
  usuario: Usuario;
}