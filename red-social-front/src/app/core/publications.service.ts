import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

// SPRINT 2: autor de una publicación (datos públicos)
export interface AutorPublicacion {
  _id: string;
  nombre: string;
  apellido: string;
  nombreUsuario: string;
  fotoPerfil: string;
}

// SPRINT 2: forma de una publicación que devuelve el back
export interface Publicacion {
  _id: string;
  titulo: string;
  mensaje: string;
  imagen: string;
  usuario: AutorPublicacion;
  meGusta: string[]; // ids de los usuarios que dieron me gusta
  cantidadMeGusta: number;
  createdAt: string;
}

export interface ListaPublicaciones {
  data: Publicacion[];
  total: number;
  limit: number;
  offset: number;
}

export type Orden = 'fecha' | 'meGusta';

@Injectable({ providedIn: 'root' })
export class PublicationsService {
  private http = inject(HttpClient);
  private api = `${environment.apiUrl}/publications`;

  // GET /publications con orden, paginación y filtro opcional por usuario
  listar(opciones: { limit: number; offset: number; sort: Orden; userId?: string }): Observable<ListaPublicaciones> {
    let params = new HttpParams()
      .set('limit', opciones.limit)
      .set('offset', opciones.offset)
      .set('sort', opciones.sort);
    if (opciones.userId) {
      params = params.set('userId', opciones.userId);
    }
    return this.http.get<ListaPublicaciones>(this.api, { params });
  }

  // POST /publications (FormData porque puede incluir una imagen)
  crear(datos: FormData): Observable<unknown> {
    return this.http.post(this.api, datos);
  }

  // DELETE /publications/:id (baja lógica)
  eliminar(id: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.api}/${id}`);
  }

  // POST /publications/:id/likes
  darMeGusta(id: string): Observable<{ message: string; cantidadMeGusta: number }> {
    return this.http.post<{ message: string; cantidadMeGusta: number }>(`${this.api}/${id}/likes`, {});
  }

  // DELETE /publications/:id/likes
  quitarMeGusta(id: string): Observable<{ message: string; cantidadMeGusta: number }> {
    return this.http.delete<{ message: string; cantidadMeGusta: number }>(`${this.api}/${id}/likes`);
  }
}