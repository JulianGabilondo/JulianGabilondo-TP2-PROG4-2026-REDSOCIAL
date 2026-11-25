import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';

// SPRINT 4: solo los usuarios con perfil de administrador pueden entrar al dashboard.
// Cualquier otro usuario vuelve a Publicaciones. (El back también lo valida: responde 403.)
export const adminGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  return auth.usuario()?.perfil === 'administrador' ? true : router.createUrlTree(['/publicaciones']);
};