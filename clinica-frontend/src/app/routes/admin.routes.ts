import { Routes } from '@angular/router';

import { authGuard } from '../guards/auth-guard';
import { rolGuard } from '../guards/rol-guard';

export const adminRoutes: Routes = [
  {
    path: 'admin',
    canActivate: [authGuard, rolGuard],
    data: { roles: ['admin'] },
    children: [
      { path: '', redirectTo: 'usuarios', pathMatch: 'full' },
      {
        path: 'usuarios',
        loadComponent: () =>
          import('../components/admin/usuarios/usuarios').then((modulo) => modulo.Usuarios),
      },
      {
        path: 'sedes',
        loadComponent: () =>
          import('../components/admin/sedes/sedes').then((modulo) => modulo.Sedes),
      },
      {
        path: 'especialidades',
        loadComponent: () =>
          import('../components/admin/especialidades/especialidades').then(
            (modulo) => modulo.Especialidades,
          ),
      },
      {
        path: 'coberturas',
        loadComponent: () =>
          import('../components/admin/coberturas/coberturas').then((modulo) => modulo.Coberturas),
      },
      {
        path: 'auditoria',
        loadComponent: () =>
          import('../components/admin/auditoria/auditoria').then((modulo) => modulo.Auditoria),
      },
      {
        path: 'reportes',
        loadComponent: () =>
          import('../components/admin/reportes/reportes').then((modulo) => modulo.Reportes),
      },
    ],
  },
];
