import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuditLogsService, AuditLog } from '../../core/services/audit-logs.service';

@Component({
  selector: 'app-admin-logs',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './logs.html',
  styleUrl: './logs.css'
})
export class AdminLogs implements OnInit {
  private auditLogsService = inject(AuditLogsService);
  protected readonly Math = Math;

  readonly allLogs = signal<AuditLog[]>([]);
  readonly cargando = signal(true);
  readonly error = signal<string | null>(null);

  // Filtros
  readonly filtroTexto = signal('');
  readonly filtroModulo = signal('todos');
  readonly filtroEstado = signal('todos');
  readonly filtroMetodo = signal('todos');

  // Paginación
  readonly paginaActual = signal(1);
  readonly itemsPorPagina = 10;

  // Log seleccionado para el panel lateral de detalles
  readonly logSeleccionado = signal<AuditLog | null>(null);

  ngOnInit(): void {
    this.cargarLogs();
  }

  cargarLogs(): void {
    this.cargando.set(true);
    this.error.set(null);
    this.logSeleccionado.set(null);

    this.auditLogsService.obtenerTodosLosLogs().subscribe({
      next: (data) => {
        // Ordenar por fecha descendente por si acaso el backend no lo hace
        const sorted = [...data].sort((a, b) => new Date(b.creado_en).getTime() - new Date(a.creado_en).getTime());
        this.allLogs.set(sorted);
        this.cargando.set(false);
      },
      error: (err) => {
        console.error('Error al cargar todos los logs:', err);
        this.error.set('No se pudieron recuperar los logs globales del sistema. Verifica tus privilegios de administrador.');
        this.cargando.set(false);
      }
    });
  }

  // Filtrado reactivo computado
  readonly logsFiltrados = computed(() => {
    const logs = this.allLogs();
    const texto = this.filtroTexto().toLowerCase().trim();
    const modulo = this.filtroModulo();
    const estado = this.filtroEstado();
    const metodo = this.filtroMetodo();

    return logs.filter((log) => {
      // 1. Filtro por texto (Usuario, Acción, Descripción, IP, Endpoint)
      const correoUsuario = log.usuario?.correo?.toLowerCase() || '';
      const nombreUsuario = `${log.usuario?.nombres} ${log.usuario?.apellidos}`.toLowerCase();
      const coincideTexto = !texto || 
        log.accion.toLowerCase().includes(texto) ||
        log.descripcion.toLowerCase().includes(texto) ||
        log.ip_origen.toLowerCase().includes(texto) ||
        log.endpoint.toLowerCase().includes(texto) ||
        correoUsuario.includes(texto) ||
        nombreUsuario.includes(texto);

      // 2. Filtro por módulo
      const coincideModulo = modulo === 'todos' || log.modulo.toLowerCase() === modulo.toLowerCase();

      // 3. Filtro por estado (exitoso / fallido)
      const coincideEstado = estado === 'todos' || 
        (estado === 'exitoso' && log.exitoso) || 
        (estado === 'fallido' && !log.exitoso);

      // 4. Filtro por método HTTP
      const coincideMetodo = metodo === 'todos' || log.metodo_http.toUpperCase() === metodo.toUpperCase();

      return coincideTexto && coincideModulo && coincideEstado && coincideMetodo;
    });
  });

  // Logs paginados computados
  readonly logsPaginados = computed(() => {
    const filtrados = this.logsFiltrados();
    const indexInicio = (this.paginaActual() - 1) * this.itemsPorPagina;
    const indexFin = indexInicio + this.itemsPorPagina;
    return filtrados.slice(indexInicio, indexFin);
  });

  // Estadísticas computadas para el dashboard
  readonly totalRegistros = computed(() => this.allLogs().length);
  
  readonly totalExitosos = computed(() => 
    this.allLogs().filter(l => l.exitoso).length
  );
  
  readonly totalFallidos = computed(() => 
    this.allLogs().filter(l => !l.exitoso).length
  );

  readonly tasaExito = computed(() => {
    const total = this.totalRegistros();
    if (total === 0) return 0;
    return Math.round((this.totalExitosos() / total) * 100);
  });

  readonly totalPaginas = computed(() => {
    const totalFiltrados = this.logsFiltrados().length;
    return Math.ceil(totalFiltrados / this.itemsPorPagina) || 1;
  });

  // Manejadores de entrada
  actualizarTexto(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.filtroTexto.set(input.value);
    this.paginaActual.set(1); // Reset a primera página al filtrar
  }

  actualizarModulo(event: Event): void {
    const select = event.target as HTMLSelectElement;
    this.filtroModulo.set(select.value);
    this.paginaActual.set(1);
  }

  actualizarEstado(event: Event): void {
    const select = event.target as HTMLSelectElement;
    this.filtroEstado.set(select.value);
    this.paginaActual.set(1);
  }

  actualizarMetodo(event: Event): void {
    const select = event.target as HTMLSelectElement;
    this.filtroMetodo.set(select.value);
    this.paginaActual.set(1);
  }

  cambiarPagina(nuevaPagina: number): void {
    if (nuevaPagina >= 1 && nuevaPagina <= this.totalPaginas()) {
      this.paginaActual.set(nuevaPagina);
    }
  }

  seleccionarLog(log: AuditLog): void {
    this.logSeleccionado.set(log);
  }

  cerrarDetalles(): void {
    this.logSeleccionado.set(null);
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
    return 'Navegador';
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
