import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api';
import { Notificacion, NotificacionLeida } from '../models/notificacion';

@Injectable({
  providedIn: 'root',
})
export class NotificacionService {
  private api = inject(ApiService);

  listar(): Observable<Notificacion[]> {
    return this.api.get<Notificacion[]>('/notificaciones');
  }

  marcarLeida(id: number): Observable<NotificacionLeida> {
    return this.api.patch<NotificacionLeida>(`/notificaciones/${id}/leer`);
  }
}
