import { Component, effect, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatBadgeModule } from '@angular/material/badge';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatToolbarModule } from '@angular/material/toolbar';
import { Router } from '@angular/router';

import { Notificacion } from '../../models/notificacion';
import { ApiError } from '../../services/api';
import { AuthService } from '../../services/auth';
import { NotificacionService } from '../../services/notificacion';
import { formatearFecha } from '../../utils/fecha';

@Component({
  selector: 'app-header',
  imports: [
    MatToolbarModule,
    MatIconModule,
    MatButtonModule,
    MatMenuModule,
    MatBadgeModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header {
  auth = inject(AuthService);
  readonly notificaciones = inject(NotificacionService);
  private router = inject(Router);
  private usuario = toSignal(this.auth.usuario$, { initialValue: this.auth.getUsuario() });

  readonly errorMarcar = signal('');
  readonly formatearFecha = formatearFecha;

  constructor() {
    effect(() => {
      if (this.usuario()) {
        this.notificaciones.refrescar();
      } else {
        this.notificaciones.limpiar();
      }
    });
  }

  get usuarioActual() {
    return this.auth.getUsuario();
  }

  get nombre() {
    const u = this.usuarioActual;
    return u ? `${u.nombre} ${u.apellido}` : '';
  }

  get tipo() {
    return this.usuarioActual?.rol || '';
  }

  logout(): void {
    this.auth.logout();
    this.router.navigate(['/']);
  }

  marcarLeida(notificacion: Notificacion): void {
    if (notificacion.leida) {
      return;
    }

    this.errorMarcar.set('');
    this.notificaciones.marcarLeida(notificacion.id).subscribe({
      error: (e: ApiError) =>
        this.errorMarcar.set(e?.mensaje || 'No se pudo marcar la notificación como leída'),
    });
  }

  actualizarNotificaciones(): void {
    this.errorMarcar.set('');
    this.notificaciones.refrescar();
  }
}
