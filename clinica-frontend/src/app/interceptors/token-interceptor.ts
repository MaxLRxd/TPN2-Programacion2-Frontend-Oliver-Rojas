import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

import { AuthService } from '../services/auth';

/**
 * Agrega el `Authorization: Bearer` cuando hay token y centraliza el manejo
 * de errores de autenticación:
 *  - 401 (token inválido/vencido): limpia la sesión y redirige a `/login`.
 *  - 403 (sin permiso): redirige a `/acceso-denegado`.
 *
 * El error siempre se re-emite para que `ApiService` lo transforme en `ApiError`
 * y el componente pueda mostrar el mensaje del backend.
 */
export const tokenInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const token = auth.getToken();

  const peticion = token
    ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
    : req;

  return next(peticion).pipe(
    catchError((error: HttpErrorResponse) => {
      // No interceptar el login: un 401 ahí es credenciales inválidas, no sesión vencida.
      const esLogin = req.url.includes('/auth/login');

      if (error.status === 401 && !esLogin) {
        auth.logout();
        if (router.url !== '/login') {
          router.navigate(['/login']);
        }
      } else if (error.status === 403 && router.url !== '/acceso-denegado') {
        router.navigate(['/acceso-denegado']);
      }

      return throwError(() => error);
    }),
  );
};
