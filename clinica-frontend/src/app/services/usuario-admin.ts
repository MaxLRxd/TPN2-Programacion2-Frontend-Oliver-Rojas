import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api';
import {
  UsuarioAdmin,
  UsuarioAdminFiltros,
  UsuarioAdminPayload,
  UsuariosPaginados,
} from '../models/usuario-admin';

@Injectable({
  providedIn: 'root',
})
export class UsuarioAdminService {
  private api = inject(ApiService);

  listar(filtros: UsuarioAdminFiltros = {}): Observable<UsuariosPaginados> {
    return this.api.get<UsuariosPaginados>('/usuarios', {
      pagina: filtros.pagina,
      limite: filtros.limite,
      nombre: filtros.nombre,
      apellido: filtros.apellido,
      rol: filtros.rol,
      id_sede: filtros.id_sede,
    });
  }

  crear(datos: UsuarioAdminPayload): Observable<UsuarioAdmin> {
    return this.api.post<UsuarioAdmin>('/usuarios', datos);
  }

  actualizar(id: number, datos: UsuarioAdminPayload): Observable<UsuarioAdmin> {
    return this.api.put<UsuarioAdmin>(`/usuarios/${id}`, datos);
  }
}
