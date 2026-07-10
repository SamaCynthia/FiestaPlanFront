import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import Swal from 'sweetalert2';
import { AuthService } from '../core/services/auth.service';
import { Navbar } from '../shared/navbar/navbar';

@Component({
  selector: 'app-welcome',
  standalone: true,
  imports: [CommonModule, Navbar],
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
}
