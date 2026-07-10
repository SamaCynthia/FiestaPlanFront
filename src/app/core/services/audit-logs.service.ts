import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface AuditLog {
  id: string;
  usuario_id: string;
  accion: string;
  descripcion: string;
  modulo: string;
  entidad_tipo?: string;
  entidad_id?: string;
  ip_origen: string;
  user_agent: string;
  metodo_http: string;
  endpoint: string;
  codigo_respuesta: number;
  exitoso: boolean;
  mensaje_error?: string;
  creado_en: string;
  usuario?: {
    id: string;
    nombres: string;
    apellidos: string;
    correo: string;
  };
}

@Injectable({
  providedIn: 'root',
})
export class AuditLogsService {
  private readonly baseUrl = `${environment.apiUrl}/perfil`;

  constructor(private http: HttpClient) {}

  /**
   * Obtiene los logs de auditoría del usuario actualmente autenticado.
   * GET /perfil/logs
   */
  obtenerMisLogs(): Observable<AuditLog[]> {
    return this.http.get<AuditLog[]>(`${this.baseUrl}/logs`);
  }

  /**
   * Obtiene todos los logs de auditoría registrados en el sistema (Solo Administrador).
   * GET /perfil/todos/logs
   */
  obtenerTodosLosLogs(): Observable<AuditLog[]> {
    return this.http.get<AuditLog[]>(`${this.baseUrl}/todos/logs`);
  }
}
