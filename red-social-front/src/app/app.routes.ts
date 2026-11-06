import { Routes } from '@angular/router';
import { MainLayoutComponent } from './shared/main-layout/main-layout.component';

// SPRINT 1: navegación libre entre pantallas (sin guards, el enunciado lo pide así).
// Los guards y la protección de rutas llegan en el Sprint 3.
export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'login' },

  // Pantallas de acceso (sin barra de navegación)
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login.component').then((m) => m.LoginComponent),
  },
  {
    path: 'registro',
    loadComponent: () => import('./pages/register/register.component').then((m) => m.RegisterComponent),
  },

  // Pantallas con barra de navegación (usan el layout como contenedor)
  {
    path: '',
    component: MainLayoutComponent,
    children: [
      {
        path: 'publicaciones',
        loadComponent: () =>
          import('./pages/publications/publications.component').then((m) => m.PublicationsComponent),
      },
      {
        path: 'perfil',
        loadComponent: () => import('./pages/profile/profile.component').then((m) => m.ProfileComponent),
      },
    ],
  },

  { path: '**', redirectTo: 'login' },
];