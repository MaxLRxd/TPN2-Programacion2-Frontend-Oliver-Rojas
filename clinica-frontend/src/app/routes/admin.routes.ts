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
      { path: 'especialidades', component: EnConstruccion },
      { path: 'coberturas', component: EnConstruccion },
      { path: 'auditoria', component: EnConstruccion },
      { path: 'reportes', component: EnConstruccion },
    ],
  },
];
