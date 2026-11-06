import { HttpErrorResponse } from '@angular/common/http';
import { Component, ElementRef, OnInit, computed, inject, signal, viewChild } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { mensajeError } from '../../core/http-errors';
import { Orden, Publicacion, PublicationsService } from '../../core/publications.service';
import { ModalComponent, ModalDatos } from '../../shared/modal/modal.component';
import { PublicationCardComponent } from '../../shared/publication-card/publication-card.component';

// SPRINT 2: listado de publicaciones con orden, paginación y alta de publicaciones
@Component({
  selector: 'app-publications',
  standalone: true,
  imports: [ReactiveFormsModule, PublicationCardComponent, ModalComponent],
  templateUrl: './publications.component.html',
})
export class PublicationsComponent implements OnInit {
  private fb = inject(FormBuilder);
  private servicio = inject(PublicationsService);

  // ---------- Formulario de nueva publicación ----------
  form = this.fb.nonNullable.group({
    titulo: ['', [Validators.required, Validators.maxLength(100), Validators.pattern(/\S/)]],
    mensaje: ['', [Validators.required, Validators.maxLength(1000), Validators.pattern(/\S/)]],
  });
  archivo = signal<File | null>(null);
  vistaPrevia = signal<string | null>(null);
  errorArchivo = signal('');
  publicando = signal(false);
  inputArchivo = viewChild<ElementRef<HTMLInputElement>>('inputArchivo');

  // ---------- Listado ----------
  readonly porPagina = 5; // cantidad limitada de publicaciones por página
  publicaciones = signal<Publicacion[]>([]);
  total = signal(0);
  pagina = signal(1); // empieza en 1
  orden = signal<Orden>('fecha'); // por fecha por defecto
  cargando = signal(false);
  totalPaginas = computed(() => Math.max(1, Math.ceil(this.total() / this.porPagina)));

  modal = signal<ModalDatos | null>(null);

  get f() {
    return this.form.controls;
  }

  ngOnInit() {
    this.cargar();
  }

  // Pide al back la página actual con el orden elegido (offset = publicaciones a saltear)
  cargar() {
    this.cargando.set(true);
    const offset = (this.pagina() - 1) * this.porPagina;

    this.servicio.listar({ limit: this.porPagina, offset, sort: this.orden() }).subscribe({
      next: (res) => {
        // Si eliminaste la última publicación de una página, vuelve a la anterior
        if (res.data.length === 0 && this.pagina() > 1 && res.total > 0) {
          this.pagina.update((p) => p - 1);
          this.cargar();
          return;
        }
        this.publicaciones.set(res.data);
        this.total.set(res.total);
        this.cargando.set(false);
      },
      error: (err: HttpErrorResponse) => {
        this.cargando.set(false);
        this.modal.set({ titulo: 'No pudimos cargar las publicaciones', mensaje: mensajeError(err), tipo: 'error' });
      },
    });
  }

  cambiarOrden(event: Event) {
    this.orden.set((event.target as HTMLSelectElement).value as Orden);
    this.pagina.set(1); // al cambiar el orden se vuelve a la primera página
    this.cargar();
  }

  irAPagina(numero: number) {
    if (numero < 1 || numero > this.totalPaginas()) return;
    this.pagina.set(numero);
    this.cargar();
  }

  // ---------- Alta de publicación ----------
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

  publicar() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    // FormData porque la imagen viaja como archivo (el campo se llama "imagen", igual que en el back)
    const { titulo, mensaje } = this.form.getRawValue();
    const datos = new FormData();
    datos.append('titulo', titulo);
    datos.append('mensaje', mensaje);
    const archivo = this.archivo();
    if (archivo) {
      datos.append('imagen', archivo);
    }

    this.publicando.set(true);
    this.servicio.crear(datos).subscribe({
      next: () => {
        this.publicando.set(false);
        this.limpiarFormulario();
        // La nueva publicación es la más reciente: se muestra la primera página ordenada por fecha
        this.orden.set('fecha');
        this.pagina.set(1);
        this.cargar();
        this.modal.set({ titulo: '¡Publicado!', mensaje: 'Tu publicación se creó correctamente.', tipo: 'exito' });
      },
      error: (err: HttpErrorResponse) => {
        this.publicando.set(false);
        this.modal.set({ titulo: 'No pudimos publicar', mensaje: mensajeError(err), tipo: 'error' });
      },
    });
  }

  private limpiarFormulario() {
    this.form.reset();
    this.archivo.set(null);
    this.vistaPrevia.set(null);
    this.errorArchivo.set('');
    const input = this.inputArchivo();
    if (input) {
      input.nativeElement.value = ''; // vacía el campo file
    }
  }
}