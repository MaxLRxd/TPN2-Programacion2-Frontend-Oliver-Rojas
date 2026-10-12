import { Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatListModule } from '@angular/material/list';
import { RouterModule } from '@angular/router';

import { AuthService } from '../../services/auth';
import { normalizarRol } from '../../models/rol';
import { MENU_POR_ROL } from './menu.config';

@Component({
  selector: 'app-menu',
  imports: [MatListModule, RouterModule],
  templateUrl: './menu.html',
  styleUrl: './menu.css',
})
export class Menu {
  private auth = inject(AuthService);
  private usuario = toSignal(this.auth.usuario$, { initialValue: this.auth.getUsuario() });

  /** Opciones del menú según el rol de la sesión (vacío si no hay sesión). */
  readonly items = computed(() => {
    const rol = normalizarRol(this.usuario()?.rol);
    return rol ? MENU_POR_ROL[rol] : [];
  });
}
