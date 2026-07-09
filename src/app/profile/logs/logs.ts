import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuditLogsService, AuditLog } from '../../core/services/audit-logs.service';
import { Navbar } from '../../shared/navbar/navbar';

@Component({
  selector: 'app-user-logs',
  standalone: true,
  imports: [CommonModule, RouterLink, Navbar],
  templateUrl: './logs.html',
  styleUrl: './logs.css'
})
export class UserLogs implements OnInit {
  private auditLogsService = inject(AuditLogsService);

  readonly logs = signal<AuditLog[]>([]);
  readonly cargando = signal(true);
  readonly error = signal<string | null>(null);

  ngOnInit(): void {
    this.cargarLogs();
  }

  cargarLogs(): void {
    this.cargando.set(true);
    this.error.set(null);

    this.auditLogsService.obtenerMisLogs().subscribe({
      next: (data) => {
        this.logs.set(data);
        this.cargando.set(false);
      },
      error: (err) => {
        console.error('Error al cargar logs:', err);
        this.error.set('No se pudo cargar el historial de actividad. Por favor, inténtalo más tarde.');
        this.cargando.set(false);
      }
    });
  }

  formatearFecha(fechaStr: string): string {
    if (!fechaStr) return '';
    try {
      const fecha = new Date(fechaStr);
      return fecha.toLocaleDateString('es-ES', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
    } catch {
      return fechaStr;
    }
  }

  obtenerBrowser(userAgent: string): string {
    if (!userAgent) return 'Dispositivo Desconocido';
    const ua = userAgent.toLowerCase();
    if (ua.includes('firefox')) return 'Firefox';
    if (ua.includes('chrome') && !ua.includes('edge') && !ua.includes('opr')) return 'Google Chrome';
    if (ua.includes('safari') && !ua.includes('chrome')) return 'Safari';
    if (ua.includes('edge')) return 'Microsoft Edge';
    if (ua.includes('opr') || ua.includes('opera')) return 'Opera';
    return 'Navegador Web';
  }

  obtenerPlataforma(userAgent: string): string {
    if (!userAgent) return '';
    const ua = userAgent.toLowerCase();
    if (ua.includes('windows')) return 'Windows';
    if (ua.includes('macintosh') || ua.includes('mac os')) return 'macOS';
    if (ua.includes('linux')) return 'Linux';
    if (ua.includes('android')) return 'Android';
    if (ua.includes('iphone') || ua.includes('ipad')) return 'iOS';
    return 'OS';
  }

  obtenerMetodoBadgeClase(metodo: string): string {
    switch (metodo?.toUpperCase()) {
      case 'GET': return 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20';
      case 'POST': return 'bg-sky-500/10 text-sky-400 border border-sky-500/20';
      case 'PUT':
      case 'PATCH': return 'bg-amber-500/10 text-amber-400 border border-amber-500/20';
      case 'DELETE': return 'bg-rose-500/10 text-rose-400 border border-rose-500/20';
      default: return 'bg-zinc-500/10 text-zinc-400 border border-zinc-500/20';
    }
  }
}
