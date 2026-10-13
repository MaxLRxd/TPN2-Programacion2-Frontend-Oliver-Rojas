import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { AuthService } from '../services/auth';
import { normalizarRol, Rol } from '../models/rol';

/**
 * Permite el acceso solo si el rol del usuario está entre los roles de `route.data.roles`.
 * Normaliza ambos lados, así funciona tanto con `['ADMIN']` como con `['admin']`.
 */
export const rolGuard: CanActivateFn = (route, _state) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  const rolesPermitidos = ((route.data?.['roles'] as string[] | undefined) ?? [])
    .map((rol) => normalizarRol(rol))
    .filter((rol): rol is Rol => rol !== null);

  if (rolesPermitidos.length === 0) {
    return true;
  }

  const usuario = auth.getUsuario();
  if (!usuario) {
    return router.createUrlTree(['/login']);
  }

  const rol = normalizarRol(usuario.rol);
  return rol && rolesPermitidos.includes(rol) ? true : router.createUrlTree(['/acceso-denegado']);
};
