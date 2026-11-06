import { HttpInterceptorFn } from '@angular/common/http';

// SPRINT 2: agrega el token a todas las peticiones, así el back sabe quién es el usuario.
// (El manejo del vencimiento del token y el error 401 se completa en el Sprint 3.)
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = localStorage.getItem('token');
  if (!token) {
    return next(req);
  }
  return next(req.clone({ setHeaders: { Authorization: `Bearer ${token}` } }));
};