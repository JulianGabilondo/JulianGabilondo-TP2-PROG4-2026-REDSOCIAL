import { Directive, TemplateRef, ViewContainerRef, effect, inject } from '@angular/core';
import { AuthService } from '../../core/auth.service';

// SPRINT 4: directiva propia 1/3 (estructural). Muestra el elemento solo si el usuario
// logueado es administrador. Uso: <a *appSoloAdmin routerLink="/dashboard/usuarios">Usuarios</a>
@Directive({ selector: '[appSoloAdmin]', standalone: true })
export class SoloAdminDirective {
  private auth = inject(AuthService);
  private plantilla = inject(TemplateRef<unknown>);
  private contenedor = inject(ViewContainerRef);
  private visible = false;

  constructor() {
    // Se vuelve a evaluar cada vez que cambia el usuario logueado
    effect(() => {
      const esAdmin = this.auth.usuario()?.perfil === 'administrador';
      if (esAdmin && !this.visible) {
        this.contenedor.createEmbeddedView(this.plantilla);
        this.visible = true;
      } else if (!esAdmin && this.visible) {
        this.contenedor.clear();
        this.visible = false;
      }
    });
  }
}