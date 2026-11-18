import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { SessionService } from './session.service';

// Agrega el token a las peticiones (SPRINT 2) y,
// SPRINT 3: si alguna petición devuelve 401, cierra la sesión y redirige al login para rehacer el token.
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const session = inject(SessionService);

  const token = localStorage.getItem('token');
  const peticion = token ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } }) : req;

  return next(peticion).pipe(
    catchError((err: HttpErrorResponse) => {
      // En el login, un 401 significa "credenciales inválidas": ahí se muestra el modal de error
      if (err.status === 401 && !req.url.includes('/auth/login')) {
        session.cerrarSesion();
      }
      return throwError(() => err);
    }),
  );
};