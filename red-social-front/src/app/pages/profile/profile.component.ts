import { DatePipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/auth.service';
import { mensajeError } from '../../core/http-errors';
import { Publicacion, PublicationsService } from '../../core/publications.service';
import { fechaNoFutura } from '../../core/validators';
import { ModalComponent, ModalDatos } from '../../shared/modal/modal.component';
import { PublicationCardComponent } from '../../shared/publication-card/publication-card.component';
import { CommentsComponent } from '../../shared/comments/comments.component';
import { EdadPipe } from '../../shared/pipes/edad.pipe';

// Pantalla Mi Perfil: datos del usuario logueado.
// SPRINT 2: últimas 3 publicaciones y edición del perfil.
@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [DatePipe, ReactiveFormsModule, RouterLink, PublicationCardComponent, CommentsComponent, ModalComponent, EdadPipe],
  templateUrl: './profile.component.html',
})
export class ProfileComponent implements OnInit {
  auth = inject(AuthService);
  private servicio = inject(PublicationsService);
  private fb = inject(FormBuilder);

  // ---------- Últimas publicaciones ----------
  ultimas = signal<Publicacion[]>([]);
  cargando = signal(false);
  errorCarga = signal('');

  // ---------- SPRINT 2: edición del perfil ----------
  editando = signal(false);
  guardando = signal(false);
  archivo = signal<File | null>(null);
  vistaPrevia = signal<string | null>(null);
  errorArchivo = signal('');
  modal = signal<ModalDatos | null>(null);

  // Mismas validaciones que el registro (sin contraseña ni rol)
  form = this.fb.nonNullable.group({
    nombre: ['', [Validators.required]],
    apellido: ['', [Validators.required]],
    correo: ['', [Validators.required, Validators.email]],
    nombreUsuario: ['', [Validators.required, Validators.minLength(3)]],
    fechaNacimiento: ['', [Validators.required, fechaNoFutura]],
    descripcion: ['', [Validators.maxLength(200)]],
  });

  get f() {
    return this.form.controls;
  }

  ngOnInit() {
    this.cargarUltimas();
  }

  // Trae las últimas 3 publicaciones del usuario (filtro userId, limit 3)
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

  // Abre el formulario cargado con los datos actuales
  empezarEdicion() {
    const u = this.auth.usuario();
    if (!u) return;

    this.form.reset({
      nombre: u.nombre,
      apellido: u.apellido,
      correo: u.correo,
      nombreUsuario: u.nombreUsuario,
      fechaNacimiento: u.fechaNacimiento.slice(0, 10), // el input date espera yyyy-MM-dd
      descripcion: u.descripcion,
    });
    this.archivo.set(null);
    this.vistaPrevia.set(null);
    this.errorArchivo.set('');
    this.editando.set(true);
  }

  cancelarEdicion() {
    this.editando.set(false);
  }

  // Se ejecuta al elegir una foto nueva
  onArchivo(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    this.errorArchivo.set('');
    this.archivo.set(null);
    this.vistaPrevia.set(null);
    if (!file) return;

    // Mismas reglas que el back: imagen jpg/png/gif/webp de hasta 5 MB
    if (!/^image\/(jpeg|png|gif|webp)$/.test(file.type)) {
      this.errorArchivo.set('El archivo debe ser una imagen (jpg, png, gif o webp)');
      input.value = '';
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      this.errorArchivo.set('La imagen no puede superar los 5 MB');
      input.value = '';
      return;
    }

    this.archivo.set(file);
    this.vistaPrevia.set(URL.createObjectURL(file));
  }

  guardar() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    // FormData porque la foto viaja como archivo (el campo se llama "fotoPerfil", igual que en el back)
    const valores = this.form.getRawValue();
    const datos = new FormData();
    datos.append('nombre', valores.nombre);
    datos.append('apellido', valores.apellido);
    datos.append('correo', valores.correo);
    datos.append('nombreUsuario', valores.nombreUsuario);
    datos.append('fechaNacimiento', valores.fechaNacimiento);
    datos.append('descripcion', valores.descripcion);
    const archivo = this.archivo();
    if (archivo) {
      datos.append('fotoPerfil', archivo);
    }

    this.guardando.set(true);
    this.auth.actualizarPerfil(datos).subscribe({
      next: () => {
        this.guardando.set(false);
        this.editando.set(false);
        this.cargarUltimas(); // las publicaciones muestran el nombre y la foto del autor
        this.modal.set({
          titulo: 'Perfil actualizado',
          mensaje: 'Tus datos se guardaron correctamente.',
          tipo: 'exito',
        });
      },
      error: (err: HttpErrorResponse) => {
        this.guardando.set(false);
        this.modal.set({ titulo: 'No pudimos guardar los cambios', mensaje: mensajeError(err), tipo: 'error' });
      },
    });
  }
}