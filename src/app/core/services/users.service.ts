import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface PerfilUsuario {
  uuid: string;
  nombres: string;
  apellidos: string;
  correo: string;
  fecha_nacimiento: string;
  genero: string;
  telefono?: string;
  ciudad_residencia?: string;
  foto_perfil_url?: string;
  activo: boolean;
  correo_verificado: boolean;
  rol: { nombre: string };
}

@Injectable({ providedIn: 'root' })
export class UsersService {
  private readonly apiUrl = 'http://localhost:3000/perfil';

  constructor(private http: HttpClient) {}

  obtenerPerfil(): Observable<PerfilUsuario> {
    return this.http.get<PerfilUsuario>(this.apiUrl);
  }

  actualizarPerfil(payload: Partial<PerfilUsuario>): Observable<any> {
    return this.http.patch(`${this.apiUrl}/actualizar`, payload);
  }
}
