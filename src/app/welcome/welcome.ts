import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-welcome',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './welcome.html',
  styleUrl: './welcome.css'
})
export class Welcome {
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
}
