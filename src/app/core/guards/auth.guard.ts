import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { catchError, map, of } from 'rxjs';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Read required roles for the route (if any)
  const rolesPermitidos = route.data['roles'] as string[] | undefined;

  // 1. If already authenticated in memory
  if (authService.estaAutenticado()) {
    const rolUsuario = authService.rolActual();
    if (rolesPermitidos && (!rolUsuario || !rolesPermitidos.includes(rolUsuario))) {
      // Role not allowed, redirect to welcome/home
      router.navigate(['/']);
      return false;
    }
    return true;
  }

  // 2. If not authenticated in memory, try to restore session from the cookie
  return authService.cargarPerfil().pipe(
    map((perfil) => {
      const rolUsuario = authService.rolActual();
      if (rolesPermitidos && (!rolUsuario || !rolesPermitidos.includes(rolUsuario))) {
        router.navigate(['/']);
        return false;
      }
      return true;
    }),
    catchError(() => {
      // Not authenticated, redirect to login
      router.navigate(['/login']);
      return of(false);
    })
  );
};
