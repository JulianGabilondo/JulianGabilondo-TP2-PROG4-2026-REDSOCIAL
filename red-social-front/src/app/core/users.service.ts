import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Usuario } from './auth.service';

// SPRINT 4: usuario tal como lo ve el administrador en el dashboard
export interface UsuarioAdmin extends Usuario {
  activo: boolean; // false = deshabilitado (baja lógica)
  createdAt: string;
}

interface RespuestaUsuario {
  message: string;
  user: UsuarioAdmin;
}

// SPRINT 4: administración de usuarios (solo administradores)
@Injectable({ providedIn: 'root' })
export class UsersService {
  private http = inject(HttpClient);
  private api = `${environment.apiUrl}/users`;

  // GET /users
  listar(): Observable<UsuarioAdmin[]> {
    return this.http.get<UsuarioAdmin[]>(this.api);
  }

  // POST /users (FormData porque incluye la foto de perfil)
  crear(datos: FormData): Observable<RespuestaUsuario> {
    return this.http.post<RespuestaUsuario>(this.api, datos);
  }

  // DELETE /users/:id (baja lógica)
  deshabilitar(id: string): Observable<RespuestaUsuario> {
    return this.http.delete<RespuestaUsuario>(`${this.api}/${id}`);
  }

  // POST /users/:id/enable (alta lógica)
  habilitar(id: string): Observable<RespuestaUsuario> {
    return this.http.post<RespuestaUsuario>(`${this.api}/${id}/enable`, {});
  }
}