import { Routes } from '@angular/router';
import { Home } from './components/home/home';
import { Login } from './components/login/login';
import { Registro } from './components/registro/registro';
import { MiPerfil } from './components/mi-perfil/mi-perfil';
import { authGuard } from './guards/auth-guard';
import { rolGuard } from './guards/rol-guard';
import { EnConstruccion } from './components/en-construccion/en-construccion';

export const routes: Routes = [
  { path: '', component: Home},
  { path: 'Login', component: Login},
  { path: 'registro', component: Registro},
  { path: 'perfil', component: MiPerfil, canActivate: [authGuard]},
  {
    path: 'admin',
    canActivate: [authGuard, rolGuard],
    data: { roles: ['ADMIN'] },
    children: [
      { path: '', redirectTo: 'usuarios', pathMatch: 'full' },
      { path: 'usuarios', component: EnConstruccion},
      //faltan algunos
    ]
  },
  {
    path: 'medico',
    canActivate: [authGuard, rolGuard],
    data: { roles: ['MEDICO'] },
    children: [
      { path: '', }
    ]
  }
];
