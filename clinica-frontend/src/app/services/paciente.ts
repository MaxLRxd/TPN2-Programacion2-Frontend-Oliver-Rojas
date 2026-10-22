import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api';
import { UsuarioAdmin } from '../models/usuario-admin';

@Injectable({
  providedIn: 'root',
})
export class PacienteService {
  private api = inject(ApiService);

  buscar(busqueda = ''): Observable<UsuarioAdmin[]> {
    return this.api.get<UsuarioAdmin[]>('/pacientes', { busqueda });
  }
}
