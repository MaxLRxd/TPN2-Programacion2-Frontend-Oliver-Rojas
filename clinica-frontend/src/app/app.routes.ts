import { Routes } from '@angular/router';
import { Home } from './components/home/home';
import { Login } from './components/login/login';
import { Registro } from './components/registro/registro';
import { MiPerfil } from './components/mi-perfil/mi-perfil';
import { authGuard } from './guards/auth-guard';
import { rolGuard } from './guards/rol-guard';
import { EnConstruccion } from './components/en-construccion/en-construccion';
import { AccesoDenegado } from './components/acceso-denegado/acceso-denegado';
import { NoEncontrada } from './components/no-encontrada/no-encontrada';

export const routes: Routes = [
  { path: '', component: Home },
  { path: 'login', component: Login },
  { path: 'Login', redirectTo: 'login', pathMatch: 'full' },
  { path: 'registro', component: Registro },
  { path: 'perfil', component: MiPerfil, canActivate: [authGuard] },
  {
    path: 'admin',
    canActivate: [authGuard, rolGuard],
    data: { roles: ['ADMIN'] },
    children: [
      { path: '', redirectTo: 'usuarios', pathMatch: 'full' },
      { path: 'usuarios', component: EnConstruccion },
    ],
  },
  {
    path: 'medico',
    canActivate: [authGuard, rolGuard],
    data: { roles: ['MEDICO'] },
    children: [{ path: '', redirectTo: 'agenda', pathMatch: 'full' }, { path: 'agenda', component: EnConstruccion }],
  },
  {
    path: 'operador',
    canActivate: [authGuard, rolGuard],
    data: { roles: ['OPERADOR'] },
    children: [{ path: '', redirectTo: 'turnos', pathMatch: 'full' }, { path: 'turnos', component: EnConstruccion }],
  },
  {
    path: 'paciente',
    canActivate: [authGuard, rolGuard],
    data: { roles: ['PACIENTE'] },
    children: [{ path: '', redirectTo: 'turnos', pathMatch: 'full' }, { path: 'turnos', component: EnConstruccion }],
  },
  { path: 'acceso-denegado', component: AccesoDenegado },
  { path: '**', component: NoEncontrada },
];
