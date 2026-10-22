import { Routes } from '@angular/router';

import { authGuard } from '../guards/auth-guard';
import { rolGuard } from '../guards/rol-guard';

export const operadorRoutes: Routes = [
  {
    path: 'operador',
    canActivate: [authGuard, rolGuard],
    data: { roles: ['operador'] },
    children: [
      { path: '', redirectTo: 'agenda', pathMatch: 'full' },
      {
        path: 'agenda',
        loadComponent: () =>
          import('../components/operador/agenda/agenda').then((m) => m.OperadorAgenda),
      },
      {
        path: 'turnos',
        loadComponent: () =>
          import('../components/operador/turnos/turnos').then((m) => m.OperadorTurnos),
      },
      {
        path: 'pacientes',
        loadComponent: () =>
          import('../components/operador/pacientes/pacientes').then((m) => m.OperadorPacientes),
      },
    ],
  },
];
