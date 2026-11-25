import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';

// SPRINT 3: protege las pantallas internas.
// - Sin token guardado: redirige al login.
// - Con token que todavía no se validó contra el back (al iniciar sesión, registrarse o recargar la
//   página): redirige a la pantalla de carga, que valida el token y después lleva a la pantalla pedida.
// - Con la sesión ya validada: deja pasar.
export const authGuard: CanActivateFn = (_route, state) => {
  const router = inject(Router);
  const auth = inject(AuthService);

  if (!localStorage.getItem('token')) {
    return router.createUrlTree(['/login']);
  }

  if (!auth.sesionValidada) {
    // "destino" es la pantalla que se quería abrir (por ejemplo /publicaciones o /perfil)
    return router.createUrlTree(['/'], { queryParams: { destino: state.url } });
  }

  return true;
};