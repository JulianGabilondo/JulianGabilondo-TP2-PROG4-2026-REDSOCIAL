import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/auth.service';
import { mensajeError } from '../../core/http-errors';
import { passwordStrength } from '../../core/validators';
import { ModalComponent, ModalDatos } from '../../shared/modal/modal.component';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, ModalComponent],
  templateUrl: './login.component.html',
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private router = inject(Router);

  // SPRINT 1: formulario con validaciones.
  // El usuario puede ingresar su correo O su nombre de usuario.
  form = this.fb.nonNullable.group({
    emailOrUsername: ['', [Validators.required]],
    // Mínimo 8 caracteres, una mayúscula y un número
    password: ['', [Validators.required, Validators.minLength(8), passwordStrength]],
  });

  cargando = signal(false);
  modal = signal<ModalDatos | null>(null);

  // Atajo para usar f.password, f.emailOrUsername en el HTML
  get f() {
    return this.form.controls;
  }

  enviar() {
    // Si el formulario es inválido, marca todo como "tocado" para mostrar los errores
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.cargando.set(true);
    const { emailOrUsername, password } = this.form.getRawValue();

    this.auth.login(emailOrUsername, password).subscribe({
      next: () => {
        this.cargando.set(false);
        this.router.navigate(['/publicaciones']);
      },
      error: (err: HttpErrorResponse) => {
        this.cargando.set(false);
        // Modal en lugar de alert()
        this.modal.set({
          titulo: 'No pudimos iniciar sesión',
          mensaje: mensajeError(err),
          tipo: 'error',
        });
      },
    });
  }
}