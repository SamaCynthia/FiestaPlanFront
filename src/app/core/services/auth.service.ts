import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

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
  private readonly apiUrl = 'http://localhost:3000/auth';

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

  logout(): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/logout`, {}).pipe(
      tap(() => {
        this.rolActual.set(null);
        this.estaAutenticado.set(false);
      }),
    );
  }
}
