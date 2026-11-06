import { DatePipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, computed, inject, input, linkedSignal, output, signal } from '@angular/core';
import { AuthService } from '../../core/auth.service';
import { mensajeError } from '../../core/http-errors';
import { Publicacion, PublicationsService } from '../../core/publications.service';
import { ModalComponent, ModalDatos } from '../modal/modal.component';

// SPRINT 2: cada publicación es un componente (lo pide el enunciado).
// Maneja por sí mismo el me gusta y la eliminación; al eliminar avisa al padre con "eliminada".
@Component({
  selector: 'app-publication-card',
  standalone: true,
  imports: [DatePipe, ModalComponent],
  templateUrl: './publication-card.component.html',
})
export class PublicationCardComponent {
  private auth = inject(AuthService);
  private servicio = inject(PublicationsService);

  publicacion = input.required<Publicacion>();
  eliminada = output<void>();

  // linkedSignal: toma el valor de la publicación, pero se puede modificar localmente
  // (al dar o quitar me gusta) y se reinicia si el padre le pasa datos nuevos.
  cantidad = linkedSignal(() => this.publicacion().cantidadMeGusta);
  leGusta = linkedSignal(() =>
    this.publicacion().meGusta.includes(this.auth.usuario()?._id ?? ''),
  );

  // Solo el autor ve el botón de eliminar (el administrador se agrega en el Sprint 4)
  esMia = computed(() => this.publicacion().usuario._id === this.auth.usuario()?._id);

  procesando = signal(false);
  modal = signal<ModalDatos | null>(null);

  // Da o quita el me gusta según el estado actual
  alternarMeGusta() {
    if (this.procesando()) return;
    this.procesando.set(true);

    const id = this.publicacion()._id;
    const dandoMeGusta = !this.leGusta();
    const peticion = dandoMeGusta ? this.servicio.darMeGusta(id) : this.servicio.quitarMeGusta(id);

    peticion.subscribe({
      next: (res) => {
        this.cantidad.set(res.cantidadMeGusta);
        this.leGusta.set(dandoMeGusta);
        this.procesando.set(false);
      },
      error: (err: HttpErrorResponse) => {
        this.procesando.set(false);
        this.modal.set({ titulo: 'No se pudo completar la acción', mensaje: mensajeError(err), tipo: 'error' });
      },
    });
  }

  // Abre el modal de confirmación (en lugar de confirm() o alert())
  pedirConfirmacion() {
    this.modal.set({
      titulo: 'Eliminar publicación',
      mensaje: '¿Seguro que querés eliminar esta publicación? Esta acción no se puede deshacer.',
      tipo: 'info',
      confirmar: true,
    });
  }

  confirmarEliminacion() {
    this.modal.set(null);
    this.procesando.set(true);

    this.servicio.eliminar(this.publicacion()._id).subscribe({
      next: () => {
        this.procesando.set(false);
        this.eliminada.emit(); // el padre vuelve a cargar el listado
      },
      error: (err: HttpErrorResponse) => {
        this.procesando.set(false);
        this.modal.set({ titulo: 'No se pudo eliminar', mensaje: mensajeError(err), tipo: 'error' });
      },
    });
  }
}