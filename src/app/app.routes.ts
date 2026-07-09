import { Routes } from '@angular/router';
import { Welcome } from './welcome/welcome';
import { Login } from './auth/login/login';
import { Register } from './auth/register/register';
import { AvisoPrivacidad } from './legal/aviso-privacidad/aviso-privacidad';
import { UserLogs } from './profile/logs/logs';
import { AdminLogs } from './admin/logs/logs';
import { AdminDashboard } from './admin/dashboard/dashboard';
import { authGuard } from './core/guards/auth.guard';
import { Perfil } from './profile/perfil/perfil';

export const routes: Routes = [
  { path: '', component: Welcome },
  { path: 'login', component: Login },
  { path: 'registro', component: Register },
  { path: 'legal/aviso-privacidad', component: AvisoPrivacidad },
  {
    path: 'perfil',
    component: Perfil,
    canActivate: [authGuard]
  },
  {
    path: 'mi-actividad',
    component: UserLogs,
    canActivate: [authGuard]
  },
  {
    path: 'admin',
    component: AdminDashboard,
    canActivate: [authGuard],
    data: { roles: ['admin', 'moderador'] }
  },
  {
    path: 'admin/logs',
    component: AdminLogs,
    canActivate: [authGuard],
    data: { roles: ['admin'] }
  },
  {
    path: '**',
    redirectTo: ''
  }
];

