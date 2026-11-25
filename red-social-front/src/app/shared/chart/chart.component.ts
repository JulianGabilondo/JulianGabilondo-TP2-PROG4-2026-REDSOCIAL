import { Component, DestroyRef, ElementRef, afterRenderEffect, inject, input, viewChild } from '@angular/core';
import { Chart, ChartConfiguration, registerables } from 'chart.js';

// Se registran todos los tipos de gráfico de Chart.js (torta, barras, líneas, etc.)
Chart.register(...registerables);

// Colores que se repiten en orden para las porciones o barras
const COLORES = ['#4f46e5', '#0ea5e9', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316', '#64748b'];

export type TipoGrafico = 'pie' | 'doughnut' | 'bar' | 'line';

// SPRINT 4: gráfico reutilizable (usa la librería Chart.js).
// Uso: <app-chart tipo="pie" [etiquetas]="['A', 'B']" [datos]="[3, 5]" />
@Component({
  selector: 'app-chart',
  standalone: true,
  template: `<div class="grafico"><canvas #lienzo></canvas></div>`,
})
export class ChartComponent {
  tipo = input.required<TipoGrafico>();
  etiquetas = input.required<string[]>();
  datos = input.required<number[]>();
  nombreDatos = input('Cantidad');
  // Solo para barras: true = barras horizontales (sirve para etiquetas largas)
  horizontal = input(false);

  private lienzo = viewChild<ElementRef<HTMLCanvasElement>>('lienzo');
  private grafico?: Chart;

  constructor() {
    // Se (re)dibuja el gráfico cuando está el <canvas> y cada vez que cambian los datos
    afterRenderEffect(() => {
      const canvas = this.lienzo()?.nativeElement;
      if (!canvas) return;

      this.grafico?.destroy();
      this.grafico = new Chart(canvas, this.configuracion());
    });

    inject(DestroyRef).onDestroy(() => this.grafico?.destroy());
  }

  private configuracion(): ChartConfiguration {
    const tipo = this.tipo();
    const circular = tipo === 'pie' || tipo === 'doughnut';
    const horizontal = tipo === 'bar' && this.horizontal();
    const colores = this.etiquetas().map((_, i) => COLORES[i % COLORES.length]);

    return {
      type: tipo,
      data: {
        labels: this.etiquetas(),
        datasets: [
          {
            label: this.nombreDatos(),
            data: this.datos(),
            backgroundColor: tipo === 'line' ? 'rgba(79, 70, 229, 0.15)' : colores,
            borderColor: tipo === 'line' ? '#4f46e5' : '#ffffff',
            borderWidth: tipo === 'line' ? 2 : circular ? 2 : 0,
            fill: tipo === 'line',
            tension: 0.3,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        indexAxis: horizontal ? 'y' : 'x',
        plugins: {
          // En la torta la leyenda explica los colores; en barras y líneas no hace falta
          legend: { display: circular, position: 'bottom' },
        },
        // Los ejes solo aplican a barras y líneas. "precision: 0" evita decimales (son conteos)
        scales: circular
          ? {}
          : {
              [horizontal ? 'x' : 'y']: { beginAtZero: true, ticks: { precision: 0 } },
            },
      },
    };
  }
}