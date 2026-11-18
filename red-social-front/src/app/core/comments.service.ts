import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { AutorPublicacion } from './publications.service';

// SPRINT 3: forma de un comentario que devuelve el back
export interface Comentario {
  _id: string;
  mensaje: string;
  modificado: boolean; // true si fue editado
  createdAt: string;
  usuario: AutorPublicacion;
}

export interface ListaComentarios {
  data: Comentario[];
  total: number;
  limit: number;
  offset: number;
}

@Injectable({ providedIn: 'root' })
export class CommentsService {
  private http = inject(HttpClient);
  private api = `${environment.apiUrl}/publications`;

  // GET /publications/:id/comments?limit=&offset=
  listar(publicacionId: string, opciones: { limit: number; offset: number }): Observable<ListaComentarios> {
    const params = new HttpParams().set('limit', opciones.limit).set('offset', opciones.offset);
    return this.http.get<ListaComentarios>(`${this.api}/${publicacionId}/comments`, { params });
  }

  // POST /publications/:id/comments
  crear(publicacionId: string, mensaje: string): Observable<Comentario> {
    return this.http.post<Comentario>(`${this.api}/${publicacionId}/comments`, { mensaje });
  }

  // PUT /publications/:id/comments/:commentId
  editar(publicacionId: string, comentarioId: string, mensaje: string): Observable<Comentario> {
    return this.http.put<Comentario>(`${this.api}/${publicacionId}/comments/${comentarioId}`, { mensaje });
  }
}