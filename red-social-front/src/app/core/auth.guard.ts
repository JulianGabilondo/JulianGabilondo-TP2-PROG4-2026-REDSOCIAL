import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

// SPRINT 3: solo se puede entrar a las pantallas internas con una sesión iniciada.
// Si no hay token guardado, redirige al login. (La validez del token la controla el back:
// si está vencido o es inválido responde 401 y el interceptor redirige al login.)
export const authGuard: CanActivateFn = () => {
  const router = inject(Router);
  return localStorage.getItem('token') ? true : router.createUrlTree(['/login']);
};