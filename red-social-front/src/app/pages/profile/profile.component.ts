import { DatePipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/auth.service';
import { mensajeError } from '../../core/http-errors';
import { Publicacion, PublicationsService } from '../../core/publications.service';
import { PublicationCardComponent } from '../../shared/publication-card/publication-card.component';

// Pantalla Mi Perfil: datos del usuario logueado.
// SPRINT 2: se agregan las últimas 3 publicaciones del usuario.
@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [DatePipe, RouterLink, PublicationCardComponent],
  templateUrl: './profile.component.html',
})
export class ProfileComponent implements OnInit {
  auth = inject(AuthService);
  private servicio = inject(PublicationsService);

  ultimas = signal<Publicacion[]>([]);
  cargando = signal(false);
  errorCarga = signal('');

  ngOnInit() {
    this.cargarUltimas();
  }

  // SPRINT 2: trae las últimas 3 publicaciones del usuario (filtro userId, limit 3)
  cargarUltimas() {
    const usuario = this.auth.usuario();
    if (!usuario) return;

    this.cargando.set(true);
    this.errorCarga.set('');
    this.servicio.listar({ limit: 3, offset: 0, sort: 'fecha', userId: usuario._id }).subscribe({
      next: (res) => {
        this.ultimas.set(res.data);
        this.cargando.set(false);
      },
      error: (err: HttpErrorResponse) => {
        this.cargando.set(false);
        this.errorCarga.set(mensajeError(err));
      },
    });
  }
}