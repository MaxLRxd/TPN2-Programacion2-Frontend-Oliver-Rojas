import { Especialidad } from './especialidad';
import { Rol } from './rol';

export interface UsuarioAdmin {
  id: number;
  apellido: string;
  nombre: string;
  fecha_nacimiento: string;
  email: string;
  telefono: string;
  dni: string;
  rol: Rol;
  id_sede: number | null;
  sede: string | null;
  id_cobertura: number | null;
  cobertura: string | null;
  especialidades?: Especialidad[];
}

export interface UsuariosPaginados {
  total: number;
  pagina: number;
  limite: number;
  totalPaginas: number;
  usuarios: UsuarioAdmin[];
}

export interface UsuarioAdminFiltros {
  pagina?: number;
  limite?: number;
  nombre?: string;
  apellido?: string;
  rol?: Rol;
  id_sede?: number;
}

export interface UsuarioAdminPayload {
  nombre: string;
  apellido: string;
  dni: string;
  email: string;
  rol: Rol;
  fecha_nacimiento: string;
  telefono?: string;
  password?: string;
  id_sede?: number | null;
  id_cobertura?: number | null;
  especialidades?: number[];
}
