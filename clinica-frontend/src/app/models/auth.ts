export interface LoginRequest {
  dni: string;
  password: string;
}

export interface RegistroRequest {
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
  usuario?: Usuario;
}

export interface Usuario {
  id?: number;
  nombre?: string;
  apellido?: string;
  dni?: string;
  email?: string;
  rol?: string;
  tipoUsuario?: string;
}

