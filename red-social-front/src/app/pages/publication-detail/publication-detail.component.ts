import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { mensajeError } from '../../core/http-errors';
import { Publicacion, PublicationsService } from '../../core/publications.service';
import { CommentsComponent } from '../../shared/comments/comments.component';
import { PublicationCardComponent } from '../../shared/publication-card/publication-card.component';

// SPRINT 3: página de una publicación, en grande, con sus comentarios
@Component({
  selector: 'app-publication-detail',
  standalone: true,
  imports: [RouterLink, PublicationCardComponent, CommentsComponent],
  templateUrl: './publication-detail.component.html',
})
export class PublicationDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private servicio = inject(PublicationsService);

  publicacion = signal<Publicacion | null>(null);
  cargando = signal(true);
  noEncontrada = signal(false);
  errorCarga = signal('');

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id') ?? '';

    this.servicio.obtener(id).subscribe({
      next: (p) => {
        this.publicacion.set(p);
        this.cargando.set(false);
      },
      error: (err: HttpErrorResponse) => {
        this.cargando.set(false);
        // 404 = no existe o fue eliminada; 400 = el id de la URL no es válido
        if (err.status === 404 || err.status === 400) {
          this.noEncontrada.set(true);
        } else {
          this.errorCarga.set(mensajeError(err));
        }
      },
    });
  }

  // Si se elimina la publicación desde esta página, se vuelve al listado
  volver() {
    this.router.navigate(['/publicaciones']);
  }
}