import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { rutaInicioPorRol } from '../config/menu.config';
import { AuthService } from '../services/auth';

/** Solo para visitantes (login, registro): con sesión iniciada redirige al inicio del rol. */
export const guestGuard: CanActivateFn = (_route, _state) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  return auth.isLoggedIn()
    ? router.parseUrl(rutaInicioPorRol(auth.getUsuario()?.rol))
    : true;
};
