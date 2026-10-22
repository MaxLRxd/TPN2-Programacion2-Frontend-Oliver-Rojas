import { Routes } from '@angular/router';

import { authGuard } from '../guards/auth-guard';
import { rolGuard } from '../guards/rol-guard';

export const medicoRoutes: Routes = [
  {
    path: 'medico',
    canActivate: [authGuard, rolGuard],
    data: { roles: ['medico'] },
    children: [
      { path: '', redirectTo: 'agenda', pathMatch: 'full' },
      {
        path: 'agenda',
        loadComponent: () =>
          import('../components/medico/agenda/agenda').then((modulo) => modulo.MedicoAgenda),
      },
      {
        path: 'turnos',
        loadComponent: () =>
          import('../components/medico/turnos/turnos').then((modulo) => modulo.MedicoTurnos),
      },
      {
        path: 'historial',
        loadComponent: () =>
          import('../components/medico/historial/historial').then(
            (modulo) => modulo.MedicoHistorial,
          ),
      },
    ],
  },
];
