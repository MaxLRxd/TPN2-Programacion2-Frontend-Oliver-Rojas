import { Routes } from '@angular/router';

import { EnConstruccion } from '../components/en-construccion/en-construccion';
import { authGuard } from '../guards/auth-guard';
import { rolGuard } from '../guards/rol-guard';

export const pacienteRoutes: Routes = [
  {
    path: 'paciente',
    canActivate: [authGuard, rolGuard],
    data: { roles: ['paciente'] },
    children: [
      { path: '', redirectTo: 'turnos', pathMatch: 'full' },
      { path: 'sacar-turno', component: EnConstruccion },
      { path: 'turnos', component: EnConstruccion },
      { path: 'historial', component: EnConstruccion },
    ],
  },
];
