import { Component, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { StatsService } from '../../core/stats.service';
import { RecortarPipe } from '../../shared/pipes/recortar.pipe';
import { DatosGrafico, StatCardComponent } from '../../shared/stat-card/stat-card.component';

// SPRINT 4: dashboard/estadísticas (solo administradores).
// Tres gráficos de tipos distintos: torta, líneas y barras. Cada uno con su lapso de tiempo elegible.
@Component({
  selector: 'app-dashboard-estadisticas',
  standalone: true,
  imports: [StatCardComponent],
  templateUrl: './dashboard-estadisticas.component.html',
})
export class DashboardEstadisticasComponent {
  private stats = inject(StatsService);
  private recortar = new RecortarPipe(); // las pipes también se pueden usar desde el código

  // Gráfico de torta: publicaciones realizadas por cada usuario
  publicacionesPorUsuario = (desde: string, hasta: string): Observable<DatosGrafico> =>
    this.stats.publicacionesPorUsuario(desde, hasta).pipe(
      map((res) => ({
        etiquetas: res.data.map((d) => `@${d.nombreUsuario}`),
        datos: res.data.map((d) => d.cantidad),
        total: res.data.reduce((suma, d) => suma + d.cantidad, 0),
      })),
    );

  // Gráfico de líneas: comentarios realizados, día por día
  comentariosPorDia = (desde: string, hasta: string): Observable<DatosGrafico> =>
    this.stats.comentariosPorDia(desde, hasta).pipe(
      map((res) => ({
        // "2026-11-03" se muestra como "03/11"
        etiquetas: res.data.map((d) => d.fecha.slice(5).split('-').reverse().join('/')),
        datos: res.data.map((d) => d.cantidad),
        total: res.total,
      })),
    );

  // Gráfico de barras: comentarios en cada publicación (las 10 con más comentarios)
  comentariosPorPublicacion = (desde: string, hasta: string): Observable<DatosGrafico> =>
    this.stats.comentariosPorPublicacion(desde, hasta).pipe(
      map((res) => ({
        etiquetas: res.data.map((d) => this.recortar.transform(d.titulo, 28)),
        datos: res.data.map((d) => d.cantidad),
      })),
    );
}