import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth';

export const rolGuard: CanActivateFn = (route, _state) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const usuario = auth.getUsuario();
  const roles = route.data?.['roles'] as string[] | undefined;
  if (!roles || roles.length === 0) {
    return true;
  }
  if (!usuario) {
    router.navigate(['/Login']);
    return false;
  }
  const rol = usuario.rol || usuario.tipoUsuario;
  if (rol && roles.includes(rol)) {
    return true;
  }
  router.navigate(['/acceso-denegado']);
  return false;
};
