import { Routes } from '@angular/router';

import { EnConstruccion } from '../components/en-construccion/en-construccion';
import { authGuard } from '../guards/auth-guard';
import { rolGuard } from '../guards/rol-guard';

export const adminRoutes: Routes = [
  {
    path: 'admin',
    canActivate: [authGuard, rolGuard],
    data: { roles: ['admin'] },
    children: [
      { path: '', redirectTo: 'usuarios', pathMatch: 'full' },
      { path: 'usuarios', component: EnConstruccion },
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
          import('../components/admin/coberturas/coberturas').then(
            (modulo) => modulo.Coberturas,
          ),
      },
      { path: 'auditoria', component: EnConstruccion },
      { path: 'reportes', component: EnConstruccion },
    ],
  },
];
