import { Routes } from '@angular/router';
import { authGuard } from './core/auth.guard';
import { MainLayoutComponent } from './shared/main-layout/main-layout.component';
import { adminGuard } from './core/admin.guard';

export const routes: Routes = [
  // SPRINT 3: al iniciar la app se muestra la pantalla de carga, que valida el token
  // y redirige a publicaciones o al login
  {
    path: '',
    pathMatch: 'full',
    loadComponent: () => import('./pages/loading/loading.component').then((m) => m.LoadingComponent),
  },

  // Pantallas de acceso (sin barra de navegación)
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login.component').then((m) => m.LoginComponent),
  },
  {
    path: 'registro',
    loadComponent: () => import('./pages/register/register.component').then((m) => m.RegisterComponent),
  },

  // Pantallas internas (con barra de navegación). SPRINT 3: protegidas, solo con sesión iniciada.
  {
    path: '',
    component: MainLayoutComponent,
    canActivate: [authGuard],
    children: [
      {
        path: 'publicaciones',
        loadComponent: () =>
          import('./pages/publications/publications.component').then((m) => m.PublicationsComponent),
      },
      // SPRINT 3: página de una publicación con sus comentarios
      {
        path: 'publicaciones/:id',
        loadComponent: () =>
          import('./pages/publication-detail/publication-detail.component').then(
            (m) => m.PublicationDetailComponent,
          ),
      },
      {
        path: 'perfil',
        loadComponent: () => import('./pages/profile/profile.component').then((m) => m.ProfileComponent),
      },
       // SPRINT 4: dashboard, solo para administradores
      { path: 'dashboard', pathMatch: 'full', redirectTo: 'dashboard/usuarios' },
      {
        path: 'dashboard/usuarios',
        canActivate: [adminGuard],
        loadComponent: () =>
          import('./pages/dashboard-usuarios/dashboard-usuarios.component').then(
            (m) => m.DashboardUsuariosComponent,
          ),
      },
      {
        path: 'dashboard/estadisticas',
        canActivate: [adminGuard],
        loadComponent: () =>
          import('./pages/dashboard-estadisticas/dashboard-estadisticas.component').then(
            (m) => m.DashboardEstadisticasComponent,
          ),
      },
    ],
  },

  // Cualquier otra ruta vuelve a la pantalla de carga, que decide a dónde ir
  { path: '**', redirectTo: '' },
];