import { Routes } from '@angular/router';

import { EnConstruccion } from '../components/en-construccion/en-construccion';
import { authGuard } from '../guards/auth-guard';
import { rolGuard } from '../guards/rol-guard';

export const medicoRoutes: Routes = [
  {
    path: 'medico',
    canActivate: [authGuard, rolGuard],
    data: { roles: ['medico'] },
    children: [
      { path: '', redirectTo: 'agenda', pathMatch: 'full' },
      { path: 'agenda', component: EnConstruccion },
      { path: 'turnos', component: EnConstruccion },
      { path: 'historial', component: EnConstruccion },
    ],
  },
];
