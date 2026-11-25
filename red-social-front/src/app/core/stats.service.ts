import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface PublicacionesPorUsuario {
  usuarioId: string;
  nombreUsuario: string;
  nombre: string;
  apellido: string;
  cantidad: number;
}

export interface ComentariosPorDia {
  fecha: string; // YYYY-MM-DD
  cantidad: number;
}

export interface ComentariosPorPublicacion {
  publicacionId: string;
  titulo: string;
  cantidad: number;
}

// SPRINT 4: estadísticas para los gráficos (solo administradores). Las fechas son "YYYY-MM-DD".
@Injectable({ providedIn: 'root' })
export class StatsService {
  private http = inject(HttpClient);
  private api = `${environment.apiUrl}/stats`;

  publicacionesPorUsuario(desde: string, hasta: string): Observable<{ data: PublicacionesPorUsuario[] }> {
    return this.http.get<{ data: PublicacionesPorUsuario[] }>(`${this.api}/publications-by-user`, {
      params: this.rango(desde, hasta),
    });
  }

  comentariosPorDia(desde: string, hasta: string): Observable<{ total: number; data: ComentariosPorDia[] }> {
    return this.http.get<{ total: number; data: ComentariosPorDia[] }>(`${this.api}/comments-by-day`, {
      params: this.rango(desde, hasta),
    });
  }

  comentariosPorPublicacion(desde: string, hasta: string): Observable<{ data: ComentariosPorPublicacion[] }> {
    return this.http.get<{ data: ComentariosPorPublicacion[] }>(`${this.api}/comments-by-publication`, {
      params: this.rango(desde, hasta),
    });
  }

  private rango(desde: string, hasta: string): HttpParams {
    return new HttpParams().set('from', desde).set('to', hasta);
  }
}