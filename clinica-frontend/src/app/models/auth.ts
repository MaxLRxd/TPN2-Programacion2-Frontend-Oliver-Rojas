import { Usuario } from './usuario';

export interface LoginRequest {
  dni: string;
  password: string;
}

/** DTO de entrada de la API: nombres en snake_case tal como los espera el backend. */
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

/** Datos de registro tal como los maneja la UI (camelCase). */
export interface RegistroForm {
  nombre: string;
  apellido: string;
  dni: string;
  email: string;
  password: string;
  fechaNacimiento: string;
  coberturaId: number;
}

export interface AuthResponse {
  token: string;
  usuario: Usuario;
}