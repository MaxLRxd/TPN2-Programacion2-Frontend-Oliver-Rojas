import { Routes } from '@angular/router';

import { Home } from './components/home/home';
import { Login } from './components/login/login';
import { Registro } from './components/registro/registro';
import { MiPerfil } from './components/mi-perfil/mi-perfil';
import { AccesoDenegado } from './components/acceso-denegado/acceso-denegado';
import { NoEncontrada } from './components/no-encontrada/no-encontrada';
import { authGuard } from './guards/auth-guard';
import { guestGuard } from './guards/guest-guard';

import { adminRoutes } from './routes/admin.routes';
import { medicoRoutes } from './routes/medico.routes';
import { operadorRoutes } from './routes/operador.routes';
import { pacienteRoutes } from './routes/paciente.routes';

export const routes: Routes = [
  { path: '', component: Home },
  { path: 'login', component: Login, canActivate: [guestGuard] },
  { path: 'Login', redirectTo: 'login', pathMatch: 'full' },
  { path: 'registro', component: Registro, canActivate: [guestGuard] },
  { path: 'perfil', component: MiPerfil, canActivate: [authGuard] },

  // Secciones por rol (cada archivo agrupa las rutas de un rol).
  ...adminRoutes,
  ...medicoRoutes,
  ...operadorRoutes,
  ...pacienteRoutes,

  { path: 'acceso-denegado', component: AccesoDenegado },
  { path: '**', component: NoEncontrada },
];
