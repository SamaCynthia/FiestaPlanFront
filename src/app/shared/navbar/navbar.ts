import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import Swal from 'sweetalert2';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './navbar.html',
})
export class Navbar {
  private authService = inject(AuthService);
  private router = inject(Router);

  readonly estaAutenticado = this.authService.estaAutenticado;
  readonly rolActual = this.authService.rolActual;

  logout(): void {
    Swal.fire({
      title: '¿Cerrar Sesión?',
      text: '¿Estás seguro de que deseas salir de FiestaPlan?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#6366f1',
      cancelButtonColor: '#3f3f46',
      confirmButtonText: 'Sí, salir',
      cancelButtonText: 'Cancelar',
      background: '#18181b',
      color: '#fff',
    }).then((result) => {
      if (result.isConfirmed) {
        this.authService.logout().subscribe({
          next: () => {
            Swal.fire({
              icon: 'success',
              title: 'Sesión Cerrada',
              text: 'Has cerrado sesión con éxito.',
              confirmButtonColor: '#6366f1',
              background: '#18181b',
              color: '#fff',
              timer: 1500,
              showConfirmButton: false,
            }).then(() => {
              this.router.navigate(['/']);
            });
          },
          error: () => {
            this.authService.rolActual.set(null);
            this.authService.estaAutenticado.set(false);
            this.router.navigate(['/']);
          }
        });
      }
    });
  }
}
