import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

import { AuthService } from '../services/auth';

/**
 * Agrega el `Authorization: Bearer` cuando hay token y centraliza el manejo
 * de la sesión vencida: un 401 limpia la sesión y redirige a `/login`.
 *
 * Los 403 de negocio se re-emiten para que `ApiService` los transforme en
 * `ApiError` y cada pantalla muestre el mensaje del backend.
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
      }

      return throwError(() => error);
    }),
  );
};
