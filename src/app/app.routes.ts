import { Routes } from '@angular/router';
import { Welcome } from './welcome/welcome';
import { Login } from './auth/login/login';
import { Register } from './auth/register/register';
import { AvisoPrivacidad } from './legal/aviso-privacidad/aviso-privacidad';

export const routes: Routes = [
  { path: '', component: Welcome },
  { path: 'login', component: Login },
  { path: 'registro', component: Register },
  { path: 'legal/aviso-privacidad', component: AvisoPrivacidad },
];

