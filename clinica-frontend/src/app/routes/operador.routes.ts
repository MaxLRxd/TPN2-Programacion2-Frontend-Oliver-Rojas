import { Routes } from '@angular/router';

import { EnConstruccion } from '../components/en-construccion/en-construccion';
import { authGuard } from '../guards/auth-guard';
import { rolGuard } from '../guards/rol-guard';

export const operadorRoutes: Routes = [
  {
    path: 'operador',
    canActivate: [authGuard, rolGuard],
    data: { roles: ['operador'] },
    children: [
      { path: '', redirectTo: 'turnos', pathMatch: 'full' },
      { path: 'turnos', component: EnConstruccion },
      { path: 'agenda', component: EnConstruccion },
    ],
  },
];
