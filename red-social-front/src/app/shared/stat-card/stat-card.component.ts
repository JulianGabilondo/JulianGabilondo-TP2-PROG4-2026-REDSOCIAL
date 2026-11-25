import { Component, OnDestroy, OnInit, computed, input, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { Observable, Subscription } from 'rxjs';
import { mensajeError } from '../../core/http-errors';
import { ChartComponent, TipoGrafico } from '../chart/chart.component';

// Datos que necesita un gráfico
export interface DatosGrafico {
  etiquetas: string[];
  datos: number[];
  total?: number; // si viene, se muestra "Total en el lapso"
}

// Devuelve "YYYY-MM-DD" con la fecha local (no la UTC)
function fechaLocal(fecha: Date): string {
  const mes = String(fecha.getMonth() + 1).padStart(2, '0');
  const dia = String(fecha.getDate()).padStart(2, '0');
  return `${fecha.getFullYear()}-${mes}-${dia}`;
}

// SPRINT 4: tarjeta de una estadística. Tiene su propio selector de lapso de tiempo (desde y hasta)
// y muestra el gráfico con los datos que devuelve la función "fuente" para ese lapso.
@Component({
  selector: 'app-stat-card',
  standalone: true,
  imports: [ChartComponent],
  templateUrl: './stat-card.component.html',
})
export class StatCardComponent implements OnInit, OnDestroy {
  titulo = input.required<string>();
  descripcion = input('');
  tipo = input.required<TipoGrafico>();
  nombreDatos = input('Cantidad');
  horizontal = input(false);
  // Función que pide los datos al back para el lapso elegido
  fuente = input.required<(desde: string, hasta: string) => Observable<DatosGrafico>>();

  readonly hoy = fechaLocal(new Date());
  // Por defecto, los últimos 7 días
  desde = signal(fechaLocal(new Date(Date.now() - 6 * 24 * 60 * 60 * 1000)));
  hasta = signal(this.hoy);

  cargando = signal(false);
  error = signal('');
  resultado = signal<DatosGrafico | null>(null);

  private peticion?: Subscription;

  rangoValido = computed(() => !!this.desde() && !!this.hasta() && this.desde() <= this.hasta());
  // No hay nada para graficar si no hay datos o si todos son cero
  vacio = computed(() => {
    const r = this.resultado();
    return !r || r.datos.length === 0 || r.datos.every((n) => n === 0);
  });

  ngOnInit() {
    this.cargar();
  }

  ngOnDestroy() {
    this.peticion?.unsubscribe();
  }

  cambiarDesde(event: Event) {
    this.desde.set((event.target as HTMLInputElement).value);
    this.cargar();
  }

  cambiarHasta(event: Event) {
    this.hasta.set((event.target as HTMLInputElement).value);
    this.cargar();
  }

  // Pide los datos del lapso elegido. Si había una petición anterior en curso, se cancela.
  private cargar() {
    this.peticion?.unsubscribe();
    if (!this.rangoValido()) return;

    this.cargando.set(true);
    this.error.set('');
    this.peticion = this.fuente()(this.desde(), this.hasta()).subscribe({
      next: (datos) => {
        this.resultado.set(datos);
        this.cargando.set(false);
      },
      error: (err: HttpErrorResponse) => {
        this.cargando.set(false);
        this.error.set(mensajeError(err));
      },
    });
  }
}