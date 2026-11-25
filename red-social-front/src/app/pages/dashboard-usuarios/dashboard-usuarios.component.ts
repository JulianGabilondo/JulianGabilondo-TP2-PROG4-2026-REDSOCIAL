import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../core/auth.service';
import { mensajeError } from '../../core/http-errors';
import { UsersService, UsuarioAdmin } from '../../core/users.service';
import { camposIguales, fechaNoFutura, passwordStrength } from '../../core/validators';
import { LimiteCaracteresDirective } from '../../shared/directives/limite-caracteres.directive';
import { ResaltarDirective } from '../../shared/directives/resaltar.directive';
import { ModalComponent, ModalDatos } from '../../shared/modal/modal.component';
import { EdadPipe } from '../../shared/pipes/edad.pipe';
import { RecortarPipe } from '../../shared/pipes/recortar.pipe';
import { TiempoRelativoPipe } from '../../shared/pipes/tiempo-relativo.pipe';

// SPRINT 4: dashboard/usuarios (solo administradores).
// Listado de usuarios, alta de usuarios nuevos (con perfil "usuario" o "administrador")
// y alta/baja lógica (habilitar y deshabilitar).
@Component({
  selector: 'app-dashboard-usuarios',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    ModalComponent,
    EdadPipe,
    RecortarPipe,
    TiempoRelativoPipe,
    ResaltarDirective,
    LimiteCaracteresDirective,
  ],
  templateUrl: './dashboard-usuarios.component.html',
})
export class DashboardUsuariosComponent implements OnInit {
  private fb = inject(FormBuilder);
  private servicio = inject(UsersService);
  auth = inject(AuthService);

  // ---------- Listado ----------
  usuarios = signal<UsuarioAdmin[]>([]);
  cargando = signal(false);
  errorCarga = signal('');
  habilitados = computed(() => this.usuarios().filter((u) => u.activo).length);

  // ---------- Habilitar / deshabilitar ----------
  pendiente = signal<UsuarioAdmin | null>(null); // usuario que se está por habilitar o deshabilitar
  procesandoId = signal<string | null>(null);
  modal = signal<ModalDatos | null>(null);

  // ---------- Formulario de alta ----------
  mostrandoFormulario = signal(false);
  creando = signal(false);
  archivo = signal<File | null>(null);
  vistaPrevia = signal<string | null>(null);
  errorArchivo = signal('');

  // Mismos datos que el registro, más el perfil (dos radio buttons)
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
      perfil: ['usuario', [Validators.required]],
    },
    { validators: camposIguales('password', 'repetirPassword') },
  );

  get f() {
    return this.form.controls;
  }

  ngOnInit() {
    this.cargar();
  }

  cargar() {
    this.cargando.set(true);
    this.errorCarga.set('');
    this.servicio.listar().subscribe({
      next: (usuarios) => {
        this.usuarios.set(usuarios);
        this.cargando.set(false);
      },
      error: (err: HttpErrorResponse) => {
        this.cargando.set(false);
        this.errorCarga.set(mensajeError(err));
      },
    });
  }

  // ---------- Alta de usuarios ----------
  alternarFormulario() {
    this.mostrandoFormulario.update((v) => !v);
  }

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

  crear() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    // FormData porque viaja un archivo. "repetirPassword" no se manda: el back rechaza campos desconocidos.
    const v = this.form.getRawValue();
    const datos = new FormData();
    datos.append('nombre', v.nombre);
    datos.append('apellido', v.apellido);
    datos.append('correo', v.correo);
    datos.append('nombreUsuario', v.nombreUsuario);
    datos.append('password', v.password);
    datos.append('fechaNacimiento', v.fechaNacimiento);
    datos.append('descripcion', v.descripcion);
    datos.append('perfil', v.perfil);
    const archivo = this.archivo();
    if (archivo) {
      datos.append('fotoPerfil', archivo);
    }

    this.creando.set(true);
    this.servicio.crear(datos).subscribe({
      next: (res) => {
        this.creando.set(false);
        this.form.reset({ perfil: 'usuario' });
        this.archivo.set(null);
        this.vistaPrevia.set(null);
        this.mostrandoFormulario.set(false);
        this.cargar();
        this.modal.set({
          titulo: 'Usuario creado',
          mensaje: `Se creó el usuario @${res.user.nombreUsuario} con perfil ${res.user.perfil}.`,
          tipo: 'exito',
        });
      },
      error: (err: HttpErrorResponse) => {
        this.creando.set(false);
        this.modal.set({ titulo: 'No pudimos crear el usuario', mensaje: mensajeError(err), tipo: 'error' });
      },
    });
  }

  // ---------- Habilitar / deshabilitar ----------
  // Pide confirmación con un modal antes de cambiar el estado del usuario
  pedirConfirmacion(usuario: UsuarioAdmin) {
    this.pendiente.set(usuario);
    this.modal.set({
      titulo: usuario.activo ? 'Deshabilitar usuario' : 'Habilitar usuario',
      mensaje: usuario.activo
        ? `@${usuario.nombreUsuario} no va a poder ingresar a la aplicación hasta que lo vuelvas a habilitar.`
        : `@${usuario.nombreUsuario} va a poder volver a ingresar a la aplicación.`,
      tipo: 'info',
      confirmar: true,
    });
  }

  cerrarModal() {
    this.modal.set(null);
    this.pendiente.set(null);
  }

  confirmarCambio() {
    const usuario = this.pendiente();
    this.cerrarModal();
    if (!usuario) return;

    this.procesandoId.set(usuario._id);
    const peticion = usuario.activo
      ? this.servicio.deshabilitar(usuario._id)
      : this.servicio.habilitar(usuario._id);

    peticion.subscribe({
      next: (res) => {
        // Se actualiza solo esa fila del listado
        this.usuarios.update((lista) =>
          lista.map((u) => (u._id === usuario._id ? { ...u, activo: res.user.activo } : u)),
        );
        this.procesandoId.set(null);
        this.modal.set({ titulo: 'Listo', mensaje: res.message, tipo: 'exito' });
      },
      error: (err: HttpErrorResponse) => {
        this.procesandoId.set(null);
        this.modal.set({ titulo: 'No pudimos completar la acción', mensaje: mensajeError(err), tipo: 'error' });
      },
    });
  }
}