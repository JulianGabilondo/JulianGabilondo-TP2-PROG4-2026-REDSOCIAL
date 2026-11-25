import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { forkJoin, timer } from 'rxjs';
import { AuthService } from '../../core/auth.service';

// SPRINT 3: tiempo mínimo (en milisegundos) que se muestra la pantalla de carga,
// para que el spinner se llegue a ver aunque el back responda rápido
const TIEMPO_MINIMO = 1000;

// SPRINT 3: pantalla de carga con spinner. Valida el token contra la ruta "authorize" del back:
// si es válido va a la pantalla que se quería abrir (por defecto Publicaciones); si no, al login.
@Component({
  selector: 'app-loading',
  standalone: true,
  templateUrl: './loading.component.html',
})
export class LoadingComponent implements OnInit {
  private auth = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  ngOnInit() {
    // Sin token guardado no hace falta preguntarle al back
    if (!localStorage.getItem('token')) {
      this.router.navigate(['/login'], { replaceUrl: true });
      return;
    }

    const destino = this.destinoSeguro();

    // Espera la respuesta de authorize Y el tiempo mínimo, lo que tarde más
    forkJoin([this.auth.autorizar(), timer(TIEMPO_MINIMO)]).subscribe({
      next: () => this.router.navigateByUrl(destino, { replaceUrl: true }),
      error: () => {
        // Token inválido o vencido (401) o servidor sin respuesta: se rehace el login
        this.auth.logout();
        this.router.navigate(['/login'], { replaceUrl: true });
      },
    });
  }

  // Solo se acepta una ruta interna de la app (que empiece con "/"), nunca una dirección externa
  private destinoSeguro(): string {
    const destino = this.route.snapshot.queryParamMap.get('destino');
    const esInterna = !!destino && destino.startsWith('/') && !destino.startsWith('//');
    const esPantallaDeAcceso = destino === '/' || destino?.startsWith('/login') || destino?.startsWith('/registro');
    return esInterna && !esPantallaDeAcceso ? destino : '/publicaciones';
  }
}