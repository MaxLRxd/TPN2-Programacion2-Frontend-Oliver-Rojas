import { Component, computed, DestroyRef, ElementRef, inject } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { NavigationEnd, Router, RouterModule } from '@angular/router';
import { filter } from 'rxjs';

import { AuthService } from '../../services/auth';
import { normalizarRol } from '../../models/rol';
import { MENU_POR_ROL } from '../../config/menu.config';

@Component({
  selector: 'app-menu',
  imports: [MatButtonModule, RouterModule],
  templateUrl: './menu.html',
  styleUrl: './menu.css',
})
export class Menu {
  private auth = inject(AuthService);
  private usuario = toSignal(this.auth.usuario$, { initialValue: this.auth.getUsuario() });
  private elemento = inject<ElementRef<HTMLElement>>(ElementRef);

  constructor() {
    // En móvil el menú hace scroll horizontal: se trae a la vista la sección activa.
    inject(Router)
      .events.pipe(
        filter((evento) => evento instanceof NavigationEnd),
        takeUntilDestroyed(inject(DestroyRef)),
      )
      .subscribe(() => setTimeout(() => this.mostrarActivo()));
  }

  private mostrarActivo(): void {
    this.elemento.nativeElement
      .querySelector<HTMLElement>('.menu__item--activo')
      ?.scrollIntoView({ block: 'nearest', inline: 'center' });
  }

  /** Opciones del menú según el rol de la sesión (vacío si no hay sesión). */
  readonly items = computed(() => {
    const rol = normalizarRol(this.usuario()?.rol);
    return rol ? MENU_POR_ROL[rol] : [];
  });
}
