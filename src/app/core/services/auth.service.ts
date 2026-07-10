import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface RegisterPayload {
  nombres: string;
  apellidos: string;
  correo: string;
  fecha_nacimiento: string;
  password: string;
  genero?: string;
  telefono?: string;
  ciudad_residencia?: string;
}

export interface LoginPayload {
  correo: string;
  password: string;
}

export interface AuthResponse {
  rol: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly apiUrl = `${environment.apiUrl}/auth`;

  private readonly perfilUrl = `${environment.apiUrl}/perfil`;

  readonly rolActual = signal<string | null>(null);
  readonly estaAutenticado = signal<boolean>(false);

  constructor(private http: HttpClient) {}

  registrar(payload: RegisterPayload): Observable<{ message: string; rol: string }> {
    return this.http.post<{ message: string; rol: string }>(
      `${this.apiUrl}/registro`,
      payload,
    );
  }

  login(payload: LoginPayload): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, payload).pipe(
      tap((res) => {
        this.rolActual.set(res.rol);
        this.estaAutenticado.set(true);
      }),
    );
  }

  cargarPerfil(): Observable<any> {
    return this.http.get<any>(this.perfilUrl).pipe(
      tap({
        next: (res) => {
          // If response has rol (e.g. res.rol or res.rol.nombre), set it. Let's handle both.
          const rol = typeof res.rol === 'object' && res.rol ? res.rol.nombre : res.rol;
          this.rolActual.set(rol || 'usuario');
          this.estaAutenticado.set(true);
        },
        error: () => {
          this.rolActual.set(null);
          this.estaAutenticado.set(false);
        }
      })
    );
  }

  logout(): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/logout`, {}).pipe(
      tap(() => {
        this.rolActual.set(null);
        this.estaAutenticado.set(false);
      }),
    );
  }
}
