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

  // SPRINT 3: indica si el token ya se validó contra el back (ruta authorize) en esta carga de la app.
  // Mientras sea false, el guard manda a la pantalla de carga antes de mostrar las pantallas internas.
  sesionValidada = false;

  // SPRINT 3: el registro también guarda el token (queda con la sesión iniciada)
  register(datos: FormData): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${this.api}/register`, datos)
      .pipe(tap((res) => this.guardarSesion(res)));
  }

  // SPRINT 1: login. Si sale bien, guarda el token y el usuario en el navegador.
  login(emailOrUsername: string, password: string): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${this.api}/login`, { emailOrUsername, password })
      .pipe(tap((res) => this.guardarSesion(res)));
  }

  // SPRINT 3: valida el token guardado contra el back (POST /auth/authorize).
  // Si es válido, actualiza los datos del usuario y marca la sesión como validada;
  // si no, el back responde 401.
  autorizar(): Observable<{ message: string; user: Usuario }> {
    return this.http.post<{ message: string; user: Usuario }>(`${this.api}/authorize`, {}).pipe(
      tap((res) => {
        localStorage.setItem('usuario', JSON.stringify(res.user));
        this.usuario.set(res.user);
        this.sesionValidada = true;
      }),
    );
  }

  // SPRINT 3: pide un token nuevo (POST /auth/refresh) y lo guarda
  refrescar(): Observable<{ message: string; token: string }> {
    return this.http
      .post<{ message: string; token: string }>(`${this.api}/refresh`, {})
      .pipe(tap((res) => localStorage.setItem('token', res.token)));
  }

  // Edición del perfil (PATCH /users/me). Actualiza el usuario guardado en el navegador.
  actualizarPerfil(datos: FormData): Observable<{ message: string; user: Usuario }> {
    return this.http
      .patch<{ message: string; user: Usuario }>(`${environment.apiUrl}/users/me`, datos)
      .pipe(
        tap((res) => {
          localStorage.setItem('usuario', JSON.stringify(res.user));
          this.usuario.set(res.user);
        }),
      );
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    this.usuario.set(null);
    this.sesionValidada = false; // la próxima sesión tendrá que validarse de nuevo
  }

  // Guarda token y usuario en el navegador. Es un token nuevo, así que falta validarlo
  // (lo hace la pantalla de carga antes de mostrar Publicaciones).
  private guardarSesion(res: AuthResponse): void {
    localStorage.setItem('token', res.token);
    localStorage.setItem('usuario', JSON.stringify(res.user));
    this.usuario.set(res.user);
    this.sesionValidada = false;
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