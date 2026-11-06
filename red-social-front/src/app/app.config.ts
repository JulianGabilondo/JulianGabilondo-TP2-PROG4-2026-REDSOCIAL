import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';

import { routes } from './app.routes';
import { authInterceptor } from './core/auth.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    // SPRINT 2: ahora las peticiones HTTP pasan por el interceptor que agrega el token
    provideHttpClient(withInterceptors([authInterceptor])),
  ],
};