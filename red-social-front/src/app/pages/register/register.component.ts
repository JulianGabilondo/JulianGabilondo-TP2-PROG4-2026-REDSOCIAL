import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/auth.service';
import { mensajeError } from '../../core/http-errors';
import { camposIguales, fechaNoFutura, passwordStrength } from '../../core/validators';
import { ModalComponent, ModalDatos } from '../../shared/modal/modal.component';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, ModalComponent],
  templateUrl: './register.component.html',
})
export class RegisterComponent {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private router = inject(Router);

  // SPRINT 1: campos pedidos: nombre, apellido, correo, nombre de usuario,
  // contraseña, repetir contraseña, fecha de nacimiento y descripción breve.
  form = this.fb.nonNullable.group(
    {
      nombre: ['', [Validators.required]],
      apellido: ['', [Validators.required]],
      correo: ['', [Validators.required, Validators.email]],
      nombreUsuario: ['', [Validators.required, Validators.minLength(3)]],
      password: ['', [Validators.required, Validators.minLength(8), passwordStrength]],
      repetirPassword: ['', [Validators.required]],
      fechaNacimiento: ['', [Validators.required, fechaNoFutura]],
      descripcion: ['', [Validators.maxLength(200)]],
    },
    // Validador del grupo: password y repetirPassword deben coincidir
    { validators: camposIguales('password', 'repetirPassword') },
  );

  // Foto de perfil (campo tipo file) y su vista previa
  archivo = signal<File | null>(null);
  vistaPrevia = signal<string | null>(null);
  errorArchivo = signal('');

  cargando = signal(false);
  modal = signal<ModalDatos | null>(null);

  get f() {
    return this.form.controls;
  }

  // Se ejecuta al elegir un archivo en el input type="file"
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

  enviar() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    // Se arma un FormData (y no un JSON) porque viaja un archivo.
    // OJO: NO se manda "repetirPassword", el back rechaza campos desconocidos.
    const valores = this.form.getRawValue();
    const datos = new FormData();
    datos.append('nombre', valores.nombre);
    datos.append('apellido', valores.apellido);
    datos.append('correo', valores.correo);
    datos.append('nombreUsuario', valores.nombreUsuario);
    datos.append('password', valores.password);
    datos.append('fechaNacimiento', valores.fechaNacimiento);
    datos.append('descripcion', valores.descripcion);
    const archivo = this.archivo();
    if (archivo) {
      datos.append('fotoPerfil', archivo); // el nombre debe coincidir con el del back
    }

    this.cargando.set(true);
    this.auth.register(datos).subscribe({
      next: () => {
        this.cargando.set(false);
        this.modal.set({
          titulo: '¡Cuenta creada!',
          mensaje: 'Tu usuario se registró correctamente. Ahora podés iniciar sesión.',
          tipo: 'exito',
        });
      },
      error: (err: HttpErrorResponse) => {
        this.cargando.set(false);
        this.modal.set({
          titulo: 'No pudimos crear tu cuenta',
          mensaje: mensajeError(err), // ej: "El correo o el nombre de usuario ya están registrados"
          tipo: 'error',
        });
      },
    });
  }

  // Si el registro fue exitoso, al cerrar el modal se va al login
  cerrarModal() {
    const fueExito = this.modal()?.tipo === 'exito';
    this.modal.set(null);
    if (fueExito) {
      this.router.navigate(['/login']);
    }
  }
}