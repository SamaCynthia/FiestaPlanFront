import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import Swal from 'sweetalert2';
import { AuthService } from '../../core/services/auth.service';
import { Navbar } from '../../shared/navbar/navbar';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, Navbar],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class AdminDashboard implements OnInit {
  private authService = inject(AuthService);
  private router = inject(Router);

  readonly rolActual = this.authService.rolActual;

  // Acciones administrativas del panel
  protected readonly adminActions = [
    {
      title: 'Auditoría del Sistema',
      description: 'Consulta los logs de seguridad y actividades del sistema global de FiestaPlan.',
      icon: '📊',
      route: '/admin/logs',
      enabled: true
    },
    {
      title: 'Gestión de Usuarios',
      description: 'Administración y visualización de cuentas de usuarios registrados y moderación.',
      icon: '👥',
      route: '/admin/usuarios',
      enabled: false
    },
    {
      title: 'Gestión de Salones',
      description: 'Control de inventario, precios y estados de salones de eventos integrados.',
      icon: '🏛️',
      route: '/admin/salones',
      enabled: false
    },
    {
      title: 'Configuraciones de Privacidad',
      description: 'Gestión de consentimientos y políticas del API-Adapter mTLS para integraciones.',
      icon: '🛡️',
      route: '/admin/privacidad',
      enabled: false
    }
  ];

  ngOnInit(): void {
    // Si no está autenticado, intentar cargar perfil
    if (!this.authService.estaAutenticado()) {
      this.authService.cargarPerfil().subscribe();
    }
  }

  logout(): void {
    Swal.fire({
      title: '¿Cerrar Sesión?',
      text: '¿Estás seguro de que deseas salir del panel de administración?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#ec4899', // primary/accent color for admin
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
              text: 'Sesión administrativa cerrada correctamente.',
              confirmButtonColor: '#ec4899',
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
            this.authService.rolActual.set(null);
            this.authService.estaAutenticado.set(false);
            this.router.navigate(['/']);
          }
        });
      }
    });
  }
}
