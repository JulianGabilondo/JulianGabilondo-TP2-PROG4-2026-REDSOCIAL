import { Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../core/auth.service';

// SPRINT 3: pantalla de carga que se muestra al iniciar la aplicación.
// Mientras tanto valida el token contra la ruta "authorize" del back:
// si es válido va a Publicaciones; si no, al login.
@Component({
  selector: 'app-loading',
  standalone: true,
  templateUrl: './loading.component.html',
})
export class LoadingComponent implements OnInit {
  private auth = inject(AuthService);
  private router = inject(Router);

  ngOnInit() {
    // Sin token guardado no hace falta preguntarle al back
    if (!localStorage.getItem('token')) {
      this.router.navigate(['/login'], { replaceUrl: true });
      return;
    }

    this.auth.autorizar().subscribe({
      next: () => this.router.navigate(['/publicaciones'], { replaceUrl: true }),
      error: () => {
        // Token inválido o vencido (401) o servidor sin respuesta: se rehace el login
        this.auth.logout();
        this.router.navigate(['/login'], { replaceUrl: true });
      },
    });
  }
}