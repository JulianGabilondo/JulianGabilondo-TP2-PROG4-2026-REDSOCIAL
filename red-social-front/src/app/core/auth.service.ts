import { HttpClient } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment';

// Forma del usuario que devuelve el back
export interface Usuario {
  _id: string;
  nombre: string;
  apellido: string;
  correo: string;
  nombreUsuario: string;
  fechaNacimiento: string;
  descripcion: string;
  fotoPerfil: string;
  perfil: 'usuario' | 'administrador';
}

interface AuthResponse {
  message: string;
  user: Usuario;
  token: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private api = `${environment.apiUrl}/auth`;

  // Usuario logueado (se recupera del navegador si ya había iniciado sesión)
  usuario = signal<Usuario | null>(this.leerUsuario());

  // SPRINT 1: registro. Recibe un FormData porque incluye la foto de perfil (archivo).
  register(datos: FormData): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.api}/register`, datos);
  }

  // SPRINT 1: login. Si sale bien, guarda la sesión en el navegador.
  login(emailOrUsername: string, password: string): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${this.api}/login`, { emailOrUsername, password })
      .pipe(tap((res) => this.guardarSesion(res)));
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    this.usuario.set(null);
  }

  // Guarda token y usuario (el manejo completo del token se profundiza en el Sprint 3)
  private guardarSesion(res: AuthResponse): void {
    localStorage.setItem('token', res.token);
    localStorage.setItem('usuario', JSON.stringify(res.user));
    this.usuario.set(res.user);
  }

  private leerUsuario(): Usuario | null {
    try {
      const raw = localStorage.getItem('usuario');
      return raw ? (JSON.parse(raw) as Usuario) : null;
    } catch {
      return null;
    }
  }
}