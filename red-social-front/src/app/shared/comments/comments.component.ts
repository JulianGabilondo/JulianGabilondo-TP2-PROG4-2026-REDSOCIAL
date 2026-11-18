import { DatePipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, computed, inject, input, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../core/auth.service';
import { Comentario, CommentsService } from '../../core/comments.service';
import { mensajeError } from '../../core/http-errors';
import { ModalComponent, ModalDatos } from '../modal/modal.component';

// SPRINT 3: comentarios de una publicación.
// - Los más recientes van primero, uno debajo del otro.
// - La primera carga trae pocos; el botón "Cargar más" trae los siguientes sin perder los anteriores.
// - El autor de un comentario puede editarlo; un comentario editado muestra "(editado)".
@Component({
  selector: 'app-comments',
  standalone: true,
  imports: [ReactiveFormsModule, DatePipe, ModalComponent],
  templateUrl: './comments.component.html',
})
export class CommentsComponent implements OnInit {
  private fb = inject(FormBuilder);
  private servicio = inject(CommentsService);
  private auth = inject(AuthService);

  publicacionId = input.required<string>();
  // En Mi Perfil los comentarios se muestran solo para leer
  soloLectura = input(false);
  // Cantidad de comentarios por carga
  limite = input(5);

  comentarios = signal<Comentario[]>([]);
  total = signal(0);
  cargando = signal(false);
  cargandoMas = signal(false);
  enviando = signal(false);
  guardandoEdicion = signal(false);
  errorCarga = signal('');
  editandoId = signal<string | null>(null);
  modal = signal<ModalDatos | null>(null);

  // Hay más comentarios para traer si los cargados son menos que el total
  hayMas = computed(() => this.comentarios().length < this.total());

  // Controles de los textos (nuevo comentario y edición)
  nuevo = this.fb.nonNullable.control('', [
    Validators.required,
    Validators.maxLength(500),
    Validators.pattern(/\S/),
  ]);
  edicion = this.fb.nonNullable.control('', [
    Validators.required,
    Validators.maxLength(500),
    Validators.pattern(/\S/),
  ]);

  ngOnInit() {
    this.cargarInicial();
  }

  esMio(c: Comentario): boolean {
    return c.usuario._id === this.auth.usuario()?._id;
  }

  // Primera carga: solo una cantidad limitada de comentarios
  cargarInicial() {
    this.cargando.set(true);
    this.errorCarga.set('');
    this.servicio.listar(this.publicacionId(), { limit: this.limite(), offset: 0 }).subscribe({
      next: (res) => {
        this.comentarios.set(res.data);
        this.total.set(res.total);
        this.cargando.set(false);
      },
      error: (err: HttpErrorResponse) => {
        this.cargando.set(false);
        this.errorCarga.set(mensajeError(err));
      },
    });
  }

  // "Cargar más": se piden los siguientes (offset = los que ya están cargados) y se AGREGAN al final
  cargarMas() {
    if (this.cargandoMas()) return;
    this.cargandoMas.set(true);

    this.servicio
      .listar(this.publicacionId(), { limit: this.limite(), offset: this.comentarios().length })
      .subscribe({
        next: (res) => {
          this.comentarios.update((lista) => [...lista, ...res.data]);
          this.total.set(res.total);
          this.cargandoMas.set(false);
        },
        error: (err: HttpErrorResponse) => {
          this.cargandoMas.set(false);
          this.modal.set({ titulo: 'No pudimos cargar más comentarios', mensaje: mensajeError(err), tipo: 'error' });
        },
      });
  }

  // Escribe un comentario nuevo
  enviar() {
    if (this.nuevo.invalid) {
      this.nuevo.markAsTouched();
      return;
    }

    this.enviando.set(true);
    this.servicio.crear(this.publicacionId(), this.nuevo.value).subscribe({
      next: (comentario) => {
        // El nuevo es el más reciente: va arriba. El "total" sube para que "Cargar más" siga bien.
        this.comentarios.update((lista) => [comentario, ...lista]);
        this.total.update((t) => t + 1);
        this.nuevo.reset('');
        this.enviando.set(false);
      },
      error: (err: HttpErrorResponse) => {
        this.enviando.set(false);
        this.modal.set({ titulo: 'No pudimos publicar tu comentario', mensaje: mensajeError(err), tipo: 'error' });
      },
    });
  }

  // ---------- Edición ----------
  empezarEdicion(c: Comentario) {
    this.edicion.setValue(c.mensaje);
    this.edicion.markAsUntouched();
    this.editandoId.set(c._id);
  }

  cancelarEdicion() {
    this.editandoId.set(null);
  }

  guardarEdicion(c: Comentario) {
    if (this.edicion.invalid) {
      this.edicion.markAsTouched();
      return;
    }

    this.guardandoEdicion.set(true);
    this.servicio.editar(this.publicacionId(), c._id, this.edicion.value).subscribe({
      next: (actualizado) => {
        // Se reemplaza el comentario en la lista; ahora trae modificado: true
        this.comentarios.update((lista) => lista.map((x) => (x._id === actualizado._id ? actualizado : x)));
        this.guardandoEdicion.set(false);
        this.editandoId.set(null);
      },
      error: (err: HttpErrorResponse) => {
        this.guardandoEdicion.set(false);
        this.modal.set({ titulo: 'No pudimos guardar el cambio', mensaje: mensajeError(err), tipo: 'error' });
      },
    });
  }
}