import { Routes } from '@angular/router';

import { authGuard } from '../guards/auth-guard';
import { rolGuard } from '../guards/rol-guard';

export const pacienteRoutes: Routes = [
  {
    path: 'paciente',
    canActivate: [authGuard, rolGuard],
    data: { roles: ['paciente'] },
    children: [
      { path: '', redirectTo: 'turnos', pathMatch: 'full' },
      {
        path: 'sacar-turno',
        loadComponent: () =>
          import('../components/paciente/sacar-turno/sacar-turno').then(
            (modulo) => modulo.PacienteSacarTurno,
          ),
      },
      {
        path: 'turnos',
        loadComponent: () =>
          import('../components/paciente/turnos/turnos').then((modulo) => modulo.PacienteTurnos),
      },
      {
        path: 'historial',
        loadComponent: () =>
          import('../components/paciente/historial/historial').then(
            (modulo) => modulo.PacienteHistorial,
          ),
      },
      {
        path: 'datos',
        loadComponent: () =>
          import('../components/paciente/datos/datos').then((modulo) => modulo.PacienteDatos),
      },
    ],
  },
];
