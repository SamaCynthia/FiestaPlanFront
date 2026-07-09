import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import Swal from 'sweetalert2';
import { AuthService } from '../core/services/auth.service';

@Component({
  selector: 'app-welcome',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './welcome.html',
  styleUrl: './welcome.css'
})
export class Welcome implements OnInit {
  private authService = inject(AuthService);
  private router = inject(Router);

  readonly estaAutenticado = this.authService.estaAutenticado;
  readonly rolActual = this.authService.rolActual;

  protected readonly features = [
    {
      icon: '✨',
      title: 'Asistente con IA',
      description: 'Genera planes de eventos, listas de tareas iniciales y estimación de costos al instante.'
    },
    {
      icon: '👥',
      title: 'Colaboración en Vivo',
      description: 'Asigna tareas a colaboradores con carga de evidencia fotográfica (MinIO) integrada.'
    },
    {
      icon: '📊',
      title: 'Presupuesto Dinámico',
      description: 'Monitorea gastos en tiempo real con alertas interactivas si superas el límite establecido.'
    },
    {
      icon: '💌',
      title: 'RSVP Simplificado',
      description: 'Invitaciones con enlaces únicos y confirmación inmediata sin requerir inicio de sesión.'
    }
  ];

  ngOnInit(): void {
    // Intentar restaurar sesión si no está cargada en memoria
    if (!this.estaAutenticado()) {
      this.authService.cargarPerfil().subscribe({
        error: () => console.log('Usuario no autenticado (sesión limpia).')
      });
    }
  }

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
          error: (err) => {
            console.error('Error al cerrar sesión:', err);
            // Even if the request fails, let's reset client signals
            this.authService.rolActual.set(null);
            this.authService.estaAutenticado.set(false);
            this.router.navigate(['/']);
          }
        });
      }
    });
  }
}
